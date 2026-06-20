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
  { id: 1, name: "Trạm Y tế xã Bằng Phúc", type: "Trạm Y tế", status: "ONLINE", staff: 4, beds: 6, occupiedBeds: 2, equipment: ["Máy siêu âm", "Máy đo huyết áp", "Bộ đỡ đẻ"], lastCheck: "19/06/2026", latitude: 22.385, longitude: 105.590 },
  { id: 2, name: "Phòng khám khu vực Nà Phặc", type: "Phòng khám", status: "ONLINE", staff: 6, beds: 10, occupiedBeds: 8, equipment: ["Máy siêu âm", "Máy XN máu", "Máy CTG"], lastCheck: "18/06/2026", latitude: 22.450, longitude: 105.650 },
  { id: 3, name: "Trạm Y tế xã Quảng Khê", type: "Trạm Y tế", status: "ONLINE", staff: 2, beds: 4, occupiedBeds: 1, equipment: ["Máy đo huyết áp", "Bộ đỡ đẻ"], lastCheck: "15/06/2026", latitude: 22.410, longitude: 105.610 },
  { id: 4, name: "BV Đa khoa huyện Ba Bể", type: "Bệnh viện", status: "ONLINE", staff: 45, beds: 80, occupiedBeds: 72, equipment: ["Máy siêu âm 4D", "Phòng mổ", "Phòng ICU", "Máy CTG", "Xét nghiệm đầy đủ"], lastCheck: "19/06/2026", latitude: 22.408, longitude: 105.624 },
  { id: 5, name: "Trạm Y tế xã Bản Thi", type: "Trạm Y tế", status: "ONLINE", staff: 3, beds: 5, occupiedBeds: 2, equipment: ["Máy đo huyết áp", "Bộ đỡ đẻ", "Máy siêu âm (đang sửa)"], lastCheck: "17/06/2026", latitude: 22.390, longitude: 105.580 },
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
  ONLINE: { label: "Đang hoạt động", bg: "bg-emerald-100", text: "text-emerald-800", icon: CheckCircle },
  OFFLINE: { label: "Ngưng hoạt động", bg: "bg-red-100", text: "text-red-800", icon: WifiOff },
  MAINTENANCE: { label: "Đang bảo trì", bg: "bg-amber-100", text: "text-amber-800", icon: Wrench },
};

// =================== GEOGRAPHIC GRAPH & ROUTING ===================

const mapGraph = {
  "Trạm Y tế xã Bản Thi": { "Trạm Y tế xã Bằng Phúc": 3, "Trạm Y tế xã Quảng Khê": 4 },
  "Trạm Y tế xã Bằng Phúc": { "Trạm Y tế xã Bản Thi": 3, "BV Đa khoa huyện Ba Bể": 5 },
  "Trạm Y tế xã Quảng Khê": { "Trạm Y tế xã Bản Thi": 4, "BV Đa khoa huyện Ba Bể": 2 },
  "BV Đa khoa huyện Ba Bể": { "Trạm Y tế xã Bằng Phúc": 5, "Trạm Y tế xã Quảng Khê": 2, "Bản Khuôi": 3, "Phòng khám khu vực Nà Phặc": 10 },
  "Bản Khuôi": { "BV Đa khoa huyện Ba Bể": 3 },
  "Phòng khám khu vực Nà Phặc": { "BV Đa khoa huyện Ba Bể": 10 }
};

const mapNodes = {
  "Trạm Y tế xã Bản Thi": { name: "TYT Bản Thi", x: 60, y: 330, type: "facility" },
  "Trạm Y tế xã Bằng Phúc": { name: "TYT Bằng Phúc", x: 130, y: 360, type: "facility" },
  "Trạm Y tế xã Quảng Khê": { name: "TYT Quảng Khê", x: 260, y: 240, type: "facility" },
  "BV Đa khoa huyện Ba Bể": { name: "BV Đa khoa Ba Bể", x: 360, y: 250, type: "hospital" },
  "Bản Khuôi": { name: "Bản Khuôi", x: 440, y: 175, type: "patient" },
  "Phòng khám khu vực Nà Phặc": { name: "PK Nà Phặc", x: 540, y: 60, type: "facility" }
};

const getClosestNode = (locationName) => {
  if (!locationName) return "BV Đa khoa huyện Ba Bể";
  const name = locationName.toLowerCase();
  if (name.includes("khuôi") || name.includes("khuoi")) return "Bản Khuôi";
  if (name.includes("thi")) return "Trạm Y tế xã Bản Thi";
  if (name.includes("quảng khê") || name.includes("quang khe")) return "Trạm Y tế xã Quảng Khê";
  if (name.includes("bằng phúc") || name.includes("bang phuc")) return "Trạm Y tế xã Bằng Phúc";
  if (name.includes("nà phặc") || name.includes("na phac")) return "Phòng khám khu vực Nà Phặc";
  return "BV Đa khoa huyện Ba Bể";
};

const getAmbulanceClosestNode = (amb) => {
  const loc = amb.location.toLowerCase();
  if (loc.includes("bằng phúc") || loc.includes("bang phuc")) return "Trạm Y tế xã Bằng Phúc";
  if (loc.includes("quảng khê") || loc.includes("quang khe")) return "Trạm Y tế xã Quảng Khê";
  if (loc.includes("thi")) return "Trạm Y tế xã Bản Thi";
  if (loc.includes("nà phặc") || loc.includes("na phac")) return "Phòng khám khu vực Nà Phặc";
  if (loc.includes("khuôi") || loc.includes("khuoi")) return "Bản Khuôi";
  return "BV Đa khoa huyện Ba Bể";
};

function findShortestPath(graph, start, end) {
  const distances = {};
  const prev = {};
  const queue = [];

  for (let node in graph) {
    distances[node] = Infinity;
    prev[node] = null;
    queue.push(node);
  }
  distances[start] = 0;

  while (queue.length > 0) {
    queue.sort((a, b) => distances[a] - distances[b]);
    const u = queue.shift();

    if (u === end) break;
    if (distances[u] === Infinity) break;

    for (let neighbor in graph[u]) {
      const alt = distances[u] + graph[u][neighbor];
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        prev[neighbor] = u;
      }
    }
  }

  const path = [];
  let u = end;
  if (prev[u] || u === start) {
    while (u) {
      path.unshift(u);
      u = prev[u];
    }
  }
  return { path, distance: distances[end] };
}

// =================== MAIN COMPONENT ===================

export default function CommunityWorkerDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [reports, setReports] = useState([]);
  const [ambulances, setAmbulances] = useState(mockAmbulances);
  const [facilities, setFacilities] = useState(mockFacilities);
  const [selectedReport, setSelectedReport] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [hoveredAmbulance, setHoveredAmbulance] = useState(null);
  const [hoveredReport, setHoveredReport] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Recommendation & Dispatch States
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchReport, setDispatchReport] = useState(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState(null);

  const getHospitalRecommendations = (report) => {
    if (!report) return [];
    
    const patientNode = getClosestNode(report.location);
    
    return facilities
      .filter(f => f.status === "ONLINE")
      .map(fac => {
        const pathInfo = findShortestPath(mapGraph, patientNode, fac.name);
        const distance = pathInfo.distance === Infinity ? getDistance(report.latitude, report.longitude, fac.latitude, fac.longitude) : pathInfo.distance;
        
        const occupied = fac.occupiedBeds || 0;
        const total = fac.beds || 1;
        const occupancyRate = Math.round((occupied / total) * 100);
        
        let loadLabel = "Vắng";
        let loadColor = "text-emerald-600";
        if (occupancyRate >= 80) {
          loadLabel = "Đông";
          loadColor = "text-red-600";
        } else if (occupancyRate >= 50) {
          loadLabel = "Bình thường";
          loadColor = "text-amber-600";
        }
        
        let matchScore = 100;
        let matchText = "";
        let matchBadgeColor = "";
        
        const isHospital = fac.type === "Bệnh viện";
        const hasICUOrSurgery = fac.equipment.some(e => e.includes("ICU") || e.includes("mổ"));
        
        if (report.urgency === "RED") {
          if (hasICUOrSurgery || isHospital) {
            matchScore += 50;
            matchText = "Rất phù hợp — Tuyến đầu có phòng ICU, mổ đẻ và hồi sức cấp cứu.";
            matchBadgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
          } else {
            matchScore -= 50;
            matchText = "Hạn chế — Cơ sở cấp dưới không đủ thiết bị hồi sức và phẫu thuật đẻ.";
            matchBadgeColor = "bg-red-50 text-red-800 border-red-200";
          }
        } else {
          if (!isHospital) {
            matchScore += 30;
            matchText = "Phù hợp — Tuyến cơ sở, giúp giảm tải áp lực cho bệnh viện tuyến trên.";
            matchBadgeColor = "bg-emerald-50 text-[#0f766e] border-[#0f766e]/20";
          } else {
            matchScore += 0;
            matchText = "Bình thường — Bệnh viện tuyến trên (khuyến khích giữ giường cho ca cấp cứu).";
            matchBadgeColor = "bg-amber-50 text-amber-800 border-amber-200";
          }
        }
        
        const finalScore = matchScore - (distance * 3) - (occupancyRate * 0.4);
        
        return {
          ...fac,
          distance,
          eta: Math.round(distance * 2 + 5),
          occupancyRate,
          loadLabel,
          loadColor,
          matchText,
          matchBadgeColor,
          score: Math.round(finalScore)
        };
      })
      .sort((a, b) => b.score - a.score);
  };

  const handleOpenDispatchModal = (report, preselectedAmbulanceId = null) => {
    setDispatchReport(report);
    setSelectedAmbulanceId(preselectedAmbulanceId || getNearestAmbulance(report.latitude, report.longitude, ambulances)?.id || null);
    
    const recs = getHospitalRecommendations(report);
    if (recs.length > 0) {
      setSelectedHospitalId(recs[0].id);
    } else {
      setSelectedHospitalId(null);
    }
    setDispatchModalOpen(true);
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchReport || !selectedAmbulanceId || !selectedHospitalId) return;
    
    const amb = ambulances.find(a => a.id === selectedAmbulanceId);
    const hosp = facilities.find(f => f.id === selectedHospitalId);
    if (!amb || !hosp) return;
    
    const report = dispatchReport;
    const distanceToPatient = getDistance(report.latitude, report.longitude, amb.latitude, amb.longitude);
    const patientNode = getClosestNode(report.location);
    const hospNode = hosp.name;
    const routeToHospital = findShortestPath(mapGraph, patientNode, hospNode);
    const distanceToHospital = routeToHospital.distance;
    
    const totalDistance = distanceToPatient + distanceToHospital;
    
    setAmbulances(prev => prev.map(a => a.id === selectedAmbulanceId ? {
      ...a,
      status: "EN_ROUTE",
      location: `Đang di chuyển đến ${report.location}`,
      destination: `${report.location} → ${hosp.name}`,
      destinationHospital: hosp.name,
      eta: `~${Math.round(totalDistance * 2 + 5)} phút`
    } : a));
    
    await handleUpdateReportStatus(report.id, "IN_PROGRESS", true);
    
    setDispatchModalOpen(false);
    showToast(`🚑 Đã điều động xe ${amb.id} vận chuyển sản phụ ${report.patientName} đến ${hosp.name}. Tổng quãng đường điều phối: ${totalDistance.toFixed(1)} km.`, "success");
  };

  const getStatusPieData = () => {
    const red = reports.filter(r => r.urgency === 'RED').length;
    const yellow = reports.filter(r => r.urgency === 'YELLOW').length;
    const green = reports.filter(r => r.urgency === 'GREEN').length;
    
    const data = [
      { name: "Khẩn cấp", value: red, color: "#991B1B" },
      { name: "Theo dõi", value: yellow, color: "#D97706" },
      { name: "Thông thường", value: green, color: "#059669" },
    ].filter(d => d.value > 0);
    return data.length > 0 ? data : [{ name: "Chưa có dữ liệu", value: 1, color: "#D1D5DB" }];
  };

  const getWeeklyData = () => {
    const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = daysOfWeek[d.getDay()];
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      
      const casesInDay = reports.filter(q => {
        const qDate = new Date(q.created_at);
        return qDate.toDateString() === d.toDateString();
      });
      const completedInDay = casesInDay.filter(q => q.status === 'COMPLETED').length;
      
      result.push({
        day: `${dayLabel} (${dateStr})`,
        cases: casesInDay.length,
        completed: completedInDay
      });
    }
    return result;
  };

  const getTrendData = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      
      const casesInDay = reports.filter(q => {
        const qDate = new Date(q.created_at);
        return qDate.toDateString() === d.toDateString();
      });
      
      const red = casesInDay.filter(q => q.urgency === 'RED').length;
      const yellow = casesInDay.filter(q => q.urgency === 'YELLOW').length;
      const green = casesInDay.filter(q => q.urgency === 'GREEN').length;
      
      result.push({
        date: dateStr,
        red,
        yellow,
        green
      });
    }
    return result;
  };

  const getActiveRoute = () => {
    const report = hoveredReport || selectedReport;
    if (!report) return null;

    const patientNode = getClosestNode(report.location);
    
    let amb = null;
    if (hoveredAmbulance) {
      amb = hoveredAmbulance;
    } else {
      amb = ambulances.find(a => a.status === 'EN_ROUTE' && a.destination.includes(report.patientName)) ||
            getNearestAmbulance(report.latitude, report.longitude, ambulances);
    }
    
    if (!amb) return null;
    
    const ambNode = getAmbulanceClosestNode(amb);
    
    let hospNode = "BV Đa khoa huyện Ba Bể";
    if (amb.destinationHospital) {
      hospNode = amb.destinationHospital;
    } else if (amb.destination && amb.destination.includes("→")) {
      const parts = amb.destination.split("→");
      if (parts.length > 1) {
        hospNode = parts[1].trim();
      }
    } else {
      const nearestHosp = getNearestHospital(report.latitude, report.longitude, facilities);
      if (nearestHosp) hospNode = nearestHosp.name;
    }
    
    const routeToPatient = findShortestPath(mapGraph, ambNode, patientNode);
    const routeToHospital = findShortestPath(mapGraph, patientNode, hospNode);
    
    return {
      ambId: amb.id,
      ambPlate: amb.plate,
      ambNode,
      patientNode,
      hospNode,
      patientPath: routeToPatient.path,
      hospitalPath: routeToHospital.path,
      totalDistance: routeToPatient.distance + routeToHospital.distance
    };
  };

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
    handleOpenDispatchModal(report, ambulanceId);
  };

  const handleDispatchAmbulanceDirect = (ambulanceId) => {
    let targetReport = selectedReport;
    if (!targetReport) {
      targetReport = reports.find(r => r.urgency === 'RED' && r.status !== 'COMPLETED');
    }
    if (!targetReport) {
      targetReport = reports.find(r => r.status !== 'COMPLETED');
    }
    if (!targetReport) {
      showToast("⚠️ Không tìm thấy ca bệnh nào cần điều phối xe cấp cứu.", "warning");
      return;
    }
    handleOpenDispatchModal(targetReport, ambulanceId);
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
                <h3 className="text-4xl font-extrabold text-gray-900">{reports.length}</h3>
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
                  <PieChartIcon className="w-5 h-5 text-[#8B1E32]" /> Phân bộ báo cáo theo loại
                </h3>
                <p className="text-xs text-gray-500 mb-4">Tỷ lệ ca khẩn cấp / theo dõi / thông thường</p>
                <StatusPieChart data={getStatusPieData()} />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#8B1E32]" /> Báo cáo trong tuần
                </h3>
                <p className="text-xs text-gray-500 mb-4">Số lượng tiếp nhận và xử lý theo ngày</p>
                <WeeklyBarChart data={getWeeklyData()} />
              </div>
            </div>

            {/* Trend */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#8B1E32]" /> Xu hướng ca bệnh 7 ngày
              </h3>
              <p className="text-xs text-gray-500 mb-4">Biến động ca Đỏ, Vàng, Xanh theo thời gian</p>
              <TrendAreaChart data={getTrendData()} />
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
                      onMouseEnter={() => setHoveredReport(report)}
                      onMouseLeave={() => setHoveredReport(null)}
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
                  <span className="text-xs text-gray-400 font-medium">Định tuyến Xe Cấp Cứu Tối Giản — Ba Bể, Bắc Kạn</span>
                </div>
                <div className="flex-1 relative bg-[#0f172a] flex items-center justify-center p-4">
                  {(() => {
                    const activeRoute = getActiveRoute();
                    const activePatientNodes = reports
                      .filter(r => r.status !== 'COMPLETED')
                      .map(r => ({
                        nodeName: getClosestNode(r.location),
                        urgency: r.urgency,
                        patientName: r.patientName
                      }));

                    const mapConnections = [
                      { from: "Trạm Y tế xã Bản Thi", to: "Trạm Y tế xã Bằng Phúc" },
                      { from: "Trạm Y tế xã Bản Thi", to: "Trạm Y tế xã Quảng Khê" },
                      { from: "Trạm Y tế xã Quảng Khê", to: "BV Đa khoa huyện Ba Bể" },
                      { from: "Trạm Y tế xã Bằng Phúc", to: "BV Đa khoa huyện Ba Bể" },
                      { from: "BV Đa khoa huyện Ba Bể", to: "Bản Khuôi" },
                      { from: "BV Đa khoa huyện Ba Bể", to: "Phòng khám khu vực Nà Phặc" }
                    ];

                    const getAmbulanceCoords = (amb, idx, total) => {
                      const baseNode = getAmbulanceClosestNode(amb);
                      const coords = mapNodes[baseNode];
                      if (!coords) return { x: 300, y: 225 };
                      if (total <= 1) return { x: coords.x, y: coords.y - 15 };
                      const angle = (idx / total) * 2 * Math.PI;
                      const radius = 15;
                      return {
                        x: coords.x + Math.round(Math.cos(angle) * radius),
                        y: coords.y + Math.round(Math.sin(angle) * radius)
                      };
                    };

                    let patientPathD = "";
                    let hospitalPathD = "";

                    if (activeRoute) {
                      if (activeRoute.patientPath && activeRoute.patientPath.length > 0) {
                        patientPathD = activeRoute.patientPath
                          .map(nodeName => mapNodes[nodeName])
                          .filter(n => !!n)
                          .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`)
                          .join(" ");
                      }
                      if (activeRoute.hospitalPath && activeRoute.hospitalPath.length > 0) {
                        hospitalPathD = activeRoute.hospitalPath
                          .map(nodeName => mapNodes[nodeName])
                          .filter(n => !!n)
                          .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`)
                          .join(" ");
                      }
                    }

                    return (
                      <svg viewBox="0 0 600 400" className="w-full h-full max-h-[500px] bg-[#0f172a] rounded-xl shadow-inner relative overflow-hidden">
                        <style>
                          {`
                            @keyframes dash {
                              to {
                                stroke-dashoffset: -20;
                              }
                            }
                            .animate-dash-patient {
                              stroke-dasharray: 6 6;
                              animation: dash 1.2s linear infinite;
                            }
                            .animate-dash-hosp {
                              stroke-dasharray: 6 6;
                              animation: dash 0.8s linear infinite;
                            }
                            @keyframes pulse-ring {
                              0% {
                                r: 6px;
                                opacity: 1;
                              }
                              100% {
                                r: 22px;
                                opacity: 0;
                              }
                            }
                            .pulse-ring {
                              animation: pulse-ring 2s infinite;
                              transform-origin: center;
                            }
                          `}
                        </style>

                        {/* Grid background */}
                        <defs>
                          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* Connection lines */}
                        {mapConnections.map((conn, idx) => {
                          const fromNode = mapNodes[conn.from];
                          const toNode = mapNodes[conn.to];
                          if (!fromNode || !toNode) return null;
                          return (
                            <line 
                              key={idx}
                              x1={fromNode.x}
                              y1={fromNode.y}
                              x2={toNode.x}
                              y2={toNode.y}
                              stroke="rgba(255, 255, 255, 0.08)"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          );
                        })}

                        {/* Dijkstra Route Leg 1: Ambulance -> Patient (Blue) */}
                        {patientPathD && (
                          <>
                            <path d={patientPathD} stroke="#1d4ed8" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                            <path d={patientPathD} stroke="#3b82f6" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-dash-patient" />
                          </>
                        )}

                        {/* Dijkstra Route Leg 2: Patient -> Hospital (Red) */}
                        {hospitalPathD && (
                          <>
                            <path d={hospitalPathD} stroke="#b91c1c" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                            <path d={hospitalPathD} stroke="#ef4444" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-dash-hosp" />
                          </>
                        )}

                        {/* Town / Station Nodes */}
                        {Object.entries(mapNodes).map(([nodeName, node]) => {
                          const isActivePatientNode = activePatientNodes.some(p => p.nodeName === nodeName);
                          const isSelected = selectedNode === nodeName;
                          return (
                            <g 
                              key={nodeName} 
                              className="cursor-pointer"
                              onClick={() => setSelectedNode(nodeName)}
                            >
                              {isActivePatientNode && (
                                <circle cx={node.x} cy={node.y} r="14" fill="none" stroke="#ef4444" strokeWidth="2" className="pulse-ring" />
                              )}
                              <circle 
                                cx={node.x} 
                                cy={node.y} 
                                r={node.type === 'hospital' ? 12 : 8} 
                                fill={node.type === 'hospital' ? '#b91c1c' : node.type === 'facility' ? '#0f766e' : '#334155'}
                                stroke={isSelected ? '#f59e0b' : '#ffffff'}
                                strokeWidth={isSelected ? 2.5 : 1}
                              />
                              <text 
                                x={node.x} 
                                y={node.y + (node.type === 'hospital' ? 24 : 20)} 
                                textAnchor="middle" 
                                fill="#94a3b8" 
                                fontSize="9" 
                                fontWeight="bold"
                                className="select-none pointer-events-none"
                              >
                                {node.name}
                              </text>
                              {node.type === 'hospital' && (
                                <text 
                                  x={node.x} 
                                  y={node.y + 3.5} 
                                  textAnchor="middle" 
                                  fill="#ffffff" 
                                  fontSize="10" 
                                  fontWeight="black"
                                  className="select-none pointer-events-none"
                                >
                                  H
                                </text>
                              )}
                            </g>
                          );
                        })}

                        {/* Active Patient Blinking Dots */}
                        {activePatientNodes.map((p, idx) => {
                          const coords = mapNodes[p.nodeName];
                          if (!coords) return null;
                          return (
                            <g key={idx} className="pointer-events-none">
                              <circle cx={coords.x} cy={coords.y} r="4" fill={p.urgency === 'RED' ? '#ef4444' : '#f59e0b'} />
                            </g>
                          );
                        })}

                        {/* Ambulance Rectangles */}
                        {ambulances.map((amb, idx) => {
                          const total = ambulances.length;
                          const coords = getAmbulanceCoords(amb, idx, total);
                          const isHovered = hoveredAmbulance?.id === amb.id;
                          return (
                            <g 
                              key={amb.id} 
                              className="cursor-pointer"
                              onClick={() => setHoveredAmbulance(amb)}
                              onMouseEnter={() => setHoveredAmbulance(amb)}
                              onMouseLeave={() => setHoveredAmbulance(null)}
                            >
                              <rect 
                                x={coords.x - 16} 
                                y={coords.y - 8} 
                                width="32" 
                                height="16" 
                                rx="3" 
                                fill={amb.status === 'AVAILABLE' ? '#10b981' : amb.status === 'EN_ROUTE' ? '#3b82f6' : '#6b7280'} 
                                stroke={isHovered ? '#f59e0b' : '#ffffff'}
                                strokeWidth={isHovered ? 1.5 : 0.8}
                              />
                              <text 
                                x={coords.x} 
                                y={coords.y + 3} 
                                textAnchor="middle" 
                                fill="#ffffff" 
                                fontSize="7" 
                                fontWeight="bold"
                                className="select-none pointer-events-none"
                              >
                                {amb.id.replace("XC-", "XC")}
                              </text>
                            </g>
                          );
                        })}

                        {/* Active Route Box */}
                        {activeRoute && (
                          <foreignObject x="15" y="15" width="220" height="100" className="pointer-events-none">
                            <div className="bg-slate-900/95 backdrop-blur-sm p-3 rounded-lg border border-blue-500/20 text-white space-y-1 shadow-lg text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-wider">LỘ TRÌNH ĐIỀU PHỐI</span>
                                <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded">{activeRoute.ambId}</span>
                              </div>
                              <p className="text-xs font-bold truncate text-slate-100">
                                {mapNodes[activeRoute.ambNode]?.name || activeRoute.ambNode} → {mapNodes[activeRoute.patientNode]?.name || activeRoute.patientNode}
                              </p>
                              <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 mt-1.5">
                                <div>
                                  <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Quãng đường</span>
                                  <span className="text-xs font-extrabold text-blue-400">{activeRoute.totalDistance} km</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Thời gian đi</span>
                                  <span className="text-xs font-extrabold text-emerald-400">~{Math.round(activeRoute.totalDistance * 2 + 5)} phút</span>
                                </div>
                              </div>
                            </div>
                          </foreignObject>
                        )}

                        {/* Tooltip for Selected Node */}
                        {selectedNode && !activeRoute && (
                          <foreignObject x="15" y="15" width="200" height="80">
                            <div className="bg-slate-900/95 backdrop-blur-sm p-3 rounded-lg border border-slate-800 text-white space-y-1 shadow-lg relative text-left">
                              <button 
                                onClick={() => setSelectedNode(null)} 
                                className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <p className="text-[9px] font-bold text-yellow-500 uppercase">Thông tin địa điểm</p>
                              <h4 className="text-xs font-bold text-slate-100">{selectedNode}</h4>
                              <p className="text-[9px] text-slate-400 font-medium">
                                {mapNodes[selectedNode]?.type === 'hospital' ? 'Bệnh viện trung tâm' : 
                                 mapNodes[selectedNode]?.type === 'facility' ? 'Trạm Y tế xã' : 'Bản làng cư dân'}
                              </p>
                            </div>
                          </foreignObject>
                        )}

                        {/* Map Legend */}
                        <g transform="translate(15, 365)">
                          <rect width="320" height="20" rx="3" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
                          <g transform="translate(8, 10)">
                            <circle r="3" fill="#b91c1c" />
                            <text x="6" y="3" fill="#94a3b8" fontSize="7" fontWeight="bold">Bệnh viện</text>
                          </g>
                          <g transform="translate(70, 10)">
                            <circle r="3" fill="#0f766e" />
                            <text x="6" y="3" fill="#94a3b8" fontSize="7" fontWeight="bold">TYT Xã</text>
                          </g>
                          <g transform="translate(125, 10)">
                            <circle r="3" fill="#ef4444" />
                            <circle r="5" fill="none" stroke="#ef4444" strokeWidth="0.8" className="pulse-ring" />
                            <text x="10" y="3" fill="#94a3b8" fontSize="7" fontWeight="bold">Sản phụ</text>
                          </g>
                          <g transform="translate(185, 10)">
                            <rect x="-5" y="-3.5" width="10" height="7" rx="1" fill="#10b981" />
                            <text x="8" y="3" fill="#94a3b8" fontSize="7" fontWeight="bold">Xe sẵn sàng</text>
                          </g>
                          <g transform="translate(255, 10)">
                            <rect x="-5" y="-3.5" width="10" height="7" rx="1" fill="#3b82f6" />
                            <text x="8" y="3" fill="#94a3b8" fontSize="7" fontWeight="bold">Xe đang chạy</text>
                          </g>
                        </g>
                      </svg>
                    );
                  })()}
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
                      <div 
                        key={amb.id} 
                        onMouseEnter={() => setHoveredAmbulance(amb)}
                        onMouseLeave={() => setHoveredAmbulance(null)}
                        className={`bg-white p-5 rounded-2xl shadow-sm border transition-all ${
                          hoveredAmbulance?.id === amb.id ? 'ring-2 ring-[#8B1E32]/20 border-[#8B1E32]' : 'border-gray-200'
                        } hover:shadow-md`}
                      >
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

      {/* Dispatch Modal */}
      <AnimatePresence>
        {dispatchModalOpen && dispatchReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden text-left"
            >
              {/* Header */}
              <div className="px-8 py-5 border-b border-gray-100 bg-[#8B1E32] text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Ambulance className="w-6 h-6 animate-pulse" /> Đề Xuất Điều Phối Y Tế Khẩn Cấp
                  </h3>
                  <p className="text-white/80 text-xs mt-1">Phân tích GPS tối ưu lộ trình và tài nguyên cơ sở</p>
                </div>
                <button 
                  onClick={() => setDispatchModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Patient Info & Ambulance Selection */}
                <div className="space-y-6">
                  {/* Patient Info Card */}
                  <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100/60">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      dispatchReport.urgency === 'RED' ? 'bg-red-100 border-red-200 text-red-700' :
                      dispatchReport.urgency === 'YELLOW' ? 'bg-amber-100 border-amber-200 text-amber-700' :
                      'bg-emerald-100 border-emerald-200 text-emerald-700'
                    } uppercase tracking-wider mb-2.5 inline-block`}>
                      Mức độ: {dispatchReport.urgency === 'RED' ? 'Khẩn cấp (Đỏ)' : dispatchReport.urgency === 'YELLOW' ? 'Theo dõi (Vàng)' : 'Thông thường (Xanh)'}
                    </span>
                    <h4 className="text-lg font-black text-gray-900">{dispatchReport.patientName}</h4>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-500" />{dispatchReport.location}</p>
                    <div className="mt-3.5 bg-white px-4 py-2.5 rounded-xl border border-rose-100/50 text-xs font-semibold text-gray-600 flex justify-between items-center">
                      <span>Tọa độ GPS sản phụ:</span>
                      <span className="font-bold text-gray-900">{dispatchReport.latitude?.toFixed(4)}, {dispatchReport.longitude?.toFixed(4)}</span>
                    </div>
                    <p className="text-xs text-gray-600 italic mt-3 bg-white/40 p-3 rounded-xl border border-dashed border-rose-100">
                      &quot;{dispatchReport.summary}&quot;
                    </p>
                  </div>

                  {/* Ambulance Selection List */}
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900 mb-3.5 flex items-center gap-1.5">
                      <Truck className="w-4.5 h-4.5 text-[#8B1E32]" /> 1. Chọn Xe cấp cứu sẵn sàng
                    </h4>
                    <div className="space-y-3">
                      {ambulances.map(amb => {
                        const isSelected = selectedAmbulanceId === amb.id;
                        const dist = getDistance(dispatchReport.latitude, dispatchReport.longitude, amb.latitude, amb.longitude);
                        const isAvailable = amb.status === 'AVAILABLE';
                        
                        return (
                          <div
                            key={amb.id}
                            onClick={() => isAvailable && setSelectedAmbulanceId(amb.id)}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                              !isAvailable ? 'bg-gray-50 opacity-60 border-gray-200 cursor-not-allowed' :
                              isSelected ? 'border-[#8B1E32] ring-2 ring-[#8B1E32]/10 bg-rose-50/20 cursor-pointer' :
                              'border-gray-200 hover:border-gray-300 cursor-pointer bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-[#8B1E32] text-white' : 'bg-gray-100 text-gray-500'
                              }`}>
                                <Ambulance className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-sm text-gray-900">{amb.id}</span>
                                  <span className="text-[10px] text-gray-400 font-medium">({amb.plate})</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{amb.driver} • {amb.location}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {isAvailable ? (
                                <>
                                  <span className="text-xs font-black text-emerald-600 block">Sẵn sàng</span>
                                  <span className="text-[11px] font-bold text-gray-500">Cách: {dist} km</span>
                                </>
                              ) : (
                                <span className="text-xs font-bold text-gray-400">Đang bận</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Hospital Recommendation Suggestions */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-extrabold text-gray-900 mb-3.5 flex items-center gap-1.5">
                    <Building2 className="w-4.5 h-4.5 text-[#8B1E32]" /> 2. Đề xuất điểm đến (Đã xếp hạng phù hợp)
                  </h4>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[350px]">
                    {getHospitalRecommendations(dispatchReport).map((fac, idx) => {
                      const isSelected = selectedHospitalId === fac.id;
                      
                      return (
                        <div
                          key={fac.id}
                          onClick={() => setSelectedHospitalId(fac.id)}
                          className={`p-4.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col gap-2 relative ${
                            isSelected ? 'border-[#8B1E32] ring-2 ring-[#8B1E32]/10 bg-rose-50/10' :
                            'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          {/* Rank badge */}
                          <span className={`absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            Khớp #{idx + 1}
                          </span>

                          <div className="flex items-start gap-2.5 pr-14">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-rose-50 text-[#8B1E32] border border-rose-100' : 'bg-gray-50 text-gray-500'
                            }`}>
                              {fac.type === 'Bệnh viện' ? <Hospital className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-gray-900">{fac.name}</h5>
                              <p className="text-[11px] text-gray-500 mt-0.5">{fac.type} • Tải giường: <span className={`font-bold ${fac.loadColor}`}>{fac.occupiedBeds}/{fac.beds} ({fac.occupancyRate}%) - {fac.loadLabel}</span></p>
                            </div>
                          </div>

                          {/* Priority match tag */}
                          <div className={`text-xs px-3 py-2 rounded-xl border ${fac.matchBadgeColor}`}>
                            {fac.matchText}
                          </div>

                          {/* Distance & ETA */}
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 border-t border-gray-100 pt-2.5 mt-1">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" /> Tối ưu: {fac.distance} km</span>
                            <span className="text-emerald-600">ETA ước tính: ~{fac.eta} phút</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-gray-100 bg-gray-55/40 flex items-center justify-between shrink-0">
                <p className="text-xs text-gray-500 max-w-md">
                  * Lộ trình di chuyển thực tế sẽ được hiển thị ngay trên bản đồ GPS sau khi nhân viên xác nhận.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDispatchModalOpen(false)}
                    className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleConfirmDispatch}
                    disabled={!selectedAmbulanceId || !selectedHospitalId}
                    className="px-6 py-2.5 bg-[#8B1E32] text-white font-bold rounded-xl text-sm hover:bg-rose-900 transition-colors shadow-lg shadow-rose-600/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" /> Xác nhận Điều phối
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
