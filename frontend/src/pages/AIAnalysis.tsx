import {
    useEffect,
    useState,
} from "react";

import {
    useSearchParams,
} from "react-router-dom";

import {
    getBed,
} from "../services/api";

import type {
    Bed,
} from "../types/greenhouse";


type AnalysisResult = {
    status: "healthy" | "warning" | "critical";

    score: number;

    summary: string;

    findings: string[];

    recommendation: string;

    prediction?: string;

    confidence?: number;
};


function AIAnalysis() {

    const [
        searchParams
    ] = useSearchParams();


    const bedIdParam =
        searchParams.get("bed");


    const bedId =
        bedIdParam
            ? Number(bedIdParam)
            : null;


    const [
        bed,
        setBed
    ] = useState<Bed | null>(
        null
    );


    const [
        bedLoading,
        setBedLoading
    ] = useState(false);


    const [
        image,
        setImage
    ] = useState<string | null>(
        null
    );


    const [
        file,
        setFile
    ] = useState<File | null>(
        null
    );


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        result,
        setResult
    ] =
        useState<AnalysisResult | null>(
            null
        );


    // ---------------------------------------------------------
    // BEET LADEN
    // ---------------------------------------------------------

    useEffect(() => {

        async function loadBed() {

            if (!bedId) {

                setBed(
                    null
                );

                return;

            }


            try {

                setBedLoading(
                    true
                );


                const data =
                    await getBed(
                        bedId
                    );


                setBed(
                    data
                );

            } catch (error) {

                console.error(
                    "Beet konnte nicht geladen werden:",
                    error
                );


                setBed(
                    null
                );

            } finally {

                setBedLoading(
                    false
                );

            }

        }


        loadBed();

    }, [bedId]);


    // ---------------------------------------------------------
    // BILD AUSWÄHLEN
    // ---------------------------------------------------------

    function handleImageChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {

        const selectedFile =
            event.target.files?.[0];


        if (!selectedFile) {
            return;
        }


        setFile(
            selectedFile
        );


        setResult(
            null
        );


        if (image) {

            URL.revokeObjectURL(
                image
            );

        }


        const imageUrl =
            URL.createObjectURL(
                selectedFile
            );


        setImage(
            imageUrl
        );

    }


    // ---------------------------------------------------------
    // ANALYSE
    // ---------------------------------------------------------

    async function analyseImage() {

        if (!file) {
            return;
        }


        try {

            setLoading(
                true
            );


            setResult(
                null
            );


            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            // Beet-Kontext mitsenden
            if (bed) {

                formData.append(
                    "bed_id",
                    bed.id.toString()
                );


                formData.append(
                    "plant_type",
                    bed.plantType
                );

            }


            const response =
                await fetch(
                    "http://greenhouse.local:5001/analyse",
                    {
                        method: "POST",
                        body: formData,
                    }
                );


            if (!response.ok) {

                let message =
                    `Analyse fehlgeschlagen: ${response.status}`;


                try {

                    const errorData =
                        await response.json();


                    if (
                        typeof errorData?.detail ===
                        "string"
                    ) {

                        message =
                            errorData.detail;

                    }

                } catch {
                    // JSON-Parsing ist hier nicht zwingend.
                }


                throw new Error(
                    message
                );

            }


            const data =
                await response.json();


            console.log(
                "AI response:",
                data
            );


            const analysis =
                data.analysis;


            setResult({
                status:
                    analysis?.status ??
                    "warning",

                score:
                    analysis?.score ??
                    0,

                summary:
                    analysis?.summary ??
                    "Die Analyse wurde abgeschlossen.",

                findings:
                    analysis?.findings ??
                    [
                        `Datei: ${
                            data.filename ??
                            file.name
                        }`,
                    ],

                recommendation:
                    analysis?.recommendation ??
                    "Beobachte die Pflanze weiter.",

                prediction:
                analysis?.prediction,

                confidence:
                analysis?.confidence,
            });

        } catch (error) {

            console.error(
                "Analyse fehlgeschlagen:",
                error
            );


            setResult({
                status:
                    "critical",

                score:
                    0,

                summary:
                    error instanceof Error
                        ? error.message
                        : "Das Bild konnte nicht analysiert werden.",

                findings: [
                    "Verbindung oder KI-Auswertung fehlgeschlagen",
                ],

                recommendation:
                    "Prüfe, ob der KI-Service auf dem Raspberry Pi läuft.",
            });

        } finally {

            setLoading(
                false
            );

        }

    }


    // ---------------------------------------------------------
    // RESET
    // ---------------------------------------------------------

    function resetImage() {

        if (image) {

            URL.revokeObjectURL(
                image
            );

        }


        setImage(
            null
        );


        setFile(
            null
        );


        setResult(
            null
        );

    }


    // ---------------------------------------------------------
    // STATUS LABEL
    // ---------------------------------------------------------

    function getStatusLabel(
        status: AnalysisResult["status"]
    ) {

        if (
            status === "healthy"
        ) {

            return "Optisch gesund";

        }


        if (
            status === "warning"
        ) {

            return "Auffälligkeiten erkannt";

        }


        return "Deutliche Auffälligkeiten";

    }


    return (
        <div className="ai-page">

            <div className="ai-header">

                <div>

                    <p className="eyebrow">
                        KI-PFLANZENANALYSE
                    </p>


                    <h1>
                        Pflanzengesundheit analysieren
                    </h1>


                    <p className="subtitle">

                        {bedLoading
                            ? "Beet wird geladen..."
                            : bed
                                ? `${bed.name} · ${bed.plantName}`
                                : "Lade ein aktuelles Bild einer Pflanze hoch."}

                    </p>

                </div>


                <div className="ai-beta">
                    AI · BETA
                </div>

            </div>


            {/* -------------------------------------------------
                BEET KONTEXT
            ------------------------------------------------- */}

            {bed && (

                <div className="ai-bed-context">

                    <div>

                        <span>
                            Aktives Beet
                        </span>

                        <strong>
                            {bed.name}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Pflanze
                        </span>

                        <strong>
                            {bed.plantName}
                        </strong>

                    </div>


                    <div>

                        <span>
                            KI-Profil
                        </span>

                        <strong>
                            {bed.plantType}
                        </strong>

                    </div>

                </div>

            )}


            <div className="ai-grid">

                {/* -------------------------------------------------
                    UPLOAD
                ------------------------------------------------- */}

                <section className="ai-upload-card">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Bild
                            </h2>


                            <p>
                                JPG, PNG oder WEBP
                            </p>

                        </div>

                    </div>


                    {!image ? (

                        <label className="ai-upload-zone">

                            <div className="ai-upload-icon">
                                📷
                            </div>


                            <strong>
                                Pflanzenbild auswählen
                            </strong>


                            <span>
                                Klicken, um ein Bild hochzuladen
                            </span>


                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleImageChange}
                                hidden
                            />

                        </label>

                    ) : (

                        <div className="ai-image-preview">

                            <img
                                src={image}
                                alt="Pflanzenvorschau"
                            />


                            <div className="ai-image-actions">

                                <label className="secondary-button">

                                    Bild ändern


                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleImageChange}
                                        hidden
                                    />

                                </label>


                                <button
                                    type="button"
                                    className="ai-remove-button"
                                    onClick={resetImage}
                                >
                                    Entfernen
                                </button>

                            </div>

                        </div>

                    )}


                    <button
                        type="button"
                        className="ai-analyse-button"
                        disabled={
                            !image ||
                            loading
                        }
                        onClick={
                            analyseImage
                        }
                    >

                        {loading
                            ? "KI analysiert..."
                            : "✨ Pflanze analysieren"}

                    </button>


                    <div className="ai-info">

                        <span>
                            ℹ️
                        </span>


                        <p>
                            Die Analyse ist eine visuelle Einschätzung
                            und ersetzt keine sichere Diagnose von
                            Krankheiten oder Nährstoffmängeln.
                        </p>

                    </div>

                </section>


                {/* -------------------------------------------------
                    RESULT
                ------------------------------------------------- */}

                <section className="ai-result-card">

                    {!result && !loading && (

                        <div className="ai-empty-result">

                            <div className="ai-empty-icon">
                                ✨
                            </div>


                            <strong>
                                Noch keine Analyse
                            </strong>


                            <p>

                                {bed
                                    ? `Analysiere ein Bild aus ${bed.name} (${bed.plantName}).`
                                    : "Lade links ein Bild hoch und starte die Pflanzenanalyse."}

                            </p>

                        </div>

                    )}


                    {loading && (

                        <div className="ai-loading">

                            <div className="ai-loader" />


                            <strong>
                                Bild wird analysiert
                            </strong>


                            <p>

                                {bed
                                    ? `KI-Profil ${bed.plantType} wird verwendet.`
                                    : "Das Bild wird an den Raspberry Pi übertragen."}

                            </p>

                        </div>

                    )}


                    {result && !loading && (

                        <>

                            <div className="ai-result-header">

                                <div>

                                    <p className="eyebrow">
                                        ANALYSEERGEBNIS
                                    </p>


                                    <h2>
                                        Optischer Gesundheitszustand
                                    </h2>

                                </div>


                                <div
                                    className={`ai-health-score ${result.status}`}
                                >

                                    {result.score}

                                    <small>
                                        /100
                                    </small>

                                </div>

                            </div>


                            <div
                                className={`ai-health-status ${result.status}`}
                            >

                                <span className="ai-health-dot" />


                                {getStatusLabel(
                                    result.status
                                )}

                            </div>


                            {result.prediction && (

                                <div className="ai-prediction">

                                    <span>
                                        Erkannte Klasse
                                    </span>


                                    <strong>
                                        {result.prediction}
                                    </strong>


                                    {typeof result.confidence ===
                                        "number" && (

                                            <small>

                                                {(result.confidence * 100).toFixed(
                                                    1
                                                )}
                                                % Konfidenz

                                            </small>

                                        )}

                                </div>

                            )}


                            <p className="ai-summary">
                                {result.summary}
                            </p>


                            <div className="ai-result-section">

                                <h3>
                                    Erkannte Informationen
                                </h3>


                                <div className="ai-findings">

                                    {result.findings.map(
                                        (
                                            finding,
                                            index
                                        ) => (

                                            <div
                                                className="ai-finding"
                                                key={`${finding}-${index}`}
                                            >

                                                <span>
                                                    ✓
                                                </span>


                                                {finding}

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>


                            <div className="ai-recommendation">

                                <div>
                                    💡
                                </div>


                                <div>

                                    <strong>
                                        Empfehlung
                                    </strong>


                                    <p>
                                        {result.recommendation}
                                    </p>

                                </div>

                            </div>

                        </>

                    )}

                </section>

            </div>


            <section className="ai-future-card">

                <div>

                    <span>
                        🌱
                    </span>


                    <div>

                        <strong>
                            Später mit Sensordaten kombinieren
                        </strong>


                        <p>
                            Bodenfeuchtigkeit, Temperatur,
                            Luftfeuchtigkeit und Bewässerung können
                            zukünftig zusammen mit dem Bild bewertet
                            werden.
                        </p>

                    </div>

                </div>


                <span className="coming-soon">
                    Bald verfügbar
                </span>

            </section>

        </div>
    );
}


export default AIAnalysis;