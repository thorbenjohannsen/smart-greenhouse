import { useState } from "react";
import type { Plant } from "../types/greenhouse";

type Props = {
    plant: Plant;
    onWater: (
        plantId: number,
        amount: number
    ) => Promise<void>;
    onToggleAutomation: (
        plantId: number,
        enabled: boolean
    ) => Promise<void>;
};

function getMoistureStatus(
    moisture: number,
    min: number,
    max: number
) {
    if (moisture < min) {
        return "Zu trocken";
    }

    if (moisture > max) {
        return "Sehr feucht";
    }

    return "Optimal";
}

function PlantCard({
                       plant,
                       onWater,
                       onToggleAutomation,
                   }: Props) {
    const [watering, setWatering] =
        useState(false);

    const status = getMoistureStatus(
        plant.moisture,
        plant.targetMin,
        plant.targetMax
    );

    async function handleWater(
        amount: number
    ) {
        try {
            setWatering(true);

            await onWater(
                plant.id,
                amount
            );
        } finally {
            setWatering(false);
        }
    }

    return (
        <div className="plant-card">
            <div className="plant-header">
                <div className="plant-title">
                    <div className="plant-icon">
                        🌱
                    </div>

                    <div>
                        <h3>{plant.name}</h3>
                        <span>{plant.type}</span>
                    </div>
                </div>

                <span
                    className={`status ${
                        status === "Optimal"
                            ? "status-good"
                            : status === "Zu trocken"
                                ? "status-warning"
                                : "status-info"
                    }`}
                >
          {status}
        </span>
            </div>

            <div className="moisture-section">
                <div className="moisture-row">
          <span>
            Bodenfeuchtigkeit
          </span>

                    <strong>
                        {plant.moisture}%
                    </strong>
                </div>

                <div className="progress">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${plant.moisture}%`,
                        }}
                    />
                </div>

                <div className="target">
                    Zielbereich:
                    {" "}
                    {plant.targetMin}% –
                    {" "}
                    {plant.targetMax}%
                </div>
            </div>

            <div className="plant-info-row">
                <div>
          <span className="label">
            Automatik
          </span>

                    <button
                        className={`toggle ${
                            plant.autoWatering
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            onToggleAutomation(
                                plant.id,
                                !plant.autoWatering
                            )
                        }
                    >
                        <span />
                    </button>
                </div>

                <div>
          <span className="label">
            Zuletzt gegossen
          </span>

                    <strong>
                        {plant.lastWatered ??
                            "Noch nicht"}
                    </strong>
                </div>
            </div>

            <div className="water-buttons">
                {[25, 50, 100].map(
                    (amount) => (
                        <button
                            key={amount}
                            disabled={watering}
                            onClick={() =>
                                handleWater(amount)
                            }
                        >
                            💧 {amount} ml
                        </button>
                    )
                )}
            </div>
        </div>
    );
}

export default PlantCard;