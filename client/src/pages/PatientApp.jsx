import React, { useState, useEffect } from "react";
import { UploadCloud, AlertTriangle, PlayCircle, HeartPulse, ShieldCheck, PhoneCall, ChevronRight, FileText, CheckCircle2, Clock, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientApp() {
  const [file, setFile] = useState(null);
  const [phone, setPhone] = useState("");
  const [translate, setTranslate] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [caseId, setCaseId] = useState(null);

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
      const formData = new FormData();
      formData.append("document", file);
      formData.append("phoneNumber", phone);

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
          summary: aiResult.summary,
          warning_box: aiResult.warning_box,
          tay_translation: aiResult.tay_translation
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-rose-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-rose-700" />
            <span className="text-2xl font-extrabold text-rose-800 tracking-tight">ViTem</span>
          </div>
          <a href="tel:115" className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full font-bold hover:bg-red-100 transition-colors">
            <PhoneCall className="w-5 h-5" />
            <span className="hidden sm:inline">Gọi Cấp Cứu 115</span>
            <span className="sm:hidden">115</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
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
                  <div 
                    className="border-2 border-dashed border-rose-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-rose-50/50 cursor-pointer hover:bg-rose-50 transition-colors group"
                    onClick={() => document.getElementById("file-upload").click()}
                  >
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {file ? <FileText className="w-8 h-8 text-rose-600" /> : <UploadCloud className="w-8 h-8 text-rose-600" />}
                    </div>
                    <p className="text-center text-rose-900 font-bold text-lg">
                      {file ? file.name : "Chạm để Chụp ảnh"}
                    </p>
                    <input 
                      id="file-upload" 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setFile(e.target.files[0])}
                      accept="image/*"
                    />
                  </div>

                  {/* Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Số điện thoại liên hệ:</label>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="09..."
                        className="w-full text-xl p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-rose-500 focus:ring-0 outline-none transition-colors"
                      />
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

                  <div className="p-8">
                    {/* Summary / Translation Section */}
                    <div className="mb-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {translate ? "Tóm tắt (Tiếng Tày)" : "Tóm tắt tình trạng (Tiếng Việt)"}
                      </h3>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {translate && result.tay_translation ? (
                          typeof result.tay_translation === 'object' ? 
                            (result.tay_translation.summary || JSON.stringify(result.tay_translation)) : 
                            result.tay_translation
                        ) : result.summary}
                      </div>
                    </div>

                    {!translate && (
                      <>
                        <div className="flex items-center gap-2 mb-6">
                          <Leaf className="w-6 h-6 text-emerald-600" />
                          <h3 className="text-xl font-bold text-gray-900">Gợi ý chăm sóc sức khỏe</h3>
                        </div>
                        <p className="text-gray-500 mb-4 text-sm">Trong lúc chờ đợi, bạn có thể thực hiện các bước sau để thấy thoải mái hơn:</p>
                        
                        <div className="space-y-4 mb-8">
                          {result.health_tips.map((tip, idx) => (
                            <div key={idx} className="flex items-start bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                              <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 font-medium leading-snug">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

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
              
              {/* COMPLETED State would go here... */}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
