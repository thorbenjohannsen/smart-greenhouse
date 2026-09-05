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
    turnFanOn,
    turnFanOff,
} from "../services/api";

import type {
    Bed,
    SystemStatus,
} from "../types/greenhouse";


function Dashboard() {

    const [
        beds,
        setBeds
    ] = useState<Bed[]>([]);


    const [
        systemStatus,
        setSystemStatus
    ] = useState<SystemStatus | null>(
        null
    );


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        fanLoading,
        setFanLoading
    ] = useState(false);


    // ---------------------------------------------------------
    // LOAD DASHBOARD
    // ---------------------------------------------------------

    async function loadData() {

        try {

            const [
                bedsData,
                statusData
            ] = await Promise.all([
                getBeds(),
                getSystemStatus(),
            ]);


            setBeds(
                bedsData
            );


            setSystemStatus(
                statusData
            );

        } catch (error) {

            console.error(
                "Dashboard konnte nicht geladen werden:",
                error
            );

        } finally {

            setLoading(
                false
            );

        }

    }


    useEffect(
        () => {

            loadData();

        },
        []
    );


    // ---------------------------------------------------------
    // WATER BED
    // ---------------------------------------------------------

    async function handleWater(
        bedId: number,
        amount: number
    ) {

        try {

            await waterBed(
                bedId,
                amount
            );


            await loadData();

        } catch (error) {

            console.error(
                "Bewässerung fehlgeschlagen:",
                error
            );

        }

    }


    // ---------------------------------------------------------
    // AUTOMATION
    // ---------------------------------------------------------

    async function handleAutomation(
        bedId: number,
        enabled: boolean
    ) {

        try {

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

        } catch (error) {

            console.error(
                "Automatik konnte nicht geändert werden:",
                error
            );

        }

    }


    // ---------------------------------------------------------
    // FAN
    // ---------------------------------------------------------

    async function handleFanToggle() {

        if (
            !systemStatus ||
            fanLoading
        ) {
            return;
        }


        try {

            setFanLoading(
                true
            );


            if (
                systemStatus.fan
            ) {

                const response =
                    await turnFanOff();


                setSystemStatus(
                    (currentStatus) => {

                        if (!currentStatus) {
                            return currentStatus;
                        }


                        return {
                            ...currentStatus,
                            fan:
                            response.fan,
                        };

                    }
                );

            } else {

                const response =
                    await turnFanOn();


                setSystemStatus(
                    (currentStatus) => {

                        if (!currentStatus) {
                            return currentStatus;
                        }


                        return {
                            ...currentStatus,
                            fan:
                            response.fan,
                        };

                    }
                );

            }

        } catch (error) {

            console.error(
                "Lüfter konnte nicht geschaltet werden:",
                error
            );

        } finally {

            setFanLoading(
                false
            );

        }

    }


    return (
        <>
            {/* -------------------------------------------------
                HEADER
            ------------------------------------------------- */}

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


            {/* -------------------------------------------------
                SYSTEM STATUS
            ------------------------------------------------- */}

            <section className="stats-grid">

                {/* TEMPERATUR */}

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


                {/* LUFTFEUCHTIGKEIT */}

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


                {/* WASSERTANK */}

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


                {/* BELEUCHTUNG */}

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


                {/* LÜFTER */}

                <div className="stat-card fan-card">

                    <div className="stat-icon">
                        🌬️
                    </div>


                    <div className="fan-card-content">

                        <span>
                            Lüfter
                        </span>


                        <strong>

                            {systemStatus?.fan
                                ? "AN"
                                : "AUS"}

                        </strong>


                        <button
                            type="button"
                            className={`fan-button ${
                                systemStatus?.fan
                                    ? "active"
                                    : ""
                            }`}
                            disabled={
                                fanLoading ||
                                !systemStatus
                            }
                            onClick={
                                handleFanToggle
                            }
                        >

                            {fanLoading
                                ? "Schaltet..."
                                : systemStatus?.fan
                                    ? "Ausschalten"
                                    : "Einschalten"}

                        </button>

                    </div>

                </div>

            </section>


            {/* -------------------------------------------------
                BEDS
            ------------------------------------------------- */}

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
                    beds.map(
                        (bed) => (

                            <BedCard
                                key={
                                    bed.id
                                }
                                bed={
                                    bed
                                }
                                onWater={
                                    handleWater
                                }
                                onToggleAutomation={
                                    handleAutomation
                                }
                            />

                        )
                    )}

            </div>

        </>
    );
}


export default Dashboard;