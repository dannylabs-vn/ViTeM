import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PatientApp from "./pages/PatientApp";
import WorkerDashboard from "./pages/WorkerDashboard";

import Login from "./pages/Login";
import Landing from "./pages/Landing";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patient" element={<PatientApp />} />
        <Route path="/midwife" element={<WorkerDashboard role="MIDWIFE" />} />
        <Route path="/doctor" element={<WorkerDashboard role="DOCTOR" />} />
      </Routes>
    </Router>
  );
}

export default App;
