import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartPulse, Lock, User, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Giả lập độ trễ mạng
    setTimeout(() => {
      const u = username.toLowerCase().trim();
      if (u === "benhnhan" || u === "patient") {
        navigate("/patient");
      } else if (u === "nuhoisinh" || u === "midwife") {
        navigate("/midwife");
      } else if (u === "bacsi" || u === "doctor") {
        navigate("/doctor");
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác. Thử 'benhnhan', 'nuhoisinh', hoặc 'bacsi'.");
        setIsLoading(false);
      }
    }, 800);
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 text-rose-700 rounded-full mb-4">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Đăng Nhập</h2>
          <p className="text-gray-500 mt-2">Hệ thống ViTem Triage AI</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-2 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tên đăng nhập</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: benhnhan, nuhoisinh, bacsi"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div className="flex justify-end mt-2">
              <a href="#" className="text-sm font-medium text-rose-600 hover:text-rose-700">Quên mật khẩu?</a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full py-4 bg-gradient-to-r from-rose-700 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-rose-600/30 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center h-14"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Đăng Nhập"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p className="font-bold text-gray-700 mb-1">💡 Tài khoản Test (Demo):</p>
          <ul className="space-y-1">
            <li>Tên đăng nhập: <strong className="text-rose-600">benhnhan</strong> 👉 App Bệnh Nhân</li>
            <li>Tên đăng nhập: <strong className="text-rose-600">nuhoisinh</strong> 👉 Ca Vàng</li>
            <li>Tên đăng nhập: <strong className="text-rose-600">bacsi</strong> 👉 Ca Đỏ</li>
            <li className="italic mt-2 text-xs">Mật khẩu: Nhập bất kỳ</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
