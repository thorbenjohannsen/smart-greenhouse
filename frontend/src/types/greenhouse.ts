export type Plant = {
    id: number;
    name: string;
    type: string;
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