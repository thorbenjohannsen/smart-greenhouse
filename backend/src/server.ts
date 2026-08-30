import express from "express";
import cors from "cors";
import { execFile } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CAMERA_DIRECTORY = path.join(
    __dirname,
    "../camera"
);

const CAMERA_IMAGE_PATH = path.join(
    CAMERA_DIRECTORY,
    "snapshot.jpg"
);

/*
 * Kameraordner automatisch erstellen
 */
if (!fs.existsSync(CAMERA_DIRECTORY)) {
    fs.mkdirSync(CAMERA_DIRECTORY, {
        recursive: true,
    });
}

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

const plants: Plant[] = [
    {
        id: 1,
        name: "Basilikum",
        type: "Kräuter",
        moisture: 54,
        targetMin: 45,
        targetMax: 65,
        autoWatering: true,
        lastWatered: null,
    },

    {
        id: 2,
        name: "Chili",
        type: "Gemüse",
        moisture: 38,
        targetMin: 35,
        targetMax: 55,
        autoWatering: true,
        lastWatered: null,
    },
];

/*
 * Systemstatus
 *
 * Werte sind aktuell teilweise Mock-Daten.
 */
app.get("/api/status", (req, res) => {
    res.json({
        status: "online",

        temperature: 24.3,
        humidity: 64,
        waterTank: 74,

        light: false,
        fan: false,
    });
});

/*
 * Pflanzen abrufen
 */
app.get("/api/plants", (req, res) => {
    res.json(plants);
});

/*
 * Pflanze gießen
 *
 * Noch Simulation.
 * Später:
 *
 * Node
 * → GPIO
 * → MOSFET
 * → Pumpe
 */
app.post("/api/plants/:id/water", (req, res) => {
    const id = Number(req.params.id);

    const { amount } = req.body;

    const plant = plants.find(
        (plant) => plant.id === id
    );

    if (!plant) {
        return res.status(404).json({
            error: "Pflanze nicht gefunden",
        });
    }

    if (
        typeof amount !== "number" ||
        amount <= 0
    ) {
        return res.status(400).json({
            error: "Ungültige Wassermenge",
        });
    }

    plant.lastWatered =
        new Date().toLocaleString("de-DE");

    console.log(
        `💧 ${plant.name} wird simuliert mit ${amount} ml gegossen`
    );

    return res.json({
        success: true,

        plantId: plant.id,
        plantName: plant.name,

        amount,

        lastWatered: plant.lastWatered,
    });
});

/*
 * Pflanzenautomatik
 */
app.patch(
    "/api/plants/:id/automation",
    (req, res) => {
        const id = Number(req.params.id);

        const { enabled } = req.body;

        const plant = plants.find(
            (plant) => plant.id === id
        );

        if (!plant) {
            return res.status(404).json({
                error: "Pflanze nicht gefunden",
            });
        }

        plant.autoWatering = Boolean(enabled);

        return res.json({
            success: true,

            autoWatering:
            plant.autoWatering,
        });
    }
);

/*
 * Neues Kamerabild aufnehmen
 */
app.post(
    "/api/camera/snapshot",
    (req, res) => {
        const args = [
            "-y",

            "-f",
            "v4l2",

            "-framerate",
            "10",

            "-video_size",
            "640x480",

            "-i",
            "/dev/video0",

            "-frames:v",
            "1",

            "-update",
            "1",

            CAMERA_IMAGE_PATH,
        ];

        execFile(
            "ffmpeg",
            args,
            {
                timeout: 10000,
            },
            (error) => {
                if (error) {
                    console.error(
                        "📷 Kamera Fehler:",
                        error
                    );

                    return res.status(500).json({
                        success: false,

                        error:
                            "Kameraaufnahme fehlgeschlagen",
                    });
                }

                console.log(
                    "📷 Neues Kamerabild aufgenommen"
                );

                return res.json({
                    success: true,

                    timestamp: Date.now(),
                });
            }
        );
    }
);

/*
 * Aktuelles Kamerabild zurückgeben
 */
app.get(
    "/api/camera/snapshot",
    (req, res) => {
        if (
            !fs.existsSync(CAMERA_IMAGE_PATH)
        ) {
            return res.status(404).json({
                error:
                    "Noch kein Kamerabild vorhanden",
            });
        }

        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate"
        );

        return res.sendFile(
            CAMERA_IMAGE_PATH
        );
    }
);

app.listen(3000, "0.0.0.0", () => {
    console.log(
        "🌿 Greenhouse Backend läuft auf http://localhost:3000"
    );
});