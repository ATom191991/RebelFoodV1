import { BrowserRouter, Routes, Route } from "react-router-dom";
import Overview from "./pages/Overview";
import Grn from "./pages/Grn";
import Packaging from "./pages/Packaging";
import Waste from "./pages/Waste";
import Exceptions from "./pages/Exceptions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/grn" element={<Grn />} />
        <Route path="/packaging" element={<Packaging />} />
        <Route path="/waste" element={<Waste />} />
        <Route path="/exceptions" element={<Exceptions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
