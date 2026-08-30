import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "";

type Plant = {
  id: number;
  name: string;
  type: string;
  moisture: number;
  targetMin: number;
  targetMax: number;
  autoWatering: boolean;
  lastWatered: string | null;
};

type SystemStatus = {
  status: string;
  temperature: number;
  humidity: number;
  waterTank: number;
  light: boolean;
  fan: boolean;
};

function getMoistureStatus(
    moisture: number,
    min: number,
    max: number
): string {
  if (moisture < min) return "Zu trocken";
  if (moisture > max) return "Sehr feucht";

  return "Optimal";
}

type PlantCardProps = {
  plant: Plant;
  onWater: (plantId: number, amount: number) => Promise<void>;
  onToggleAutomation: (
      plantId: number,
      enabled: boolean
  ) => Promise<void>;
};

function PlantCard({
                     plant,
                     onWater,
                     onToggleAutomation,
                   }: PlantCardProps) {
  const [watering, setWatering] = useState(false);

  const status = getMoistureStatus(
      plant.moisture,
      plant.targetMin,
      plant.targetMax
  );

  async function handleWater(amount: number) {
    try {
      setWatering(true);

      await onWater(plant.id, amount);
    } finally {
      setWatering(false);
    }
  }

  return (
      <div className="plant-card">
        <div className="plant-header">
          <div className="plant-title">
            <div className="plant-icon">🌱</div>

            <div>
              <h3>{plant.name}</h3>
              <span>{plant.type}</span>
            </div>
          </div>

          <span
              className={`status ${
                  status === "Optimal"
                      ? "status-good"
                      : status === "Zu trocken"
                          ? "status-warning"
                          : "status-info"
              }`}
          >
          {status}
        </span>
        </div>

        <div className="moisture-section">
          <div className="moisture-row">
            <span>Bodenfeuchtigkeit</span>
            <strong>{plant.moisture}%</strong>
          </div>

          <div className="progress">
            <div
                className="progress-fill"
                style={{ width: `${plant.moisture}%` }}
            />
          </div>

          <div className="target">
            Zielbereich: {plant.targetMin}% – {plant.targetMax}%
          </div>
        </div>

        <div className="plant-info-row">
          <div>
            <span className="label">Automatik</span>

            <button
                className={`toggle ${
                    plant.autoWatering ? "active" : ""
                }`}
                onClick={() =>
                    onToggleAutomation(
                        plant.id,
                        !plant.autoWatering
                    )
                }
            >
              <span />
            </button>
          </div>

          <div>
            <span className="label">Zuletzt gegossen</span>

            <strong>
              {plant.lastWatered ?? "Noch nicht"}
            </strong>
          </div>
        </div>

        <div className="water-buttons">
          <button
              disabled={watering}
              onClick={() => handleWater(25)}
          >
            💧 25 ml
          </button>

          <button
              disabled={watering}
              onClick={() => handleWater(50)}
          >
            💧 50 ml
          </button>

          <button
              disabled={watering}
              onClick={() => handleWater(100)}
          >
            💧 100 ml
          </button>
        </div>
      </div>
  );
}

function App() {
  const [plants, setPlants] = useState<Plant[]>([]);

  const [systemStatus, setSystemStatus] =
      useState<SystemStatus | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [light, setLight] = useState(false);
  const [fan, setFan] = useState(false);
  const [wateringAutomation, setWateringAutomation] =
      useState(true);

  /*
   * Daten vom Backend laden
   */
  async function loadData() {
    try {
      setError(null);

      const [plantsResponse, statusResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/plants`),
            fetch(`${API_URL}/api/status`),
          ]);

      if (!plantsResponse.ok) {
        throw new Error(
            "Pflanzendaten konnten nicht geladen werden"
        );
      }

      if (!statusResponse.ok) {
        throw new Error(
            "Systemstatus konnte nicht geladen werden"
        );
      }

      const plantsData: Plant[] =
          await plantsResponse.json();

      const statusData: SystemStatus =
          await statusResponse.json();

      setPlants(plantsData);
      setSystemStatus(statusData);

      setLight(statusData.light);
      setFan(statusData.fan);
    } catch (err) {
      console.error(err);

      setError(
          "Keine Verbindung zum Greenhouse Backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /*
   * Pflanze gießen
   */
  async function waterPlant(
      plantId: number,
      amount: number
  ) {
    try {
      const response = await fetch(
          `${API_URL}/api/plants/${plantId}/water`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              amount,
            }),
          }
      );

      if (!response.ok) {
        throw new Error(
            "Bewässerung konnte nicht gestartet werden"
        );
      }

      const data = await response.json();

      console.log("Bewässerung:", data);

      /*
       * Backend-Daten neu laden,
       * damit "Zuletzt gegossen" aktualisiert wird.
       */
      await loadData();
    } catch (err) {
      console.error(err);

      alert(
          "Die Bewässerung konnte nicht gestartet werden."
      );
    }
  }

  /*
   * Automatische Bewässerung einer Pflanze
   */
  async function togglePlantAutomation(
      plantId: number,
      enabled: boolean
  ) {
    try {
      const response = await fetch(
          `${API_URL}/api/plants/${plantId}/automation`,
          {
            method: "PATCH",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              enabled,
            }),
          }
      );

      if (!response.ok) {
        throw new Error(
            "Automatik konnte nicht geändert werden"
        );
      }

      setPlants((currentPlants) =>
          currentPlants.map((plant) =>
              plant.id === plantId
                  ? {
                    ...plant,
                    autoWatering: enabled,
                  }
                  : plant
          )
      );
    } catch (err) {
      console.error(err);

      alert(
          "Die Bewässerungsautomatik konnte nicht geändert werden."
      );
    }
  }

  return (
      <div className="app">
        <aside className="sidebar">
          <div>
            <div className="logo">
              <div className="logo-icon">🌿</div>

              <div>
                <strong>GREENHOUSE</strong>
                <span>Smart Garden</span>
              </div>
            </div>

            <nav>
              <button className="nav-item active">
                <span>⌂</span>
                Übersicht
              </button>

              <button className="nav-item">
                <span>🌱</span>
                Pflanzen
              </button>

              <button className="nav-item">
                <span>💧</span>
                Bewässerung
              </button>

              <button className="nav-item">
                <span>📷</span>
                Kamera
              </button>

              <button className="nav-item">
                <span>📊</span>
                Statistiken
              </button>
            </nav>
          </div>

          <button className="nav-item">
            <span>⚙</span>
            Einstellungen
          </button>
        </aside>

        <main className="main">
          <header className="topbar">
            <div>
              <p className="eyebrow">
                SMART GREENHOUSE
              </p>

              <h1>Guten Tag 👋</h1>

              <p className="subtitle">
                Deinem Gewächshaus geht es heute gut.
              </p>
            </div>

            <div className="connection">
            <span
                className="connection-dot"
                style={{
                  background:
                      systemStatus?.status === "online"
                          ? "#6ce79f"
                          : "#ff6b6b",
                }}
            />

              {systemStatus?.status === "online"
                  ? "System online"
                  : "System offline"}
            </div>
          </header>

          {error && (
              <div
                  style={{
                    marginBottom: "20px",
                    padding: "14px 18px",
                    borderRadius: "12px",
                    background:
                        "rgba(255, 80, 80, 0.08)",
                    border:
                        "1px solid rgba(255, 80, 80, 0.15)",
                    color: "#ff9696",
                    fontSize: "13px",
                  }}
              >
                ⚠️ {error}
              </div>
          )}

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🌡️</div>

              <div>
                <span>Temperatur</span>

                <strong>
                  {systemStatus
                      ? `${systemStatus.temperature} °C`
                      : "--"}
                </strong>

                <small>Optimal</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💨</div>

              <div>
                <span>Luftfeuchtigkeit</span>

                <strong>
                  {systemStatus
                      ? `${systemStatus.humidity} %`
                      : "--"}
                </strong>

                <small>Optimal</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💧</div>

              <div>
                <span>Wassertank</span>

                <strong>
                  {systemStatus
                      ? `${systemStatus.waterTank} %`
                      : "--"}
                </strong>

                <small>Tankstatus</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💡</div>

              <div>
                <span>Beleuchtung</span>

                <strong>
                  {light ? "AN" : "AUS"}
                </strong>

                <small>
                  {light
                      ? "bis 21:00 Uhr"
                      : "ausgeschaltet"}
                </small>
              </div>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="plants-area">
              <div className="section-heading">
                <div>
                  <h2>Deine Pflanzen</h2>

                  <p>
                    Live-Status der Bewässerung
                  </p>
                </div>

                <button className="secondary-button">
                  + Pflanze
                </button>
              </div>

              <div className="plant-grid">
                {loading && (
                    <p>Pflanzen werden geladen...</p>
                )}

                {!loading &&
                    plants.map((plant) => (
                        <PlantCard
                            key={plant.id}
                            plant={plant}
                            onWater={waterPlant}
                            onToggleAutomation={
                              togglePlantAutomation
                            }
                        />
                    ))}
              </div>

              <div className="chart-card">
                <div className="section-heading">
                  <div>
                    <h2>Feuchtigkeit</h2>

                    <p>
                      Verlauf der letzten 24 Stunden
                    </p>
                  </div>

                  <select>
                    {plants.map((plant) => (
                        <option
                            key={plant.id}
                            value={plant.id}
                        >
                          {plant.name}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="chart">
                  <div className="chart-line">
                    <svg
                        viewBox="0 0 800 230"
                        preserveAspectRatio="none"
                        className="chart-svg"
                    >
                      <defs>
                        <linearGradient
                            id="chartGradient"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                        >
                          <stop
                              offset="0%"
                              stopColor="#72e7a9"
                              stopOpacity="0.35"
                          />

                          <stop
                              offset="100%"
                              stopColor="#72e7a9"
                              stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>

                      <path
                          d="
                        M0,155
                        C60,150 80,140 120,145
                        C170,150 180,165 230,160
                        C280,155 300,120 345,126
                        C390,132 410,148 460,140
                        C510,130 540,78 590,82
                        C640,85 650,110 700,102
                        C745,95 760,70 800,76
                        L800,230
                        L0,230
                        Z
                      "
                          fill="url(#chartGradient)"
                      />

                      <path
                          d="
                        M0,155
                        C60,150 80,140 120,145
                        C170,150 180,165 230,160
                        C280,155 300,120 345,126
                        C390,132 410,148 460,140
                        C510,130 540,78 590,82
                        C640,85 650,110 700,102
                        C745,95 760,70 800,76
                      "
                          fill="none"
                          stroke="#72e7a9"
                          strokeWidth="4"
                      />
                    </svg>
                  </div>

                  <div className="chart-labels">
                    <span>00:00</span>
                    <span>04:00</span>
                    <span>08:00</span>
                    <span>12:00</span>
                    <span>16:00</span>
                    <span>20:00</span>
                    <span>Jetzt</span>
                  </div>
                </div>
              </div>
            </div>

            <aside className="right-column">
              <div className="camera-card">
                <div className="card-heading">
                  <div>
                    <h2>Kamera</h2>
                    <p>Gewächshaus</p>
                  </div>

                  <span className="live-badge">
                  ● BEREIT
                </span>
                </div>

                <div className="camera-placeholder">
                  <div className="camera-content">
                    <span>📷</span>

                    <strong>
                      Kamera bereit
                    </strong>

                    <small>
                      Die Raspberry-Pi-Kamera kann
                      später hier auf Knopfdruck
                      gestartet werden.
                    </small>

                    <button
                        className="secondary-button"
                        style={{
                          marginTop: "14px",
                        }}
                    >
                      Kamera öffnen
                    </button>
                  </div>
                </div>
              </div>

              <div className="control-card">
                <h2>Schnellsteuerung</h2>

                <div className="control-row">
                  <div>
                  <span className="control-icon">
                    💡
                  </span>

                    <div>
                      <strong>
                        Pflanzenlicht
                      </strong>

                      <small>
                        06:30 – 21:00
                      </small>
                    </div>
                  </div>

                  <button
                      className={`toggle ${
                          light ? "active" : ""
                      }`}
                      onClick={() =>
                          setLight((current) => !current)
                      }
                  >
                    <span />
                  </button>
                </div>

                <div className="control-row">
                  <div>
                  <span className="control-icon">
                    🌬️
                  </span>

                    <div>
                      <strong>Lüfter</strong>
                      <small>Automatisch</small>
                    </div>
                  </div>

                  <button
                      className={`toggle ${
                          fan ? "active" : ""
                      }`}
                      onClick={() =>
                          setFan((current) => !current)
                      }
                  >
                    <span />
                  </button>
                </div>

                <div className="control-row">
                  <div>
                  <span className="control-icon">
                    💧
                  </span>

                    <div>
                      <strong>
                        Bewässerung
                      </strong>

                      <small>
                        {wateringAutomation
                            ? "Automatik aktiv"
                            : "Automatik aus"}
                      </small>
                    </div>
                  </div>

                  <button
                      className={`toggle ${
                          wateringAutomation
                              ? "active"
                              : ""
                      }`}
                      onClick={() =>
                          setWateringAutomation(
                              (current) => !current
                          )
                      }
                  >
                    <span />
                  </button>
                </div>
              </div>

              <div className="activity-card">
                <h2>Letzte Aktivitäten</h2>

                <div className="activity">
                  <span>💧</span>

                  <div>
                    <strong>
                      Bewässerungssystem
                    </strong>

                    <small>
                      Backend verbunden
                    </small>
                  </div>
                </div>

                <div className="activity">
                  <span>🌱</span>

                  <div>
                    <strong>
                      {plants.length} Pflanzen
                    </strong>

                    <small>
                      im System vorhanden
                    </small>
                  </div>
                </div>

                <div className="activity">
                  <span>📷</span>

                  <div>
                    <strong>
                      Kamera erkannt
                    </strong>

                    <small>
                      Raspberry Pi bereit
                    </small>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </main>
      </div>
  );
}

export default App;