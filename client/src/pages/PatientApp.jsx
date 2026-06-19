import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, AlertTriangle, PlayCircle, HeartPulse, ShieldCheck, PhoneCall, ChevronRight, FileText, CheckCircle2, Clock, Leaf, BarChart3, PieChart as PieChartIcon, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HealthChecklist from "../components/HealthChecklist";
import { StatusPieChart, WeeklyBarChart } from "../components/ChartComponents";

export default function PatientApp() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [phone, setPhone] = useState("");
  const [translate, setTranslate] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [caseId, setCaseId] = useState(null);
  const [activeView, setActiveView] = useState("upload"); // "upload" | "analytics"

  // Force login check on mount
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedInUser || loggedInUser.role !== "PATIENT") {
      navigate("/login");
    } else {
      setPhone(loggedInUser.phone_number || "");
    }
  }, [navigate]);

  const [patientCases, setPatientCases] = useState([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedHistoryCase, setSelectedHistoryCase] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const SUGGESTED_SYMPTOMS = [
    { id: "sốt", label: "Sốt / Nóng đầu", urgency: "RED" },
    { id: "ra_máu", label: "Ra máu âm đạo", urgency: "RED" },
    { id: "vỡ_ối", label: "Vỡ nước ối", urgency: "RED" },
    { id: "đau_bụng", label: "Đau bụng dữ dội", urgency: "RED" },
    { id: "đau_đầu", label: "Đau đầu / Hoa mắt", urgency: "YELLOW" },
    { id: "thai_ít_máy", label: "Thai ít máy (ít đạp)", urgency: "YELLOW" },
    { id: "phù_chân", label: "Phù chân / Tay", urgency: "YELLOW" },
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const fetchPatientCases = async (phoneNumber) => {
    if (!phoneNumber) return;
    try {
      const res = await fetch(`http://localhost:5000/api/documents?phone=${phoneNumber}`);
      const data = await res.json();
      if (data.success) {
        setPatientCases(data.cases);
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch sử ca bệnh:", err);
    }
  };

  useEffect(() => {
    if (activeView === "analytics" && phone) {
      fetchPatientCases(phone);
      const interval = setInterval(() => {
        fetchPatientCases(phone);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeView, phone]);

  const getStatusPieData = () => {
    const completed = patientCases.filter(c => c.status === 'COMPLETED').length;
    const waitingDoctor = patientCases.filter(c => c.status === 'WAITING_DOCTOR').length;
    const waitingMidwife = patientCases.filter(c => c.status === 'WAITING_MIDWIFE').length;
    
    const data = [
      { name: "Đã xử lý xong", value: completed, color: "#059669" },
      { name: "Đang chờ Bác sĩ", value: waitingDoctor, color: "#991B1B" },
      { name: "Đang chờ Hộ sinh", value: waitingMidwife, color: "#D97706" },
    ].filter(d => d.value > 0);
    return data.length > 0 ? data : [{ name: "Chưa có hồ sơ", value: 1, color: "#D1D5DB" }];
  };

  const getWeeklyData = () => {
    const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = daysOfWeek[d.getDay()];
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      
      const casesInDay = patientCases.filter(c => {
        const cDate = new Date(c.created_at);
        return cDate.toDateString() === d.toDateString();
      });
      const completedInDay = casesInDay.filter(c => c.status === 'COMPLETED').length;
      
      result.push({
        day: `${dayLabel} (${dateStr})`,
        cases: casesInDay.length,
        completed: completedInDay
      });
    }
    return result;
  };

  // Poll for updates from Doctor/Midwife
  useEffect(() => {
    let interval;
    if (result && result.status !== "COMPLETED" && caseId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch("http://localhost:5000/api/documents");
          const data = await res.json();
          if (data.success) {
            const updatedCase = data.cases.find(c => c.id === caseId);
            if (updatedCase && updatedCase.status === "COMPLETED") {
              setResult(prev => ({
                ...prev,
                status: "COMPLETED",
                title: "Đã có phản hồi từ Y Bác Sĩ",
                message: "Bác sĩ/Nữ hộ sinh đã xem xét hồ sơ của bạn. Vui lòng làm theo các hướng dẫn bên dưới.",
                instruction_for_patient: updatedCase.instruction_for_patient
              }));
              clearInterval(interval);
              
              // OS Notification
              if ("Notification" in window) {
                if (Notification.permission === "granted") {
                  const notif = new Notification("🔔 Phản hồi từ Y Bác Sĩ", {
                    body: "Hồ sơ y tế của bạn đã được duyệt. Bấm vào đây để xem hướng dẫn dặn dò.",
                  });
                  notif.onclick = () => window.focus();
                }
              }
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [result, caseId]);

  // Call Real Backend API
  const handleUpload = async () => {
    if (!file || !phone) return;
    
    // Request notification permission
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
    
    setIsProcessing(true);
    
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      const formData = new FormData();
      formData.append("document", file);
      formData.append("phoneNumber", phone);
      formData.append("selectedSymptoms", JSON.stringify(selectedSymptoms));
      
      if (loggedInUser) {
        formData.append("patientName", loggedInUser.patientName);
        formData.append("location", loggedInUser.location);
        formData.append("latitude", loggedInUser.latitude);
        formData.append("longitude", loggedInUser.longitude);
      }

      const response = await fetch("http://localhost:5000/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      setIsProcessing(false);
      
      if (data.success && data.case) {
        const aiResult = data.case;
        setCaseId(aiResult.id);
        
        let titleStr = "Đã gửi hồ sơ";
        let messageStr = "Hồ sơ của bạn đã được hệ thống tiếp nhận.";
        if (aiResult.status === "WAITING_DOCTOR") {
          titleStr = "Đã gửi cho Bác Sĩ";
          messageStr = "Hồ sơ của bạn đang được Bác sĩ kiểm tra khẩn cấp.";
        } else if (aiResult.status === "WAITING_MIDWIFE") {
          titleStr = "Đã gửi cho Nữ Hộ Sinh";
          messageStr = "Hồ sơ của bạn đang được Nữ Hộ sinh xem xét và lên lịch.";
        } else if (aiResult.status === "COMPLETED") {
          titleStr = "Sức Khỏe Bình Thường";
          messageStr = "Hệ thống AI đánh giá các chỉ số của bạn ổn định. Vui lòng duy trì thói quen sinh hoạt tốt.";
        }

        setResult({
          status: aiResult.status,
          title: titleStr,
          message: messageStr,
          health_tips: aiResult.checklist || [],
          health_checklist: aiResult.health_checklist || [],
          summary: aiResult.summary,
          warning_box: aiResult.warning_box,
          tay_translation: aiResult.tay_translation,
          urgency: aiResult.urgency
        });
      } else {
        alert("Lỗi khi xử lý tài liệu.");
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert("Không thể kết nối đến máy chủ.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-rose-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-rose-700" />
            <span className="text-2xl font-extrabold text-rose-800 tracking-tight">ViTem</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Tab Toggle */}
            <div className="hidden sm:flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setActiveView("upload")}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeView === 'upload' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Gửi hồ sơ
              </button>
              <button
                onClick={() => setActiveView("analytics")}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeView === 'analytics' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Thống kê
              </button>
            </div>
            <a href="tel:115" className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full font-bold hover:bg-red-100 transition-colors">
              <PhoneCall className="w-5 h-5" />
              <span className="hidden sm:inline">Gọi Cấp Cứu 115</span>
              <span className="sm:hidden">115</span>
            </a>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 px-4.5 py-2 rounded-full font-bold transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Analytics View */}
      {activeView === "analytics" && (
        <div className="pt-28 pb-16 px-4 max-w-6xl mx-auto">
          {!phone ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto text-center space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-rose-100"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-rose-700 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Tra cứu lịch sử sức khỏe</h2>
              <p className="text-gray-500 text-sm">Vui lòng nhập số điện thoại liên hệ để xem toàn bộ lịch sử ca bệnh và hướng dẫn của bác sĩ.</p>
              <input 
                type="tel" 
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-rose-500 focus:bg-white text-center font-bold text-lg transition-colors"
              />
              <button 
                onClick={() => {
                  if (searchPhone) {
                    setPhone(searchPhone);
                    fetchPatientCases(searchPhone);
                  } else {
                    alert("Vui lòng nhập số điện thoại");
                  }
                }}
                className="w-full py-4 bg-rose-700 text-white rounded-xl font-bold hover:bg-rose-800 transition-colors shadow-lg shadow-rose-700/20 active:scale-[0.98] transition-transform"
              >
                Xem Thống Kê & Lịch Sử
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Thống kê sức khỏe</h2>
                  <p className="text-gray-500 mt-1">Lịch sử y tế cho số điện thoại: <strong className="text-rose-800">{phone}</strong></p>
                </div>
                <button 
                  onClick={() => {
                    setPhone("");
                    setPatientCases([]);
                  }}
                  className="text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors self-start sm:self-center"
                >
                  Thay đổi SĐT tra cứu
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-rose-600" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900">{patientCases.length}</h3>
                  <p className="text-xs text-gray-500 font-bold mt-1">Tổng hồ sơ gửi</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900">
                    {patientCases.filter(c => c.status === 'COMPLETED').length}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold mt-1">Đã xử lý xong</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900">
                    {patientCases.filter(c => c.status !== 'COMPLETED').length}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold mt-1">Đang xử lý</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-gray-900">
                    {patientCases.length > 0 ? Math.round((patientCases.filter(c => c.status === 'COMPLETED').length / patientCases.length) * 100) : 0}%
                  </h3>
                  <p className="text-xs text-gray-500 font-bold mt-1">Tỷ lệ hoàn thành</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-rose-600" /> Phân bố trạng thái
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Tỷ lệ hồ sơ theo trạng thái xử lý thực tế</p>
                  <StatusPieChart data={getStatusPieData()} />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-rose-600" /> Hồ sơ trong tuần
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Số lượng hồ sơ gửi và xử lý trong 7 ngày gần đây</p>
                  <WeeklyBarChart data={getWeeklyData()} />
                </div>
              </div>

              {/* Lịch sử hồ sơ chi tiết */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-600" /> Lịch sử tư vấn sức khỏe
                </h3>
                {patientCases.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Chưa có dữ liệu lịch sử khám thai.</p>
                ) : (
                  <div className="space-y-4">
                    {patientCases.map((c) => (
                      <div 
                        key={c.id} 
                        onClick={() => setSelectedHistoryCase(c)}
                        className={`p-4 rounded-xl border border-gray-100 hover:border-rose-200 hover:bg-rose-50/20 cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${selectedHistoryCase?.id === c.id ? 'border-rose-300 bg-rose-50/30' : ''}`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{c.patientName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              c.urgency === 'RED' ? 'bg-red-100 text-red-800' :
                              c.urgency === 'YELLOW' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {c.urgency === 'RED' ? 'Nguy cơ cao' : c.urgency === 'YELLOW' ? 'Theo dõi' : 'Bình thường'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Ngày gửi: {new Date(c.created_at).toLocaleString('vi-VN')}</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{c.summary}</p>
                        </div>
                        
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            c.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'WAITING_DOCTOR' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {c.status === 'COMPLETED' ? 'Đã có chỉ định' : 'Đang xử lý'}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Upload View */}
      {activeView === "upload" && (
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Decorative Blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute top-40 -left-20 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Copy & Value Prop */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-800 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" /> Dành riêng cho mẹ bầu dân tộc Tày
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                An tâm thai kỳ,<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-pink-600">
                  Hiểu rõ sức khỏe
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                ViTem giúp bạn kết nối nhanh chóng với bác sĩ và nữ hộ sinh. Chỉ cần chụp ảnh giấy khám, bác sĩ sẽ xem xét và gửi hướng dẫn chi tiết, an toàn bằng tiếng Tày cho bạn.
              </p>
              
              {/* How it works simple steps */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">1</span>
                  Chụp ảnh
                </div>
                <ChevronRight className="w-4 h-4 hidden sm:block text-gray-300" />
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">2</span>
                  Bác sĩ kiểm tra
                </div>
                <ChevronRight className="w-4 h-4 hidden sm:block text-gray-300" />
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">3</span>
                  Nhận hướng dẫn
                </div>
              </div>
            </div>

            {/* Right: The Interactive Tool */}
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-500 transform scale-[0.95] translate-y-6 rounded-3xl blur-xl opacity-30"></div>
              
              <AnimatePresence mode="wait">
                {!isProcessing && !result && (
                  <motion.div 
                    key="upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white p-8 space-y-6"
                  >
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Gửi hồ sơ ngay</h3>
                      <p className="text-gray-500">Tải lên giấy khám thai, đơn thuốc hoặc kết quả siêu âm để bác sĩ kiểm tra.</p>
                    </div>

                    {/* Upload Zone */}
                    <div className="space-y-3">
                      <label className="block text-gray-700 font-bold text-sm text-left">Giấy khám / Siêu âm / Đơn thuốc:</label>
                      {imagePreview ? (
                        <div className="relative rounded-2xl overflow-hidden border border-rose-200 aspect-[4/3] bg-gray-50 flex items-center justify-center group shadow-inner">
                          <img src={imagePreview} alt="Xem trước" className="max-h-full max-w-full object-contain" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setFile(null);
                                setImagePreview(null);
                              }}
                              className="bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg hover:bg-red-700 transition-colors"
                            >
                              Chọn ảnh khác
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-rose-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-rose-50/30 cursor-pointer hover:bg-rose-50 hover:border-rose-400 transition-all group"
                          onClick={() => document.getElementById("file-upload").click()}
                        >
                          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-rose-100">
                            <UploadCloud className="w-7 h-7 text-rose-600" />
                          </div>
                          <p className="text-center text-rose-900 font-bold text-sm">
                            Chụp ảnh hoặc Chọn từ thư viện
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Hỗ trợ JPG, PNG, GIF</p>
                          <input 
                            id="file-upload" 
                            type="file" 
                            className="hidden" 
                            onChange={handleFileChange}
                            accept="image/*"
                          />
                        </div>
                      )}
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-bold mb-2 text-left">Số điện thoại liên hệ:</label>
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="09..."
                          className="w-full text-xl p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-rose-500 focus:ring-0 outline-none transition-colors font-bold text-center"
                        />
                      </div>

                      {/* Triệu chứng nhanh */}
                      <div className="space-y-2 text-left">
                        <label className="block text-gray-700 font-bold text-sm">Triệu chứng hiện tại (nếu có):</label>
                        <div className="flex flex-wrap gap-2">
                          {SUGGESTED_SYMPTOMS.map((symptom) => {
                            const isSelected = selectedSymptoms.includes(symptom.id);
                            return (
                              <button
                                key={symptom.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedSymptoms(selectedSymptoms.filter(id => id !== symptom.id));
                                  } else {
                                    setSelectedSymptoms([...selectedSymptoms, symptom.id]);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                  isSelected 
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                                }`}
                              >
                                {symptom.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-rose-50 p-4 rounded-xl border border-rose-100">
                        <span className="font-bold text-rose-900">Nhận hướng dẫn Tiếng Tày</span>
                        <button 
                          onClick={() => setTranslate(!translate)}
                          className={`w-14 h-8 rounded-full p-1 transition-colors ${translate ? "bg-rose-600" : "bg-gray-300"}`}
                        >
                          <motion.div 
                            layout 
                            className="w-6 h-6 bg-white rounded-full shadow-md"
                            animate={{ x: translate ? 24 : 0 }}
                          />
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={handleUpload}
                      disabled={!file || !phone}
                      className="w-full py-5 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-xl font-bold text-xl shadow-lg shadow-rose-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 hover:shadow-xl hover:-translate-y-1"
                    >
                      Gửi cho Bác Sĩ
                    </button>
                  </motion.div>
                )}

                {isProcessing && (
                  <motion.div 
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white p-12 flex flex-col items-center justify-center text-center min-h-[500px]"
                  >
                    <div className="relative w-24 h-24 mb-8">
                      <div className="absolute inset-0 border-4 border-rose-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-rose-600 rounded-full border-t-transparent animate-spin"></div>
                      <ShieldCheck className="absolute inset-0 m-auto w-8 h-8 text-rose-600 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-rose-800 mb-2">Đang mã hóa dữ liệu...</h2>
                    <p className="text-gray-500">Hồ sơ của bạn đang được xử lý an toàn để chuyển đến bác sĩ.</p>
                  </motion.div>
                )}

                {result && (
                  <motion.div 
                    key="waiting"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white overflow-hidden"
                  >
                    <div className={`text-white p-8 ${result.status === 'WAITING_DOCTOR' ? 'bg-gradient-to-r from-red-500 to-rose-600' : result.status === 'WAITING_MIDWIFE' ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}>
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-white/20 p-4 rounded-full">
                          {result.status === "COMPLETED" ? <CheckCircle2 className="w-12 h-12" /> : <Clock className="w-12 h-12 animate-pulse" />}
                        </div>
                      </div>
                      <h2 className="text-2xl font-extrabold text-center text-white mb-2">{result.title}</h2>
                      <p className="text-center text-white/90 leading-relaxed font-medium">
                        {result.message}
                      </p>
                    </div>

                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                      {/* Health Checklist - Giấy khám sức khỏe */}
                      {result.health_checklist && result.health_checklist.length > 0 && (
                        <HealthChecklist
                          checklist={result.health_checklist}
                          overallUrgency={result.urgency || (result.status === 'WAITING_DOCTOR' ? 'RED' : result.status === 'WAITING_MIDWIFE' ? 'YELLOW' : 'GREEN')}
                        />
                      )}

                      {/* Summary / Translation Section */}
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {translate ? "Tóm tắt (Tiếng Tày)" : "Tóm tắt tình trạng (Tiếng Việt)"}
                        </h3>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                          {translate && result.tay_translation ? (
                            typeof result.tay_translation === 'object' ? 
                              (result.tay_translation.summary || JSON.stringify(result.tay_translation)) : 
                              result.tay_translation
                          ) : result.summary}
                        </div>
                      </div>

                      {/* Gợi ý chăm sóc sức khỏe */}
                      <div className="flex items-center gap-2 mt-4 text-left">
                        <Leaf className="w-6 h-6 text-emerald-600 font-bold" />
                        <h3 className="text-xl font-bold text-gray-900">Gợi ý chăm sóc sức khỏe</h3>
                      </div>
                      <p className="text-gray-500 text-sm text-left">Trong lúc chờ đợi phản hồi từ bác sĩ, bạn hãy chú ý:</p>
                      
                      <div className="space-y-3">
                        {(result.health_tips && result.health_tips.length > 0 ? result.health_tips : [
                          "Nằm nghỉ ngơi thoải mái trên giường, tránh làm việc nặng nhọc.",
                          "Uống đủ nước ấm (từ 1.5 - 2 lít nước mỗi ngày).",
                          "Theo dõi sát các biểu hiện bất thường như đau bụng, ra máu, nhức đầu.",
                          "Nếu có dấu hiệu cấp cứu, liên hệ ngay trạm y tế gần nhất hoặc gọi 115."
                        ]).map((tip, idx) => (
                          <div key={idx} className="flex items-start bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-left">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 font-medium leading-snug text-sm">{tip}</span>
                          </div>
                        ))}
                      </div>

                      {result.status !== "COMPLETED" ? (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                          <div className={`w-8 h-8 border-4 border-gray-200 rounded-full animate-spin mx-auto mb-2 ${result.status === 'WAITING_DOCTOR' ? 'border-t-red-500' : 'border-t-amber-500'}`}></div>
                          <p className="text-sm font-bold text-gray-600">Đang chờ phản hồi từ {result.status === 'WAITING_DOCTOR' ? 'Bác Sĩ' : 'Nữ Hộ Sinh'}...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <p className="text-sm font-bold text-emerald-700">Tuyệt vời! Y Bác sĩ đã xác nhận hồ sơ của bạn.</p>
                          </div>
                          {result.instruction_for_patient && (
                            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-200 mt-4">
                              <h3 className="text-lg font-bold text-rose-800 mb-2 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2" /> Dặn dò từ Y Bác Sĩ
                              </h3>
                              <p className="text-rose-700 whitespace-pre-wrap">{result.instruction_for_patient}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tab Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        <button
          onClick={() => setActiveView("upload")}
          className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-bold ${activeView === 'upload' ? 'text-rose-700' : 'text-gray-400'}`}
        >
          <UploadCloud className="w-5 h-5" />
          Gửi hồ sơ
        </button>
        <button
          onClick={() => setActiveView("analytics")}
          className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-bold ${activeView === 'analytics' ? 'text-rose-700' : 'text-gray-400'}`}
        >
          <BarChart3 className="w-5 h-5" />
          Thống kê
        </button>
      </div>

      {/* History Detail Modal */}
      {selectedHistoryCase && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className={`p-6 text-white flex justify-between items-center ${
              selectedHistoryCase.urgency === 'RED' ? 'bg-gradient-to-r from-red-600 to-rose-700' :
              selectedHistoryCase.urgency === 'YELLOW' ? 'bg-gradient-to-r from-amber-500 to-yellow-600' :
              'bg-gradient-to-r from-emerald-500 to-teal-600'
            }`}>
              <div>
                <h3 className="text-xl font-bold">{selectedHistoryCase.patientName}</h3>
                <p className="text-xs text-white/80 mt-1">Hồ sơ khám thai ngày {new Date(selectedHistoryCase.created_at).toLocaleDateString('vi-VN')}</p>
              </div>
              <button 
                onClick={() => setSelectedHistoryCase(null)}
                className="bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Chỉ số */}
              {selectedHistoryCase.health_checklist && selectedHistoryCase.health_checklist.length > 0 && (
                <HealthChecklist 
                  checklist={selectedHistoryCase.health_checklist}
                  patientName={selectedHistoryCase.patientName}
                  date={new Date(selectedHistoryCase.created_at).toLocaleDateString('vi-VN')}
                  overallUrgency={selectedHistoryCase.urgency}
                />
              )}

              {/* Tóm tắt */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-sm mb-1">
                  {translate ? "Tóm tắt (Tiếng Tày)" : "Tóm tắt tình trạng"}
                </h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap text-left">
                  {translate && selectedHistoryCase.tay_translation ? (
                    typeof selectedHistoryCase.tay_translation === 'object' ? 
                      (selectedHistoryCase.tay_translation.summary || JSON.stringify(selectedHistoryCase.tay_translation)) : 
                      selectedHistoryCase.tay_translation
                  ) : selectedHistoryCase.summary}
                </div>
              </div>

              {/* Lời dặn */}
              {selectedHistoryCase.instruction_for_patient && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-left">
                  <h4 className="font-bold text-emerald-800 text-sm mb-1">Chỉ dẫn & Dặn dò của Bác Sĩ</h4>
                  <p className="text-sm text-emerald-700 whitespace-pre-wrap">{selectedHistoryCase.instruction_for_patient}</p>
                </div>
              )}
              {selectedHistoryCase.status !== 'COMPLETED' && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center text-sm font-bold text-amber-800 animate-pulse">
                  Hồ sơ đang được nhân viên y tế duyệt. Bạn sẽ nhận được thông báo khi có chỉ dẫn chính thức.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedHistoryCase(null)}
                className="px-5 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
