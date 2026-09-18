import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import InventoryDashboard from "./pages/InventoryDashboard";
import Grn from "./pages/Grn";
import Packaging from "./pages/Packaging";
import Waste from "./pages/Waste";
import Cod from "./pages/Cod";
import AssetRegister from "./pages/AssetRegister";
import AssetTransfer from "./pages/AssetTransfer";
import AssetScrap from "./pages/AssetScrap";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/grn" replace />} />
        <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
        <Route path="/grn" element={<Grn />} />
        <Route path="/packaging" element={<Packaging />} />
        <Route path="/waste" element={<Waste />} />
        <Route path="/cod" element={<Cod />} />
        <Route path="/assets/register" element={<AssetRegister />} />
        <Route path="/assets/transfer" element={<AssetTransfer />} />
        <Route path="/assets/scrap" element={<AssetScrap />} />
        <Route path="*" element={<Navigate to="/grn" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
