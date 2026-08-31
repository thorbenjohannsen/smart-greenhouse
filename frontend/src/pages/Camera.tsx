import {
    useState,
} from "react";

import {
    getCameraSnapshotUrl,
    takeCameraSnapshot,
} from "../services/api";

function Camera() {
    const [
        cameraImage,
        setCameraImage,
    ] =
        useState<string | null>(
            null
        );

    const [
        loading,
        setLoading,
    ] =
        useState(false);

    async function takePicture() {
        try {
            setLoading(true);

            await takeCameraSnapshot();

            setCameraImage(
                getCameraSnapshotUrl()
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <p className="eyebrow">
                KAMERA
            </p>

            <h1>
                Gewächshaus Kamera
            </h1>

            <p className="subtitle">
                Aktuelles Bild deines
                Gewächshauses.
            </p>

            <div
                className="camera-card"
                style={{
                    marginTop: "30px",
                    maxWidth: "700px",
                }}
            >
                {cameraImage ? (
                    <>
                        <img
                            src={cameraImage}
                            alt="Gewächshaus"
                            className="camera-image"
                        />

                        <button
                            className="secondary-button"
                            onClick={
                                takePicture
                            }
                        >
                            ↻ Neues Bild
                        </button>
                    </>
                ) : (
                    <div className="camera-content">
                        <span>📷</span>

                        <strong>
                            Kamera bereit
                        </strong>

                        <button
                            className="secondary-button"
                            onClick={
                                takePicture
                            }
                        >
                            {loading
                                ? "Aufnahme..."
                                : "Foto aufnehmen"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Camera;