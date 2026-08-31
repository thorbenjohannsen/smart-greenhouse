import {
    useEffect,
    useState,
} from "react";

import PlantCard from "../components/PlantCard";
import ComingSoon from "../components/ComingSoon";

import {
    getPlants,
    getSystemStatus,
    setPlantAutomation,
    waterPlant,
} from "../services/api";

import type {
    Plant,
    SystemStatus,
} from "../types/greenhouse";

function Dashboard() {
    const [plants, setPlants] =
        useState<Plant[]>([]);

    const [
        systemStatus,
        setSystemStatus,
    ] =
        useState<SystemStatus | null>(
            null
        );

    const [loading, setLoading] =
        useState(true);

    async function loadData() {
        try {
            const [
                plantsData,
                statusData,
            ] = await Promise.all([
                getPlants(),
                getSystemStatus(),
            ]);

            setPlants(plantsData);
            setSystemStatus(statusData);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleWater(
        plantId: number,
        amount: number
    ) {
        await waterPlant(
            plantId,
            amount
        );

        await loadData();
    }

    async function handleAutomation(
        plantId: number,
        enabled: boolean
    ) {
        await setPlantAutomation(
            plantId,
            enabled
        );

        setPlants(
            plants.map((plant) =>
                plant.id === plantId
                    ? {
                        ...plant,
                        autoWatering:
                        enabled,
                    }
                    : plant
            )
        );
    }

    return (
        <>
            <header className="topbar">
                <div>
                    <p className="eyebrow">
                        SMART GREENHOUSE
                    </p>

                    <h1>
                        Guten Tag, Thorben 👋
                    </h1>

                    <p className="subtitle">
                        Deinem Gewächshaus
                        geht es heute gut.
                    </p>
                </div>

                <div className="connection">
          <span
              className="connection-dot"
          />

                    {systemStatus?.status ===
                    "online"
                        ? "System online"
                        : "System offline"}
                </div>
            </header>

            <section className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        🌡️
                    </div>

                    <div>
            <span>
              Temperatur
            </span>

                        <strong>
                            {systemStatus
                                ? `${systemStatus.temperature} °C`
                                : "--"}
                        </strong>

                        <small>
                            Sensor folgt
                        </small>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        💨
                    </div>

                    <div>
            <span>
              Luftfeuchtigkeit
            </span>

                        <strong>
                            {systemStatus
                                ? `${systemStatus.humidity} %`
                                : "--"}
                        </strong>

                        <small>
                            Sensor folgt
                        </small>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        💧
                    </div>

                    <div>
            <span>
              Wassertank
            </span>

                        <strong>
                            {systemStatus
                                ? `${systemStatus.waterTank} %`
                                : "--"}
                        </strong>

                        <small>
                            Sensor folgt
                        </small>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        💡
                    </div>

                    <div>
            <span>
              Beleuchtung
            </span>

                        <strong>
                            AUS
                        </strong>

                        <small>
                            Bald verfügbar
                        </small>
                    </div>
                </div>
            </section>

            <div className="section-heading">
                <div>
                    <h2>
                        Deine Pflanzen
                    </h2>

                    <p>
                        Live-Status der
                        Bewässerung
                    </p>
                </div>

                <ComingSoon />
            </div>

            <div className="plant-grid">
                {loading && (
                    <p>
                        Pflanzen werden geladen...
                    </p>
                )}

                {plants.map((plant) => (
                    <PlantCard
                        key={plant.id}
                        plant={plant}
                        onWater={
                            handleWater
                        }
                        onToggleAutomation={
                            handleAutomation
                        }
                    />
                ))}
            </div>
        </>
    );
}

export default Dashboard;