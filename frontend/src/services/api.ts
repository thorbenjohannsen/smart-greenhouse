import type {
    Plant,
    SystemStatus,
} from "../types/greenhouse";

const API_URL = "";

export async function getPlants(): Promise<Plant[]> {
    const response = await fetch(
        `${API_URL}/api/plants`
    );

    if (!response.ok) {
        throw new Error(
            "Pflanzendaten konnten nicht geladen werden"
        );
    }

    return response.json();
}

export async function getSystemStatus(): Promise<SystemStatus> {
    const response = await fetch(
        `${API_URL}/api/status`
    );

    if (!response.ok) {
        throw new Error(
            "Systemstatus konnte nicht geladen werden"
        );
    }

    return response.json();
}

export async function waterPlant(
    plantId: number,
    amount: number
) {
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

    return response.json();
}

export async function setPlantAutomation(
    plantId: number,
    enabled: boolean
) {
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

    return response.json();
}

export async function takeCameraSnapshot() {
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

    return response.json();
}

export function getCameraSnapshotUrl() {
    return `/api/camera/snapshot?t=${Date.now()}`;
}