import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Screenshots from "./pages/Screenshots";
import RunsPage from "./pages/RunsPage";
import SitePage from "./pages/SitePage";
import AddNewSite from "./pages/AddNewSite";
import "./index.css";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/screenshots" element={<Screenshots />} />
        <Route path="/:siteName" element={<RunsPage />} />
        <Route path="/:siteName/:runId" element={<SitePage />} />
        <Route path="/add-site" element={<AddNewSite />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
