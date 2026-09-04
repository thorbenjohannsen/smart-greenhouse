import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate
} from "react-router-dom";

import type {
    Bed
} from "../types/greenhouse";

import {
    getBeds,
    setBedAutomation,
    waterBed,
} from "../services/api";


function Beds() {

    const navigate =
        useNavigate();


    const [
        beds,
        setBeds
    ] = useState<Bed[]>([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        wateringBedId,
        setWateringBedId
    ] = useState<number | null>(
        null
    );


    useEffect(
        () => {

            loadBeds();

        },
        []
    );


    async function loadBeds() {

        try {

            setLoading(
                true
            );


            const data =
                await getBeds();


            setBeds(
                data
            );

        } catch (error) {

            console.error(
                "Beete konnten nicht geladen werden:",
                error
            );

        } finally {

            setLoading(
                false
            );

        }
    }


    async function handleWater(
        bedId: number,
        amount: number
    ) {

        try {

            setWateringBedId(
                bedId
            );


            const response =
                await waterBed(
                    bedId,
                    amount
                );


            setBeds(
                (currentBeds) =>
                    currentBeds.map(
                        (bed) =>
                            bed.id === bedId
                                ? response.bed
                                : bed
                    )
            );

        } catch (error) {

            console.error(
                "Bewässerung fehlgeschlagen:",
                error
            );

        } finally {

            setWateringBedId(
                null
            );

        }
    }


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


    function handleAIAnalysis(
        bedId: number
    ) {

        navigate(
            `/ai?bed=${bedId}`
        );

    }


    if (loading) {

        return (
            <div className="page">
                <h1>
                    Beete werden geladen...
                </h1>
            </div>
        );

    }


    return (
        <div className="page">

            <div className="page-header">

                <div>

                    <p className="eyebrow">
                        GREENHOUSE
                    </p>

                    <h1>
                        Beete
                    </h1>

                    <p className="subtitle">
                        Verwalte Pflanzen,
                        Bewässerung und
                        Zielbereiche deiner Beete.
                    </p>

                </div>

            </div>


            <div className="beds-grid">

                {beds.map(
                    (bed) => (

                        <section
                            className="bed-card"
                            key={bed.id}
                        >

                            <div className="bed-card-header">

                                <div>

                                    <span className="bed-label">
                                        {bed.name}
                                    </span>

                                    <h2>
                                        {bed.plantName}
                                    </h2>

                                </div>


                                <div
                                    className={
                                        bed.moisture >=
                                        bed.targetMin &&
                                        bed.moisture <=
                                        bed.targetMax
                                            ? "bed-status healthy"
                                            : "bed-status warning"
                                    }
                                >

                                    {bed.moisture >=
                                    bed.targetMin &&
                                    bed.moisture <=
                                    bed.targetMax
                                        ? "Optimal"
                                        : "Prüfen"}

                                </div>

                            </div>


                            <div className="bed-moisture">

                                <div className="bed-moisture-top">

                                    <span>
                                        Bodenfeuchtigkeit
                                    </span>

                                    <strong>
                                        {bed.moisture} %
                                    </strong>

                                </div>


                                <div className="bed-progress">

                                    <div
                                        className="bed-progress-value"
                                        style={{
                                            width:
                                                `${Math.min(
                                                    bed.moisture,
                                                    100
                                                )}%`,
                                        }}
                                    />

                                </div>


                                <div className="bed-target">

                                    Zielbereich:{" "}

                                    {bed.targetMin}
                                    –
                                    {bed.targetMax}
                                    %

                                </div>

                            </div>


                            <div className="bed-info-grid">

                                <div>

                                    <span>
                                        Pflanzentyp
                                    </span>

                                    <strong>
                                        {bed.plantName}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Zuletzt bewässert
                                    </span>

                                    <strong>

                                        {bed.lastWatered
                                            ? new Date(
                                                bed.lastWatered
                                            ).toLocaleString(
                                                "de-DE"
                                            )
                                            : "Noch nie"}

                                    </strong>

                                </div>

                            </div>


                            <div className="bed-automation">

                                <div>

                                    <strong>
                                        Automatische Bewässerung
                                    </strong>

                                    <span>
                                        Bewässerung anhand des
                                        Feuchtigkeitssensors
                                    </span>

                                </div>


                                <label className="switch">

                                    <input
                                        type="checkbox"
                                        checked={
                                            bed.autoWatering
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                handleAutomation(
                                                    bed.id,
                                                    event
                                                        .target
                                                        .checked
                                                )
                                        }
                                    />

                                    <span className="slider" />

                                </label>

                            </div>


                            <div className="bed-actions">

                                <button
                                    type="button"
                                    onClick={
                                        () =>
                                            handleWater(
                                                bed.id,
                                                25
                                            )
                                    }
                                    disabled={
                                        wateringBedId ===
                                        bed.id
                                    }
                                >
                                    25 ml
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        () =>
                                            handleWater(
                                                bed.id,
                                                50
                                            )
                                    }
                                    disabled={
                                        wateringBedId ===
                                        bed.id
                                    }
                                >
                                    50 ml
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        () =>
                                            handleWater(
                                                bed.id,
                                                100
                                            )
                                    }
                                    disabled={
                                        wateringBedId ===
                                        bed.id
                                    }
                                >
                                    100 ml
                                </button>

                            </div>


                            <button
                                type="button"
                                className="bed-ai-button"
                                onClick={
                                    () =>
                                        handleAIAnalysis(
                                            bed.id
                                        )
                                }
                            >
                                ✨ KI-Analyse
                            </button>

                        </section>

                    )
                )}

            </div>

        </div>
    );
}


export default Beds;