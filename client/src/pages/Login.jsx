import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeartPulse, Lock, User, AlertCircle, MapPin, Phone, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config";

const MOCK_LOCATIONS = [
  { name: "Ban Khuoi, Quang Khe commune", latitude: 22.425, longitude: 105.635 },
  { name: "Ban Thi, Ban Thi commune", latitude: 22.390, longitude: 105.580 },
  { name: "Quang Khe commune, Ba Be", latitude: 22.410, longitude: 105.610 },
  { name: "Bang Phuc commune, Cho Don", latitude: 22.385, longitude: 105.590 },
  { name: "Na Phac hamlet, Ngan Son", latitude: 22.450, longitude: 105.650 },
];

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Registration States
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedLocIndex, setSelectedLocIndex] = useState(0);
  const [gpsCoords, setGpsCoords] = useState({ latitude: 22.415, longitude: 105.625 });
  const [gpsStatus, setGpsStatus] = useState("Using default village GPS");

  // Sync GPS default location on selector change
  useEffect(() => {
    if (isRegister && MOCK_LOCATIONS[selectedLocIndex]) {
      setGpsCoords({
        latitude: MOCK_LOCATIONS[selectedLocIndex].latitude,
        longitude: MOCK_LOCATIONS[selectedLocIndex].longitude
      });
      setGpsStatus("Using default village GPS");
    }
  }, [selectedLocIndex, isRegister]);

  const handleGetDeviceGPS = () => {
    if ("geolocation" in navigator) {
      setGpsStatus("Locating...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setGpsStatus("📍 Successfully located from your device!");
        },
        (err) => {
          console.warn("GPS error:", err);
          setGpsStatus("Failed to obtain device GPS. Using village coordinates.");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsStatus("Device does not support GPS location.");
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint = isRegister ? "register" : "login";
      const payload = isRegister ? {
        username: username.trim(),
        password,
        patientName: patientName.trim(),
        phone_number: phone.trim(),
        location: MOCK_LOCATIONS[selectedLocIndex].name,
        latitude: gpsCoords.latitude,
        longitude: gpsCoords.longitude
      } : {
        username: username.trim(),
        password
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        // Save user details to LocalStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect based on role
        const role = data.user.role;
        if (role === "PATIENT") {
          navigate("/patient");
        } else if (role === "MIDWIFE") {
          navigate("/midwife");
        } else if (role === "DOCTOR") {
          navigate("/doctor");
        } else if (role === "COMMUNITY_WORKER") {
          navigate("/community");
        }
      } else {
        setError(data.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setError("Could not connect to the server.");
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
 
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white z-10 relative"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 text-rose-700 rounded-full mb-3">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">{isRegister ? "Mother Registration" : "Login"}</h2>
          <p className="text-gray-500 mt-2">ViTem Maternal Triage System</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-start gap-2 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 text-left uppercase tracking-wider">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isRegister ? "Enter username (alphanumeric only)" : "benhnhan, nuhoisinh, bacsi, congdong"}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 text-left uppercase tracking-wider">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                required
              />
            </div>
          </div>

          {isRegister && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4 pt-2 border-t border-gray-100"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 text-left uppercase tracking-wider">Mother's Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Trieu Thi Hoa"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 text-left uppercase tracking-wider">Contact Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0912345678"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 text-left uppercase tracking-wider font-semibold">Select Village of Residence</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="w-4 h-4 text-rose-700" />
                  </div>
                  <select
                    value={selectedLocIndex}
                    onChange={(e) => setSelectedLocIndex(parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all text-sm font-medium appearance-none"
                  >
                    {MOCK_LOCATIONS.map((loc, idx) => (
                      <option key={idx} value={idx}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 animate-spin" /> {gpsStatus}
                  </span>
                  <button
                    type="button"
                    onClick={handleGetDeviceGPS}
                    className="text-[10px] font-bold bg-white text-[#8B1E32] px-2.5 py-1 rounded-md border border-rose-200 hover:bg-rose-50 transition-colors shadow-sm"
                  >
                    Get Device GPS
                  </button>
                </div>
                <div className="text-[11px] text-gray-500">
                  Longitude: <strong className="text-gray-700">{gpsCoords.longitude.toFixed(5)}</strong>, 
                  Latitude: <strong className="text-gray-700">{gpsCoords.latitude.toFixed(5)}</strong>
                </div>
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-[#8B1E32] to-rose-700 text-white rounded-xl font-bold text-base shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center h-12"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isRegister ? "Register Account" : "Login"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-sm font-bold text-rose-700 hover:text-rose-800 transition-colors"
          >
            {isRegister ? "Already have an account? Login now" : "No account yet? Create patient account"}
          </button>
        </div>
        
        {!isRegister && (
          <div className="mt-6 text-center text-[11px] text-gray-500 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="font-bold text-gray-700 mb-1.5">💡 Quick Demo Login Accounts:</p>
            <ul className="space-y-1 text-left inline-block">
              <li>• <strong className="text-rose-700">benhnhan</strong> (Demo Patient)</li>
              <li>• <strong className="text-rose-700">nuhoisinh</strong> (Midwife)</li>
              <li>• <strong className="text-rose-700">bacsi</strong> (Chief Doctor)</li>
              <li>• <strong className="text-rose-700">congdong</strong> (Community Worker)</li>
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}
