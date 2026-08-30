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

type ComingSoonProps = {
  text?: string;
};

function ComingSoon({ text = "Bald verfügbar" }: ComingSoonProps) {
  return <span className="coming-soon">{text}</span>;
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
            {watering ? "..." : "💧 25 ml"}
          </button>

          <button
              disabled={watering}
              onClick={() => handleWater(50)}
          >
            {watering ? "..." : "💧 50 ml"}
          </button>

          <button
              disabled={watering}
              onClick={() => handleWater(100)}
          >
            {watering ? "..." : "💧 100 ml"}
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

  /*
   * Kamera
   */
  const [cameraImage, setCameraImage] =
      useState<string | null>(null);

  const [cameraLoading, setCameraLoading] =
      useState(false);

  const [cameraError, setCameraError] =
      useState<string | null>(null);

  /*
   * Backend-Daten laden
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
   *
   * Aktuell wird die Bewässerung im Backend
   * noch simuliert. Später steuert dieser Endpoint
   * den GPIO/MOSFET des Raspberry Pi.
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

  /*
   * Neues Kamerabild vom Raspberry Pi aufnehmen
   */
  async function takeCameraSnapshot() {
    try {
      setCameraLoading(true);
      setCameraError(null);

      const response = await fetch(
          `${API_URL}/api/camera/snapshot`,
          {
            method: "POST",
          }
      );

      if (!response.ok) {
        throw new Error(
            "Kameraaufnahme fehlgeschlagen"
        );
      }

      /*
       * Timestamp verhindert Browser-Caching.
       */
      setCameraImage(
          `${API_URL}/api/camera/snapshot?t=${Date.now()}`
      );
    } catch (err) {
      console.error(err);

      setCameraError(
          "Die Kamera konnte kein Bild aufnehmen."
      );
    } finally {
      setCameraLoading(false);
    }
  }

  function closeCamera() {
    setCameraImage(null);
    setCameraError(null);
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

              <button
                  className="nav-item nav-disabled"
                  disabled
              >
                <span>🌱</span>

                <div className="nav-content">
                  Pflanzen
                  <ComingSoon />
                </div>
              </button>

              <button
                  className="nav-item nav-disabled"
                  disabled
              >
                <span>💧</span>

                <div className="nav-content">
                  Bewässerung
                  <ComingSoon />
                </div>
              </button>

              <button
                  className="nav-item nav-disabled"
                  disabled
              >
                <span>📷</span>

                <div className="nav-content">
                  Kamera
                  <ComingSoon text="Detailansicht bald" />
                </div>
              </button>

              <button
                  className="nav-item nav-disabled"
                  disabled
              >
                <span>📊</span>

                <div className="nav-content">
                  Statistiken
                  <ComingSoon />
                </div>
              </button>
            </nav>
          </div>

          <button
              className="nav-item nav-disabled"
              disabled
          >
            <span>⚙</span>

            <div className="nav-content">
              Einstellungen
              <ComingSoon />
            </div>
          </button>
        </aside>

        <main className="main">
          <header className="topbar">
            <div>
              <p className="eyebrow">
                SMART GREENHOUSE
              </p>

              <h1>Guten Tag, Thorben 👋</h1>

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
              <div className="error-banner">
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

                <small className="mock-label">
                  Sensor folgt
                </small>
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

                <small className="mock-label">
                  Sensor folgt
                </small>
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

                <small className="mock-label">
                  Sensor folgt
                </small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💡</div>

              <div>
                <span>Beleuchtung</span>

                <strong>
                  {systemStatus?.light ? "AN" : "AUS"}
                </strong>

                <small className="mock-label">
                  Steuerung bald verfügbar
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

                <button
                    className="secondary-button unavailable-button"
                    disabled
                >
                  + Pflanze
                  <span>Bald verfügbar</span>
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
                    <div className="heading-with-badge">
                      <h2>Feuchtigkeit</h2>

                      <ComingSoon text="Demo-Daten" />
                    </div>

                    <p>
                      Verlauf der letzten 24 Stunden
                    </p>
                  </div>

                  <select disabled>
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
                  <div className="chart-overlay">
                    <span>📊</span>
                    <strong>
                      Messhistorie bald verfügbar
                    </strong>
                    <small>
                      Sobald die Sensordaten gespeichert
                      werden, erscheint hier der echte
                      Feuchtigkeitsverlauf.
                    </small>
                  </div>

                  <div className="chart-line chart-demo">
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
              {/* KAMERA */}
              <div className="camera-card">
                <div className="card-heading">
                  <div>
                    <h2>Kamera</h2>
                    <p>Gewächshaus</p>
                  </div>

                  <span
                      className={`live-badge ${
                          cameraImage
                              ? "camera-active"
                              : ""
                      }`}
                  >
                  ● {cameraImage ? "AKTIV" : "BEREIT"}
                </span>
                </div>

                <div className="camera-placeholder">
                  {cameraImage ? (
                      <div className="camera-preview">
                        <img
                            src={cameraImage}
                            alt="Aktuelles Bild des Gewächshauses"
                            className="camera-image"
                        />

                        <div className="camera-actions">
                          <button
                              className="secondary-button"
                              onClick={takeCameraSnapshot}
                              disabled={cameraLoading}
                          >
                            {cameraLoading
                                ? "Aktualisiere..."
                                : "↻ Neues Bild"}
                          </button>

                          <button
                              className="secondary-button camera-close-button"
                              onClick={closeCamera}
                          >
                            Schließen
                          </button>
                        </div>
                      </div>
                  ) : (
                      <div className="camera-content">
                        <span>📷</span>

                        <strong>
                          Kamera bereit
                        </strong>

                        <small>
                          Nimmt auf Knopfdruck ein aktuelles
                          Foto deines Gewächshauses auf.
                        </small>

                        {cameraError && (
                            <div className="camera-error">
                              ⚠️ {cameraError}
                            </div>
                        )}

                        <button
                            className="secondary-button"
                            style={{
                              marginTop: "14px",
                            }}
                            onClick={takeCameraSnapshot}
                            disabled={cameraLoading}
                        >
                          {cameraLoading
                              ? "Kamera startet..."
                              : "Kamera öffnen"}
                        </button>
                      </div>
                  )}
                </div>
              </div>

              {/* SCHNELLSTEUERUNG */}
              <div className="control-card">
                <div className="control-card-heading">
                  <h2>Schnellsteuerung</h2>

                  <ComingSoon />
                </div>

                <div className="control-row unavailable-control">
                  <div>
                  <span className="control-icon">
                    💡
                  </span>

                    <div>
                      <strong>
                        Pflanzenlicht
                      </strong>

                      <small>
                        Hardware noch nicht angeschlossen
                      </small>
                    </div>
                  </div>

                  <button
                      className="toggle"
                      disabled
                      title="Bald verfügbar"
                  >
                    <span />
                  </button>
                </div>

                <div className="control-row unavailable-control">
                  <div>
                  <span className="control-icon">
                    🌬️
                  </span>

                    <div>
                      <strong>Lüfter</strong>

                      <small>
                        Hardware noch nicht angeschlossen
                      </small>
                    </div>
                  </div>

                  <button
                      className="toggle"
                      disabled
                      title="Bald verfügbar"
                  >
                    <span />
                  </button>
                </div>

                <div className="control-row unavailable-control">
                  <div>
                  <span className="control-icon">
                    💧
                  </span>

                    <div>
                      <strong>
                        Globale Bewässerung
                      </strong>

                      <small>
                        Bald verfügbar
                      </small>
                    </div>
                  </div>

                  <button
                      className="toggle"
                      disabled
                      title="Bald verfügbar"
                  >
                    <span />
                  </button>
                </div>
              </div>

              {/* AKTIVITÄTEN */}
              <div className="activity-card">
                <div className="control-card-heading">
                  <h2>Letzte Aktivitäten</h2>

                  <ComingSoon text="Historie folgt" />
                </div>

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