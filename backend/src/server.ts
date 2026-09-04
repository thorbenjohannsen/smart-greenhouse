import express from "express";
import cors from "cors";

import { execFile } from "node:child_process";

import path from "node:path";
import fs from "node:fs";

import {
    fileURLToPath
} from "node:url";


const app = express();

const PORT = 3000;

const IS_LINUX =
    process.platform === "linux";


// ---------------------------------------------------------
// MIDDLEWARE
// ---------------------------------------------------------

app.use(cors());

app.use(
    express.json()
);


// ---------------------------------------------------------
// TYPES
// ---------------------------------------------------------

type PlantType =
    | "tomato"
    | "pepper";


type Bed = {
    id: number;

    name: string;

    plantName: string;
    plantType: PlantType;

    moisture: number;

    targetMin: number;
    targetMax: number;

    autoWatering: boolean;

    lastWatered: string | null;
};


// ---------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------

const beds: Bed[] = [
    {
        id: 1,

        name: "Beet 1",

        plantName: "Tomate",
        plantType: "tomato",

        moisture: 42,

        targetMin: 35,
        targetMax: 60,

        autoWatering: true,

        lastWatered: null,
    },

    {
        id: 2,

        name: "Beet 2",

        plantName: "Paprika",
        plantType: "pepper",

        moisture: 55,

        targetMin: 40,
        targetMax: 65,

        autoWatering: false,

        lastWatered: null,
    },
];


// ---------------------------------------------------------
// SYSTEM STATUS
// ---------------------------------------------------------

app.get(
    "/api/status",
    (_req, res) => {

        res.json({
            status: "online",

            temperature: 24.3,
            humidity: 64,

            waterTank: 74,

            light: false,
            fan: false,

            cameraAvailable: IS_LINUX,
        });
    }
);


// ---------------------------------------------------------
// GET ALL BEDS
// ---------------------------------------------------------

app.get(
    "/api/beds",
    (_req, res) => {

        res.json(
            beds
        );
    }
);


// ---------------------------------------------------------
// GET SINGLE BED
// ---------------------------------------------------------

app.get(
    "/api/beds/:id",
    (req, res) => {

        const id =
            Number(req.params.id);

        const bed =
            beds.find(
                (item) =>
                    item.id === id
            );

        if (!bed) {
            return res
                .status(404)
                .json({
                    error:
                        "Beet nicht gefunden.",
                });
        }

        return res.json(
            bed
        );
    }
);


// ---------------------------------------------------------
// UPDATE BED
// ---------------------------------------------------------

app.patch(
    "/api/beds/:id",
    (req, res) => {

        const id =
            Number(req.params.id);

        const bed =
            beds.find(
                (item) =>
                    item.id === id
            );

        if (!bed) {
            return res
                .status(404)
                .json({
                    error:
                        "Beet nicht gefunden.",
                });
        }

        const {
            name,
            plantName,
            plantType,
            targetMin,
            targetMax,
            autoWatering,
        } = req.body;


        if (
            typeof name === "string"
        ) {
            bed.name = name;
        }


        if (
            typeof plantName === "string"
        ) {
            bed.plantName =
                plantName;
        }


        if (
            plantType === "tomato" ||
            plantType === "pepper"
        ) {
            bed.plantType =
                plantType;
        }


        if (
            typeof targetMin ===
            "number"
        ) {
            bed.targetMin =
                targetMin;
        }


        if (
            typeof targetMax ===
            "number"
        ) {
            bed.targetMax =
                targetMax;
        }


        if (
            typeof autoWatering ===
            "boolean"
        ) {
            bed.autoWatering =
                autoWatering;
        }


        return res.json(
            bed
        );
    }
);


// ---------------------------------------------------------
// WATER BED
// ---------------------------------------------------------

app.post(
    "/api/beds/:id/water",
    (req, res) => {

        const id =
            Number(req.params.id);

        const bed =
            beds.find(
                (item) =>
                    item.id === id
            );

        if (!bed) {
            return res
                .status(404)
                .json({
                    error:
                        "Beet nicht gefunden.",
                });
        }


        const amount =
            Number(
                req.body.amount
            );


        if (
            !amount ||
            amount <= 0 ||
            amount > 1000
        ) {
            return res
                .status(400)
                .json({
                    error:
                        "Ungültige Wassermenge.",
                });
        }


        /*
         * NOCH MOCK
         *
         * Hier kommt später die echte Pumpensteuerung hin.
         *
         * Beispiel:
         *
         * await pumpWater(
         *     bed.id,
         *     amount
         * );
         */


        bed.lastWatered =
            new Date()
                .toISOString();


        console.log(
            `💧 ${bed.name} bewässert: ${amount} ml`
        );


        return res.json({
            success: true,

            bed,

            amount,
        });
    }
);


// ---------------------------------------------------------
// CAMERA PATHS
// ---------------------------------------------------------

const __filename =
    fileURLToPath(
        import.meta.url
    );


const __dirname =
    path.dirname(
        __filename
    );


const CAMERA_DIRECTORY =
    path.join(
        __dirname,
        "../camera"
    );


const CAMERA_IMAGE_PATH =
    path.join(
        CAMERA_DIRECTORY,
        "snapshot.jpg"
    );


if (
    !fs.existsSync(
        CAMERA_DIRECTORY
    )
) {
    fs.mkdirSync(
        CAMERA_DIRECTORY,
        {
            recursive: true,
        }
    );
}


// ---------------------------------------------------------
// CAMERA STATUS
// ---------------------------------------------------------

app.get(
    "/api/camera/status",
    (_req, res) => {

        return res.json({
            available:
            IS_LINUX,

            platform:
            process.platform,

            device:
                IS_LINUX
                    ? "/dev/video0"
                    : null,
        });
    }
);


// ---------------------------------------------------------
// TAKE CAMERA SNAPSHOT
// ---------------------------------------------------------

app.post(
    "/api/camera/snapshot",
    (_req, res) => {

        /*
         * Die echte Kamera hängt am Raspberry Pi.
         *
         * Unter Windows existieren weder:
         *
         * /dev/video0
         *
         * noch das Linux-v4l2-Interface.
         *
         * Deshalb wird der Snapshot lokal deaktiviert.
         */

        if (!IS_LINUX) {

            console.log(
                "📷 Kamera-Snapshot übersprungen: Backend läuft nicht auf Linux."
            );

            return res
                .status(503)
                .json({
                    success: false,

                    error:
                        "Kamera ist nur auf dem Raspberry Pi verfügbar.",

                    platform:
                    process.platform,
                });
        }


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
                        "Camera error:",
                        error
                    );

                    return res
                        .status(500)
                        .json({
                            success:
                                false,

                            error:
                                "Kameraaufnahme fehlgeschlagen.",
                        });
                }


                console.log(
                    "📷 Kamera-Snapshot erstellt."
                );


                return res.json({
                    success: true,

                    timestamp:
                        Date.now(),

                    image:
                        "/api/camera/snapshot",
                });
            }
        );
    }
);


// ---------------------------------------------------------
// GET CAMERA SNAPSHOT
// ---------------------------------------------------------

app.get(
    "/api/camera/snapshot",
    (_req, res) => {

        if (
            !fs.existsSync(
                CAMERA_IMAGE_PATH
            )
        ) {
            return res
                .status(404)
                .json({
                    error:
                        "Noch kein Kamerabild vorhanden.",
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


// ---------------------------------------------------------
// SERVER
// ---------------------------------------------------------

app.listen(
    PORT,
    () => {

        console.log(
            `🌿 Greenhouse Backend läuft auf Port ${PORT}`
        );


        console.log(
            `💻 Plattform: ${process.platform}`
        );


        console.log(
            IS_LINUX
                ? "📷 Kamera-Modus: Raspberry Pi / Linux"
                : "📷 Kamera-Modus: lokal deaktiviert"
        );

    }
);