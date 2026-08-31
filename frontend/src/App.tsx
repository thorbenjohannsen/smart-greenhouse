import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import "./App.css";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Plants from "./pages/Plants";
import Watering from "./pages/Watering";
import Camera from "./pages/Camera";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";

function App() {
  return (
      <BrowserRouter>
        <div className="app">
          <Sidebar />

          <main className="main">
            <Routes>
              <Route
                  path="/"
                  element={
                    <Dashboard />
                  }
              />

              <Route
                  path="/plants"
                  element={
                    <Plants />
                  }
              />

              <Route
                  path="/watering"
                  element={
                    <Watering />
                  }
              />

              <Route
                  path="/camera"
                  element={
                    <Camera />
                  }
              />

              <Route
                  path="/statistics"
                  element={
                    <Statistics />
                  }
              />

              <Route
                  path="/settings"
                  element={
                    <Settings />
                  }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
  );
}

export default App;