export type PlantType =
    | "tomato"
    | "pepper";


export type Bed = {
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


export type SystemStatus = {
    status: string;

    temperature: number;
    humidity: number;

    waterTank: number;

    light: boolean;
    fan: boolean;
};