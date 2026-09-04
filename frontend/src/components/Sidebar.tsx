import {
    NavLink,
} from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">
            <div>
                <div className="logo">
                    <div className="logo-icon">
                        🌿
                    </div>

                    <div>
                        <strong>GREENHOUSE</strong>
                        <span>Smart Garden</span>
                    </div>
                </div>

                <nav>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span>⌂</span>
                        Übersicht
                    </NavLink>

                    <NavLink
                        to="/beds"
                        className={({ isActive }) =>
                            `nav-item ${
                                isActive
                                    ? "active"
                                    : ""
                            }`
                        }
                    >
                        <span>🌱</span>
                        Beete
                    </NavLink>

                    <NavLink
                        to="/plants"
                        className={({ isActive }) =>
                            `nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span>🌱</span>
                        Pflanzen
                    </NavLink>

                    <NavLink
                        to="/watering"
                        className={({ isActive }) =>
                            `nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span>💧</span>
                        Bewässerung
                    </NavLink>

                    <NavLink
                        to="/camera"
                        className={({ isActive }) =>
                            `nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span>📷</span>
                        Kamera
                    </NavLink>

                    <NavLink
                        to="/ai"
                        className={({ isActive }) =>
                            `nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span>✨</span>
                        KI-Analyse
                    </NavLink>

                    <NavLink
                        to="/statistics"
                        className={({ isActive }) =>
                            `nav-item ${
                                isActive ? "active" : ""
                            }`
                        }
                    >
                        <span>📊</span>
                        Statistiken
                    </NavLink>
                </nav>
            </div>

            <NavLink
                to="/settings"
                className={({ isActive }) =>
                    `nav-item ${
                        isActive ? "active" : ""
                    }`
                }
            >
                <span>⚙</span>
                Einstellungen
            </NavLink>
        </aside>
    );
}

export default Sidebar;