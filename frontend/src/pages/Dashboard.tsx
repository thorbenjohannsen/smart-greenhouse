import {
    useEffect,
    useState,
} from "react";

import BedCard from "../components/BedCard";

import {
    getBeds,
    getSystemStatus,
    setBedAutomation,
    waterBed,
} from "../services/api";

import type {
    Bed,
    SystemStatus,
} from "../types/greenhouse";

function Dashboard() {
    const [beds, setBeds] =
        useState<Bed[]>([]);

    const [
        systemStatus,
        setSystemStatus,
    ] = useState<SystemStatus | null>(
        null
    );

    const [loading, setLoading] =
        useState(true);

    async function loadData() {
        try {
            const [
                bedsData,
                statusData,
            ] = await Promise.all([
                getBeds(),
                getSystemStatus(),
            ]);

            setBeds(bedsData);
            setSystemStatus(statusData);
        } catch (error) {
            console.error(
                "Dashboard konnte nicht geladen werden:",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleWater(
        bedId: number,
        amount: number
    ) {
        await waterBed(
            bedId,
            amount
        );

        await loadData();
    }

    async function handleAutomation(
        bedId: number,
        enabled: boolean
    ) {
        const updatedBed =
            await setBedAutomation(
                bedId,
                enabled
            );

        setBeds(
            (currentBeds) =>
                currentBeds.map(
                    (bed) =>
                        bed.id === bedId
                            ? updatedBed
                            : bed
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
                        Übersicht
                    </h1>

                    <p className="subtitle">
                        Status deiner Beete und
                        des Gewächshauses.
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
                            Innenraum
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
                            Innenraum
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
                            Füllstand
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
                            {systemStatus?.light
                                ? "AN"
                                : "AUS"}
                        </strong>

                        <small>
                            Steuerung folgt
                        </small>
                    </div>
                </div>
            </section>

            <div className="section-heading">
                <div>
                    <h2>
                        Deine Beete
                    </h2>

                    <p>
                        Feuchtigkeit und
                        Bewässerung im Überblick
                    </p>
                </div>
            </div>

            <div className="plant-grid">
                {loading && (
                    <p>
                        Beete werden geladen...
                    </p>
                )}

                {!loading &&
                    beds.map((bed) => (
                        <BedCard
                            key={bed.id}
                            bed={bed}
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