import type {
    Bed,
    SystemStatus,
} from "../types/greenhouse";


const API_URL = "";


// ---------------------------------------------------------
// SYSTEM
// ---------------------------------------------------------

export async function getSystemStatus(): Promise<SystemStatus> {
    const response = await fetch(
        `${API_URL}/api/status`
    );

    if (!response.ok) {
        throw new Error(
            "Systemstatus konnte nicht geladen werden."
        );
    }

    return response.json();
}


// ---------------------------------------------------------
// BEETE
// ---------------------------------------------------------

export async function getBeds(): Promise<Bed[]> {
    const response = await fetch(
        `${API_URL}/api/beds`
    );

    if (!response.ok) {
        throw new Error(
            "Beete konnten nicht geladen werden."
        );
    }

    return response.json();
}


export async function getBed(
    id: number
): Promise<Bed> {

    const response = await fetch(
        `${API_URL}/api/beds/${id}`
    );

    if (!response.ok) {
        throw new Error(
            "Beet konnte nicht geladen werden."
        );
    }

    return response.json();
}


// ---------------------------------------------------------
// BEET BEARBEITEN
// ---------------------------------------------------------

export async function updateBed(
    id: number,
    values: Partial<Bed>
): Promise<Bed> {

    const response = await fetch(
        `${API_URL}/api/beds/${id}`,
        {
            method: "PATCH",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(values),
        }
    );

    if (!response.ok) {
        throw new Error(
            "Beet konnte nicht aktualisiert werden."
        );
    }

    return response.json();
}


// ---------------------------------------------------------
// BEWÄSSERUNG
// ---------------------------------------------------------

export async function waterBed(
    id: number,
    amount: number
): Promise<{
    success: boolean;
    bed: Bed;
    amount: number;
}> {

    const response = await fetch(
        `${API_URL}/api/beds/${id}/water`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                amount,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            "Bewässerung konnte nicht gestartet werden."
        );
    }

    return response.json();
}


// ---------------------------------------------------------
// AUTOMATISCHE BEWÄSSERUNG
// ---------------------------------------------------------

export async function setBedAutomation(
    id: number,
    enabled: boolean
): Promise<Bed> {

    return updateBed(
        id,
        {
            autoWatering: enabled,
        }
    );
}


// ---------------------------------------------------------
// KAMERA
// ---------------------------------------------------------

export async function takeCameraSnapshot() {

    const response = await fetch(
        `${API_URL}/api/camera/snapshot`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error(
            "Kameraaufnahme fehlgeschlagen."
        );
    }

    return response.json();
}


export function getCameraSnapshotUrl() {
    return `${API_URL}/api/camera/snapshot?t=${Date.now()}`;
}

export async function turnFanOn(): Promise<{
    success: boolean;
    fan: boolean;
}> {

    const response = await fetch(
        `${API_URL}/api/fan/on`,
        {
            method: "POST",
        }
    );


    if (!response.ok) {

        throw new Error(
            "Lüfter konnte nicht eingeschaltet werden."
        );

    }


    return response.json();
}


export async function turnFanOff(): Promise<{
    success: boolean;
    fan: boolean;
}> {

    const response = await fetch(
        `${API_URL}/api/fan/off`,
        {
            method: "POST",
        }
    );


    if (!response.ok) {

        throw new Error(
            "Lüfter konnte nicht ausgeschaltet werden."
        );

    }


    return response.json();
}