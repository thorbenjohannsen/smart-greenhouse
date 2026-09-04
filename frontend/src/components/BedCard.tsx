import { useState } from "react";

import type {
    Bed
} from "../types/greenhouse";

type Props = {
    bed: Bed;

    onWater: (
        bedId: number,
        amount: number
    ) => Promise<void>;

    onToggleAutomation: (
        bedId: number,
        enabled: boolean
    ) => Promise<void>;
};

function getMoistureStatus(
    moisture: number,
    min: number,
    max: number
) {
    if (moisture < min) {
        return {
            label: "Zu trocken",
            className: "status-warning",
        };
    }

    if (moisture > max) {
        return {
            label: "Zu feucht",
            className: "status-info",
        };
    }

    return {
        label: "Optimal",
        className: "status-good",
    };
}

function formatLastWatered(
    value: string | null
) {
    if (!value) {
        return "Noch nicht";
    }

    return new Date(
        value
    ).toLocaleString(
        "de-DE",
        {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}

function BedCard({
                     bed,
                     onWater,
                     onToggleAutomation,
                 }: Props) {
    const [watering, setWatering] =
        useState(false);

    const [automationLoading, setAutomationLoading] =
        useState(false);

    const status =
        getMoistureStatus(
            bed.moisture,
            bed.targetMin,
            bed.targetMax
        );

    async function handleWater(
        amount: number
    ) {
        try {
            setWatering(true);

            await onWater(
                bed.id,
                amount
            );
        } finally {
            setWatering(false);
        }
    }

    async function handleAutomation() {
        try {
            setAutomationLoading(true);

            await onToggleAutomation(
                bed.id,
                !bed.autoWatering
            );
        } finally {
            setAutomationLoading(false);
        }
    }

    return (
        <article className="plant-card">
            <div className="plant-header">
                <div className="plant-title">
                    <div className="plant-icon">
                        🌱
                    </div>

                    <div>
                        <span className="eyebrow">
                            {bed.name}
                        </span>

                        <h3>
                            {bed.plantName}
                        </h3>
                    </div>
                </div>

                <span
                    className={`status ${status.className}`}
                >
                    {status.label}
                </span>
            </div>

            <div className="moisture-section">
                <div className="moisture-row">
                    <span>
                        Bodenfeuchtigkeit
                    </span>

                    <strong>
                        {bed.moisture} %
                    </strong>
                </div>

                <div className="progress">
                    <div
                        className="progress-fill"
                        style={{
                            width:
                                `${Math.min(
                                    bed.moisture,
                                    100
                                )}%`,
                        }}
                    />
                </div>

                <div className="target">
                    Zielbereich{" "}
                    {bed.targetMin}–{bed.targetMax} %
                </div>
            </div>

            <div className="plant-info-row">
                <div>
                    <span className="label">
                        Automatik
                    </span>

                    <button
                        type="button"
                        className={`toggle ${
                            bed.autoWatering
                                ? "active"
                                : ""
                        }`}
                        disabled={
                            automationLoading
                        }
                        onClick={
                            handleAutomation
                        }
                        aria-label={
                            "Automatische Bewässerung umschalten"
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
                        {formatLastWatered(
                            bed.lastWatered
                        )}
                    </strong>
                </div>
            </div>

            <div className="water-buttons">
                {[25, 50, 100].map(
                    (amount) => (
                        <button
                            type="button"
                            key={amount}
                            disabled={watering}
                            onClick={() =>
                                handleWater(
                                    amount
                                )
                            }
                        >
                            {watering
                                ? "..."
                                : `${amount} ml`}
                        </button>
                    )
                )}
            </div>
        </article>
    );
}

export default BedCard;