import React, { useState, useEffect } from "react";
import { LayoutDashboard, FileText, Truck, Building2, Bell, Activity, Clock, CheckCircle, AlertTriangle, MapPin, Phone, Send, BarChart3, TrendingUp, PieChart as PieChartIcon, Wifi, WifiOff, Wrench, ChevronRight, Eye, ArrowUpRight, Users, Ambulance, Hospital, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UrgencyPieChart, WeeklyBarChart, TrendAreaChart, StatusPieChart } from "../components/ChartComponents";

// =================== MOCK DATA ===================

const mockReports = [
  { id: 1, patientName: "Nông Thị Hương", phone: "0912345678", location: "Bản Khuôi, Bắc Kạn", type: "Khẩn cấp", status: "NEW", summary: "Sản phụ 38 tuần, vỡ ối, đau bụng dữ dội. Cần xe cấp cứu ngay.", urgency: "RED", created_at: new Date(Date.now() - 10 * 60000) },
  { id: 2, patientName: "Hoàng Văn Tùng", phone: "0987654321", location: "Thôn Nà Phặc, Ngân Sơn", type: "Theo dõi", status: "IN_PROGRESS", summary: "Bệnh nhân tiểu đường thai kỳ, cần theo dõi đường huyết hàng tuần.", urgency: "YELLOW", created_at: new Date(Date.now() - 2 * 3600000) },
  { id: 3, patientName: "Triệu Thị Lan", phone: "0934567890", location: "Xã Bằng Phúc, Chợ Đồn", type: "Thông thường", status: "TRANSFERRED", summary: "Khám thai định kỳ 28 tuần, các chỉ số bình thường. Đã chuyển nữ hộ sinh.", urgency: "GREEN", created_at: new Date(Date.now() - 5 * 3600000) },
  { id: 4, patientName: "Ma Thị Xuân", phone: "0945678901", location: "Bản Thi, Ba Bể", type: "Khẩn cấp", status: "COMPLETED", summary: "Sản phụ 36 tuần, huyết áp cao 160/100. Đã chuyển viện thành công.", urgency: "RED", created_at: new Date(Date.now() - 8 * 3600000) },
  { id: 5, patientName: "Lý Văn Đức", phone: "0956789012", location: "Xã Quảng Khê, Ba Bể", type: "Theo dõi", status: "NEW", summary: "Thai phụ 32 tuần, thiếu máu (Hb: 9.5g/dL), cần bổ sung sắt và theo dõi.", urgency: "YELLOW", created_at: new Date(Date.now() - 30 * 60000) },
];

const mockAmbulances = [
  { id: "XC-01", plate: "98A-12345", driver: "Hoàng Văn Long", status: "AVAILABLE", location: "Trạm Y tế Bằng Phúc", latitude: 22.385, longitude: 105.590, lastUpdate: "5 phút trước", fuel: 85 },
  { id: "XC-02", plate: "98A-67890", driver: "Nông Văn Hải", status: "EN_ROUTE", location: "Đang đến Bản Khuôi", latitude: 22.425, longitude: 105.635, lastUpdate: "2 phút trước", destination: "Bản Khuôi → BV Huyện Ngân Sơn", fuel: 62, eta: "~25 phút" },
  { id: "XC-03", plate: "98A-11223", driver: "Triệu Văn Bảo", status: "MAINTENANCE", location: "Gara BV Huyện", latitude: 22.408, longitude: 105.624, lastUpdate: "1 giờ trước", fuel: 30 },
];

const mockFacilities = [
  { id: 1, name: "Trạm Y tế xã Bằng Phúc", type: "Trạm Y tế", status: "ONLINE", staff: 4, beds: 6, equipment: ["Máy siêu âm", "Máy đo huyết áp", "Bộ đỡ đẻ"], lastCheck: "19/06/2026", latitude: 22.385, longitude: 105.590 },
  { id: 2, name: "Phòng khám khu vực Nà Phặc", type: "Phòng khám", status: "ONLINE", staff: 6, beds: 10, equipment: ["Máy siêu âm", "Máy XN máu", "Máy CTG"], lastCheck: "18/06/2026", latitude: 22.450, longitude: 105.650 },
  { id: 3, name: "Trạm Y tế xã Quảng Khê", type: "Trạm Y tế", status: "ONLINE", staff: 2, beds: 4, equipment: ["Máy đo huyết áp", "Bộ đỡ đẻ"], lastCheck: "15/06/2026", latitude: 22.410, longitude: 105.610 },
  { id: 4, name: "BV Đa khoa huyện Ba Bể", type: "Bệnh viện", status: "ONLINE", staff: 45, beds: 80, equipment: ["Máy siêu âm 4D", "Phòng mổ", "Phòng ICU", "Máy CTG", "Xét nghiệm đầy đủ"], lastCheck: "19/06/2026", latitude: 22.408, longitude: 105.624 },
  { id: 5, name: "Trạm Y tế xã Bản Thi", type: "Trạm Y tế", status: "ONLINE", staff: 3, beds: 5, equipment: ["Máy đo huyết áp", "Bộ đỡ đẻ", "Máy siêu âm (đang sửa)"], lastCheck: "17/06/2026", latitude: 22.390, longitude: 105.580 },
];

const reportAnalytics = {
  statusPie: [
    { name: "Khẩn cấp", value: 12, color: "#991B1B" },
    { name: "Theo dõi", value: 28, color: "#D97706" },
    { name: "Thông thường", value: 45, color: "#059669" },
  ],
  weeklyData: [
    { day: "T2", cases: 8, completed: 6 },
    { day: "T3", cases: 12, completed: 10 },
    { day: "T4", cases: 6, completed: 5 },
    { day: "T5", cases: 15, completed: 13 },
    { day: "T6", cases: 10, completed: 9 },
    { day: "T7", cases: 7, completed: 6 },
    { day: "CN", cases: 3, completed: 3 },
  ],
};

// =================== STATUS HELPERS ===================

const reportStatusMap = {
  NEW: { label: "Mới", bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
  IN_PROGRESS: { label: "Đang xử lý", bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
  TRANSFERRED: { label: "Đã chuyển", bg: "bg-purple-100", text: "text-purple-800", dot: "bg-purple-500" },
  COMPLETED: { label: "Hoàn tất", bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
  WAITING_DOCTOR: { label: "Chờ Bác sĩ", bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
  WAITING_MIDWIFE: { label: "Chờ Hộ sinh", bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
};

const ambulanceStatusMap = {
  AVAILABLE: { label: "Sẵn sàng", bg: "bg-emerald-100", text: "text-emerald-800", icon: CheckCircle },
  EN_ROUTE: { label: "Đang vận chuyển", bg: "bg-blue-100", text: "text-blue-800", icon: Truck },
  MAINTENANCE: { label: "Bảo trì", bg: "bg-gray-100", text: "text-gray-600", icon: Wrench },
};

const facilityStatusMap = {
  ONLINE: { label: "Hoạt động", bg: "bg-emerald-100", text: "text-emerald-800", icon: Wifi },
  OFFLINE: { label: "Ngưng hoạt động", bg: "bg-red-100", text: "text-red-800", icon: WifiOff },
  MAINTENANCE: { label: "Bảo trì", bg: "bg-amber-100", text: "text-amber-800", icon: Wrench },
};

// =================== MAIN COMPONENT ===================

export default function CommunityWorkerDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [reports, setReports] = useState([]);
  const [ambulances, setAmbulances] = useState(mockAmbulances);
  const [facilities, setFacilities] = useState(mockFacilities);
  const [selectedReport, setSelectedReport] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 5000);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const getNearestAmbulance = (patientLat, patientLon, ambulanceList) => {
    const available = ambulanceList.filter(a => a.status === "AVAILABLE");
    if (available.length === 0) return null;
    let nearest = null;
    let minDistance = Infinity;
    available.forEach(amb => {
      const dist = getDistance(patientLat, patientLon, amb.latitude, amb.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { ...amb, distance: dist };
      }
    });
    return nearest;
  };

  const getNearestHospital = (patientLat, patientLon, facilityList) => {
    const online = facilityList.filter(f => f.status === "ONLINE");
    if (online.length === 0) return null;
    let nearest = null;
    let minDistance = Infinity;
    online.forEach(fac => {
      const dist = getDistance(patientLat, patientLon, fac.latitude, fac.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { ...fac, distance: dist };
      }
    });
    return nearest;
  };

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/documents");
      const data = await res.json();
      if (data.success) {
        const mappedCases = data.cases.map(c => ({
          ...c,
          phone: c.phone_number || c.phone,
          location: c.location || "Chưa xác định",
          latitude: parseFloat(c.latitude) || 22.415,
          longitude: parseFloat(c.longitude) || 105.625
        }));
        setReports(mappedCases);
      }
    } catch (err) {
      console.error("Lỗi fetch reports:", err);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateReportStatus = async (reportId, newStatus, silent = false) => {
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        const updatedMapped = {
          ...data.case,
          phone: data.case.phone_number || data.case.phone,
          location: data.case.location || "Chưa xác định",
          latitude: parseFloat(data.case.latitude) || 22.415,
          longitude: parseFloat(data.case.longitude) || 105.625
        };
        setReports(prev => prev.map(r => r.id === reportId ? updatedMapped : r));
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport(updatedMapped);
        }
        if (!silent) {
          showToast(`Cập nhật trạng thái thành công: ${reportStatusMap[newStatus].label}`, "success");
        }
      } else {
        showToast("Lỗi khi cập nhật trạng thái", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Không thể kết nối đến máy chủ", "error");
    }
  };

  const handleReportToHospital = async (report) => {
    const nearestHosp = getNearestHospital(report.latitude, report.longitude, facilities);
    const hospName = nearestHosp ? nearestHosp.name : "Bệnh viện tuyến trên";
    const distance = nearestHosp ? nearestHosp.distance : "không xác định";

    await handleUpdateReportStatus(report.id, 'TRANSFERRED', true);
    showToast(`🚨 Đã báo động đỏ & chuyển hồ sơ sản phụ ${report.patientName} đến ${hospName} thành công! Khoảng cách chuyển viện: ${distance} km.`, "error");
  };

  const handleDispatchAmbulance = (ambulanceId, report) => {
    const amb = ambulances.find(a => a.id === ambulanceId);
    if (!amb) return;
    const distance = getDistance(report.latitude, report.longitude, amb.latitude, amb.longitude);

    setAmbulances(prev => prev.map(a => a.id === ambulanceId ? {
      ...a,
      status: "EN_ROUTE",
      location: `Đang di chuyển đến ${report.location}`,
      destination: `${report.location} → BV Đa khoa huyện Ba Bể`,
      eta: `~${Math.round(distance * 2 + 5)} phút`
    } : a));

    handleUpdateReportStatus(report.id, "IN_PROGRESS", true);
    showToast(`🚑 Đã điều động xe ${ambulanceId} (Cách ${distance} km) di chuyển đến vị trí của bệnh nhân ${report.patientName}.`, "success");
  };

  const handleDispatchAmbulanceDirect = (ambulanceId) => {
    let targetReport = selectedReport;
    if (!targetReport) {
      targetReport = reports.find(r => r.urgency === 'RED' && r.status !== 'COMPLETED');
    }
    if (!targetReport) {
      showToast("⚠️ Không tìm thấy ca bệnh khẩn cấp nào cần điều phối xe cấp cứu.", "warning");
      return;
    }
    handleDispatchAmbulance(ambulanceId, targetReport);
  };

  const handleReportToHospitalGlobal = () => {
    showToast("🚑 Đã gửi tín hiệu và yêu cầu xe cấp cứu của BV Huyện Ba Bể hỗ trợ thành công.", "info");
  };

  const tabs = [
    { key: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "Reports", label: "Báo cáo", icon: FileText },
    { key: "Ambulance", label: "Xe cấp cứu", icon: Ambulance },
    { key: "Infrastructure", label: "Hạ tầng", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-gray-800">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col items-center py-6 shadow-sm z-10">
        <h1 className="text-3xl font-bold text-[#8B1E32] mb-2 tracking-tight">ViTem</h1>
        <p className="text-xs text-gray-400 font-medium mb-10 uppercase tracking-wider">Community Worker</p>

        <nav className="w-full px-4 space-y-2 flex-1">
          <p className="text-xs font-bold text-gray-400 mb-4 ml-4 uppercase tracking-wider">Quản lý</p>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${
                  activeTab === tab.key ? 'bg-[#8B1E32] text-white shadow-md' : 'text-gray-600 hover:bg-rose-50 hover:text-[#8B1E32]'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" /> {tab.label}
                {tab.key === 'Reports' && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {reports.filter(r => r.status === 'NEW').length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="w-full px-4 mt-auto">
          <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-teal-500 mr-3 flex items-center justify-center text-white font-bold text-sm">NV</div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-800">NV Cộng đồng Hà</p>
              <p className="text-xs text-gray-500">Huyện Ba Bể, Bắc Kạn</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 shrink-0">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {activeTab === 'Dashboard' ? 'Overall Analytics' : activeTab === 'Reports' ? 'Báo cáo Bệnh nhân' : activeTab === 'Ambulance' ? 'Theo dõi Xe cấp cứu' : 'Quản lý Hạ tầng'}
            </h2>
            <p className="text-gray-500 mt-1">
              {activeTab === 'Dashboard' ? 'Tổng quan hoạt động cộng đồng y tế khu vực' :
               activeTab === 'Reports' ? `${reports.filter(r => r.status === 'NEW').length} báo cáo mới cần xử lý` :
               activeTab === 'Ambulance' ? `${ambulances.filter(a => a.status === 'AVAILABLE').length}/${ambulances.length} xe sẵn sàng` :
               `${facilities.filter(f => f.status === 'ONLINE').length}/${facilities.length} cơ sở đang hoạt động`}
            </p>
          </div>
          <button className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-600 shadow-sm relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* ============ TAB: DASHBOARD ============ */}
        {activeTab === 'Dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto pr-4 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center"><Activity className="w-6 h-6 text-rose-600" /></div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Tổng báo cáo</span>
                </div>
                <h3 className="text-4xl font-extrabold text-gray-900">85</h3>
                <p className="text-sm text-gray-500 mt-1">Tháng này</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Đang xử lý</span>
                </div>
                <h3 className="text-4xl font-extrabold text-gray-900">{reports.filter(r => r.status === 'NEW' || r.status === 'IN_PROGRESS').length}</h3>
                <p className="text-sm text-gray-500 mt-1">Cần attention</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center"><Ambulance className="w-6 h-6 text-emerald-600" /></div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Xe sẵn sàng</span>
                </div>
                <h3 className="text-4xl font-extrabold text-gray-900">{ambulances.filter(a => a.status === 'AVAILABLE').length}</h3>
                <p className="text-sm text-gray-500 mt-1">/ {ambulances.length} xe tổng</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><Building2 className="w-6 h-6 text-blue-600" /></div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Cơ sở online</span>
                </div>
                <h3 className="text-4xl font-extrabold text-gray-900">{facilities.filter(f => f.status === 'ONLINE').length}</h3>
                <p className="text-sm text-gray-500 mt-1">/ {facilities.length} cơ sở</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#8B1E32]" /> Phân bố báo cáo theo loại
                </h3>
                <p className="text-xs text-gray-500 mb-4">Tỷ lệ ca khẩn cấp / theo dõi / thông thường</p>
                <StatusPieChart data={reportAnalytics.statusPie} />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#8B1E32]" /> Báo cáo trong tuần
                </h3>
                <p className="text-xs text-gray-500 mb-4">Số lượng tiếp nhận và xử lý theo ngày</p>
                <WeeklyBarChart data={reportAnalytics.weeklyData} />
              </div>
            </div>

            {/* Trend */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#8B1E32]" /> Xu hướng ca bệnh 7 ngày
              </h3>
              <p className="text-xs text-gray-500 mb-4">Biến động ca Đỏ, Vàng, Xanh theo thời gian</p>
              <TrendAreaChart />
            </div>
          </motion.div>
        )}

        {/* ============ TAB: REPORTS ============ */}
        {activeTab === 'Reports' && (
          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Report List */}
            <div className="w-2/5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Danh sách báo cáo</h3>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {reports.map(report => {
                  const statusCfg = reportStatusMap[report.status] || { label: report.status, bg: "bg-gray-100", text: "text-gray-800", dot: "bg-gray-500" };
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedReport(report)}
                      className={`bg-white p-5 rounded-2xl border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-all ${
                        selectedReport?.id === report.id ? 'ring-2 ring-[#8B1E32]/20 border-[#8B1E32]' :
                        report.urgency === 'RED' ? 'border-red-500' : report.urgency === 'YELLOW' ? 'border-amber-400' : 'border-emerald-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900">{report.patientName}</h4>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${statusCfg.bg} ${statusCfg.text}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{report.summary}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{report.location}</span>
                        <span>{new Date(report.created_at).toLocaleTimeString('vi-VN')}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Report Detail */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              {!selectedReport ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <FileText className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Chọn một báo cáo để xem chi tiết</p>
                </div>
              ) : (
                <>
                  <div className={`px-6 py-4 text-white ${selectedReport.urgency === 'RED' ? 'bg-[#8B1E32]' : selectedReport.urgency === 'YELLOW' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                    <div className="flex items-center font-bold text-lg">
                      {selectedReport.urgency === 'RED' && <AlertTriangle className="w-5 h-5 mr-2" />}
                      Báo cáo: {selectedReport.patientName}
                    </div>
                    <p className="text-white/80 text-sm mt-1">{selectedReport.location} • {selectedReport.type}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Nội dung báo cáo</h4>
                      <p className="text-gray-600 leading-relaxed">{selectedReport.summary}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Số điện thoại</p>
                        <p className="text-gray-900 font-bold flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{selectedReport.phone}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Thời gian</p>
                        <p className="text-gray-900 font-bold">{new Date(selectedReport.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>

                    {/* GPS Routing & Recommendation */}
                    <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100/80 space-y-4 text-left">
                      <h4 className="text-sm font-bold text-[#8B1E32] flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Định vị GPS & Điều phối khẩn cấp
                      </h4>
                      
                      {/* Patient Location Info */}
                      <div className="flex items-center justify-between text-xs bg-white px-4 py-2.5 rounded-xl border border-rose-100 shadow-sm">
                        <span className="font-semibold text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-500" /> Tọa độ bệnh nhân:</span>
                        <span className="font-bold text-gray-800">
                          {selectedReport.latitude && selectedReport.longitude ? `${selectedReport.latitude.toFixed(4)}, ${selectedReport.longitude.toFixed(4)}` : "Chưa định vị"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nearest Hospital */}
                        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bệnh viện gần nhất</p>
                            {(() => {
                              const nearestHosp = getNearestHospital(selectedReport.latitude, selectedReport.longitude, facilities);
                              if (nearestHosp) {
                                return (
                                  <>
                                    <h5 className="font-bold text-gray-800 text-sm flex items-center gap-1.5"><Hospital className="w-4 h-4 text-blue-600 animate-pulse" /> {nearestHosp.name}</h5>
                                    <p className="text-xs text-rose-700 font-bold mt-1.5 bg-rose-50 px-2.5 py-1 rounded-lg inline-block">Khoảng cách: {nearestHosp.distance} km</p>
                                  </>
                                );
                              }
                              return <p className="text-xs text-gray-500">Không tìm thấy cơ sở online</p>;
                            })()}
                          </div>
                        </div>

                        {/* Nearest Ambulance */}
                        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Xe cấp cứu gần nhất</p>
                            {(() => {
                              const nearestAmb = getNearestAmbulance(selectedReport.latitude, selectedReport.longitude, ambulances);
                              if (nearestAmb) {
                                return (
                                  <>
                                    <h5 className="font-bold text-gray-800 text-sm flex items-center gap-1.5"><Ambulance className="w-4 h-4 text-[#8B1E32] animate-bounce" /> {nearestAmb.id} ({nearestAmb.driver})</h5>
                                    <p className="text-xs text-[#8B1E32] font-bold mt-1.5 bg-rose-50 px-2.5 py-1 rounded-lg inline-block">Khoảng cách: {nearestAmb.distance} km</p>
                                    <button 
                                      onClick={() => handleDispatchAmbulance(nearestAmb.id, selectedReport)}
                                      className="mt-3.5 w-full py-2 bg-[#8B1E32] text-white text-xs font-bold rounded-xl hover:bg-rose-900 transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transform transition-transform"
                                    >
                                      <Send className="w-3.5 h-3.5" /> Điều phối xe này
                                    </button>
                                  </>
                                );
                              }
                              return (
                                <>
                                  <p className="text-xs text-gray-500">Tất cả xe đang bận</p>
                                  <p className="text-[10px] text-gray-400 mt-1">Chờ xe khác quay về hoặc liên hệ y tế địa phương.</p>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
                    <div className="flex gap-2">
                      {selectedReport.status === 'NEW' && (
                        <button onClick={() => handleUpdateReportStatus(selectedReport.id, 'IN_PROGRESS')} className="px-4 py-2.5 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600 transition-colors">
                          Ghi nhận & Xử lý
                        </button>
                      )}
                      {(selectedReport.status === 'NEW' || selectedReport.status === 'IN_PROGRESS') && (
                        <button onClick={() => handleUpdateReportStatus(selectedReport.id, 'TRANSFERRED')} className="px-4 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-sm hover:bg-purple-700 transition-colors flex items-center gap-1">
                          <Send className="w-4 h-4" /> Chuyển tiếp
                        </button>
                      )}
                    </div>
                    {selectedReport.urgency === 'RED' && selectedReport.status !== 'COMPLETED' && (
                      <button 
                        onClick={() => handleReportToHospital(selectedReport)}
                        className="px-4 py-2.5 bg-[#8B1E32] text-white font-bold rounded-xl text-sm hover:bg-rose-900 transition-colors flex items-center gap-1"
                      >
                        <Hospital className="w-4 h-4" /> Báo bệnh viện
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ============ TAB: AMBULANCE ============ */}
        {activeTab === 'Ambulance' && (
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="flex-1 flex gap-6 overflow-hidden">
              {/* Map */}
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#8B1E32]" /> Bản đồ khu vực</h3>
                  <span className="text-xs text-gray-400 font-medium">Google Maps — Ba Bể, Bắc Kạn</span>
                </div>
                <div className="flex-1 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118000!2d105.6!3d22.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x36ca5e87b4e7e9b7%3A0x1a1a1a1a1a1a1a1a!2sBa%20B%E1%BB%83%2C%20B%E1%BA%AFc%20K%E1%BA%A1n!5e0!3m2!1svi!2svn!4v1718812800000!5m2!1svi!2svn"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps - Ba Bể, Bắc Kạn"
                  ></iframe>
                  {/* Ambulance Overlay Markers */}
                  <div className="absolute top-4 left-4 space-y-2">
                    {ambulances.filter(a => a.status === 'EN_ROUTE').map(amb => (
                      <div key={amb.id} className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-blue-200 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-blue-800">{amb.id}: {amb.destination}</span>
                        <span className="text-[10px] text-blue-600 font-medium">ETA {amb.eta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ambulance List */}
              <div className="w-96 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Danh sách xe</h3>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {ambulances.map(amb => {
                    const statusCfg = ambulanceStatusMap[amb.status];
                    const StatusIcon = statusCfg.icon;
                    return (
                      <div key={amb.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Ambulance className="w-5 h-5 text-[#8B1E32]" />
                            <span className="font-bold text-gray-900">{amb.id}</span>
                            <span className="text-xs text-gray-400">{amb.plate}</span>
                          </div>
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                            <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" /> {amb.driver}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" /> {amb.location}
                          </div>
                          {amb.destination && (
                            <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 text-xs">
                              <span className="font-bold text-blue-800">Lộ trình:</span>
                              <span className="text-blue-700 ml-1">{amb.destination}</span>
                              <span className="text-blue-500 ml-2">ETA: {amb.eta}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Nhiên liệu:</span>
                              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${amb.fuel > 50 ? 'bg-emerald-500' : amb.fuel > 20 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${amb.fuel}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-gray-600">{amb.fuel}%</span>
                            </div>
                            <span className="text-[10px] text-gray-400">{amb.lastUpdate}</span>
                          </div>
                        </div>
                        {amb.status === 'AVAILABLE' && (
                          <button 
                            onClick={() => handleDispatchAmbulanceDirect(amb.id)}
                            className="mt-3 w-full py-2 bg-[#8B1E32] text-white text-sm font-bold rounded-xl hover:bg-rose-900 transition-colors flex items-center justify-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" /> Điều xe
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Report to Hospital Button */}
                <button 
                  onClick={handleReportToHospitalGlobal}
                  className="mt-4 w-full py-3.5 bg-gradient-to-r from-[#8B1E32] to-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2"
                >
                  <Hospital className="w-5 h-5" /> Báo về Bệnh viện
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ TAB: INFRASTRUCTURE ============ */}
        {activeTab === 'Infrastructure' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto pr-4 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center"><Wifi className="w-6 h-6 text-emerald-600" /></div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">{facilities.filter(f => f.status === 'ONLINE').length}</h3>
                  <p className="text-xs text-gray-500 font-medium">Đang hoạt động</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center"><WifiOff className="w-6 h-6 text-red-600" /></div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">{facilities.filter(f => f.status === 'OFFLINE').length}</h3>
                  <p className="text-xs text-gray-500 font-medium">Ngưng hoạt động</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"><Wrench className="w-6 h-6 text-amber-600" /></div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900">{facilities.filter(f => f.status === 'MAINTENANCE').length}</h3>
                  <p className="text-xs text-gray-500 font-medium">Đang bảo trì</p>
                </div>
              </div>
            </div>

            {/* Facility Cards */}
            <div className="space-y-4">
              {facilities.map(facility => {
                const statusCfg = facilityStatusMap[facility.status];
                const StatusIcon = statusCfg.icon;
                return (
                  <div key={facility.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${facility.type === 'Bệnh viện' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                          {facility.type === 'Bệnh viện' ? <Hospital className="w-5 h-5 text-blue-600" /> : <Building2 className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{facility.name}</h4>
                          <p className="text-xs text-gray-500">{facility.type}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                        <StatusIcon className="w-3.5 h-3.5" /> {statusCfg.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center bg-gray-50 p-3 rounded-xl">
                        <p className="text-2xl font-extrabold text-gray-900">{facility.staff}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Nhân viên</p>
                      </div>
                      <div className="text-center bg-gray-50 p-3 rounded-xl">
                        <p className="text-2xl font-extrabold text-gray-900">{facility.beds}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Giường bệnh</p>
                      </div>
                      <div className="text-center bg-gray-50 p-3 rounded-xl">
                        <p className="text-2xl font-extrabold text-gray-900">{facility.equipment.length}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Thiết bị</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {facility.equipment.map((eq, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium border border-gray-200">{eq}</span>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Kiểm tra lần cuối: {facility.lastCheck}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 max-w-md backdrop-blur-md ${
              toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' :
              toast.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-800' :
              toast.type === 'info' ? 'bg-blue-50/90 border-blue-200 text-blue-800' :
              'bg-emerald-50/90 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              toast.type === 'error' ? 'bg-red-100 text-red-600' :
              toast.type === 'warning' ? 'bg-amber-100 text-amber-600' :
              toast.type === 'info' ? 'bg-blue-100 text-blue-600' :
              'bg-emerald-100 text-emerald-600'
            }`}>
              {toast.type === 'error' || toast.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            </div>
            <p className="text-sm font-bold flex-1 leading-snug">{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
