import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

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
        lastWatered: "Heute, 12:42",
    },
    {
        id: 2,
        name: "Chili",
        type: "Gemüse",
        moisture: 38,
        targetMin: 35,
        targetMax: 55,
        autoWatering: true,
        lastWatered: "Gestern, 18:10",
    },
];

app.get("/api/status", (req, res) => {
    res.json({
        status: "online",
        temperature: 24.3,
        humidity: 64,
        waterTank: 74,
        light: true,
        fan: false,
    });
});

app.get("/api/plants", (req, res) => {
    res.json(plants);
});

app.post("/api/plants/:id/water", (req, res) => {
    const id = Number(req.params.id);
    const { amount } = req.body;

    const plant = plants.find((p) => p.id === id);

    if (!plant) {
        return res.status(404).json({
            error: "Pflanze nicht gefunden",
        });
    }

    if (!amount || amount <= 0) {
        return res.status(400).json({
            error: "Ungültige Wassermenge",
        });
    }

    plant.lastWatered = new Date().toLocaleString("de-DE");

    console.log(
        `💧 ${plant.name} wird simuliert mit ${amount} ml gegossen`
    );

    res.json({
        success: true,
        plantId: plant.id,
        plantName: plant.name,
        amount,
        lastWatered: plant.lastWatered,
    });
});

app.patch("/api/plants/:id/automation", (req, res) => {
    const id = Number(req.params.id);
    const { enabled } = req.body;

    const plant = plants.find((p) => p.id === id);

    if (!plant) {
        return res.status(404).json({
            error: "Pflanze nicht gefunden",
        });
    }

    plant.autoWatering = Boolean(enabled);

    res.json({
        success: true,
        autoWatering: plant.autoWatering,
    });
});

app.listen(3000, () => {
    console.log("🌿 Greenhouse Backend läuft auf http://localhost:3000");
});