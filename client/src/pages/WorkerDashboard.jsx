import React, { useState, useEffect } from "react";
import { LayoutDashboard, ListChecks, Users, Bell, Search, AlertTriangle, FileText, CheckCircle, PlayCircle, X, Activity, BarChart3, Clock, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { motion } from "framer-motion";
import HealthChecklist from "../components/HealthChecklist";
import { UrgencyPieChart, WeeklyBarChart, TrendAreaChart } from "../components/ChartComponents";

export default function WorkerDashboard({ role = "DOCTOR" }) {
  const [activeTab, setActiveTab] = useState("Queue");
  const [selectedCase, setSelectedCase] = useState(null);
  const [queue, setQueue] = useState([]);
  
  const filteredQueue = queue.filter(q => {
    if (role === "DOCTOR") return q.urgency === "RED";
    if (role === "MIDWIFE") return q.urgency === "YELLOW";
    return true;
  });
  const [loading, setLoading] = useState(true);

  // Form Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    patientName: "",
    phone_number: "",
    summary: "",
    suggestion_for_doctor: "",
    instruction_for_patient: ""
  });

  // Modal State
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  // Polling updates from backend every 5 seconds (safely dependency tracking)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCases();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedCase, isEditing]);

  // When selectedCase changes, update the editForm
  useEffect(() => {
    if (selectedCase) {
      setEditForm({
        patientName: selectedCase.patientName || "",
        phone_number: selectedCase.phone_number || "",
        summary: selectedCase.summary || "",
        suggestion_for_doctor: selectedCase.suggestion_for_doctor || "",
        instruction_for_patient: selectedCase.instruction_for_patient || ""
      });
      setIsEditing(false);
    }
  }, [selectedCase]);

  const fetchCases = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/documents");
      const data = await response.json();
      if (data.success) {
        setQueue(data.cases);
        
        // Update selectedCase if it is modified on server but NOT currently being edited
        if (selectedCase) {
          const updated = data.cases.find(c => c.id === selectedCase.id);
          if (updated && !isEditing) {
            if (JSON.stringify(updated) !== JSON.stringify(selectedCase)) {
              setSelectedCase(updated);
            }
          }
        } else if (data.cases.length > 0) {
          const relevant = data.cases.filter(q => role === "DOCTOR" ? q.urgency === "RED" : q.urgency === "YELLOW");
          if (relevant.length > 0) setSelectedCase(relevant[0]);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedCase) return;
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${selectedCase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        setQueue(queue.map(c => c.id === selectedCase.id ? data.case : c));
        setSelectedCase(data.case);
        setIsEditing(false);
      } else {
        alert("Lỗi khi lưu thay đổi");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối khi lưu thay đổi");
    }
  };

  const handleApprove = async () => {
    if (!selectedCase) return;
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${selectedCase.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        setQueue(queue.map(c => c.id === selectedCase.id ? data.case : c));
        setSelectedCase(null);
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to approve");
    }
  };

  const handleEscalate = async () => {
    if (!selectedCase) return;
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${selectedCase.id}/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        setQueue(queue.map(c => c.id === selectedCase.id ? data.case : c));
        setSelectedCase(null);
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to escalate");
    }
  };

  // Chart data derived from queue
  const redCount = queue.filter(q => q.urgency === 'RED').length;
  const yellowCount = queue.filter(q => q.urgency === 'YELLOW').length;
  const greenCount = queue.filter(q => q.urgency === 'GREEN').length;

  const getWeeklyData = () => {
    const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = daysOfWeek[d.getDay()];
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      
      const casesInDay = queue.filter(q => {
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
      
      const casesInDay = queue.filter(q => {
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

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-gray-800">
      
      {/* 1. Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col items-center py-6 shadow-sm z-10">
        <h1 className="text-3xl font-bold text-[#8B1E32] mb-10 tracking-tight">ViTem</h1>
        
        <nav className="w-full px-4 space-y-2 flex-1">
          <p className="text-xs font-bold text-gray-400 mb-4 ml-4 uppercase tracking-wider">Main Menu</p>
        <div className="mt-8 space-y-2">
          <button 
            onClick={() => setActiveTab("Dashboard")}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'Dashboard' ? 'bg-[#8B1E32] text-white shadow-md' : 'text-gray-600 hover:bg-rose-50 hover:text-[#8B1E32]'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("Queue")}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'Queue' ? 'bg-[#8B1E32] text-white shadow-md' : 'text-gray-600 hover:bg-rose-50 hover:text-[#8B1E32]'}`}
          >
            <ListChecks className="w-5 h-5 mr-3" /> Verification Queue
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{queue.filter(q => q.status !== 'COMPLETED').length}</span>
          </button>
          <button 
            onClick={() => setActiveTab("Records")}
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'Records' ? 'bg-[#8B1E32] text-white shadow-md' : 'text-gray-600 hover:bg-rose-50 hover:text-[#8B1E32]'}`}
          >
            <Users className="w-5 h-5 mr-3" /> Patient Records
          </button>
        </div>
        </nav>

        <div className="w-full px-4 mt-auto">
          <div className="flex items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100">
            <div className="w-8 h-8 rounded-full bg-gray-300 mr-3 overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-800">{role === "DOCTOR" ? "Bác Sĩ Nguyễn" : "Nữ hộ sinh Mai"}</p>
              <p className="text-xs text-gray-500">{role === "DOCTOR" ? "Trưởng Khoa" : "Senior Midwife"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 p-8 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <div className="flex justify-between items-end mb-8 shrink-0">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {activeTab === 'Dashboard' ? 'Overall Analytics' : activeTab === 'Records' ? 'Patient History' : 'Worker Dashboard'}
            </h2>
            <p className="text-gray-500 mt-1">Good morning, {role === "DOCTOR" ? "Bác Sĩ" : "Nữ Hộ Sinh"}. You have <strong className="text-[#8B1E32]">{filteredQueue.filter(q => q.status !== 'COMPLETED').length} cases</strong> requiring your review.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-600 shadow-sm transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>

        {activeTab === 'Records' && (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="text-lg">This section is currently under development. Please use the Verification Queue.</p>
          </div>
        )}

        {activeTab === 'Dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 overflow-y-auto pr-4"
          >
            {/* KPI Cards Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-rose-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Cases</span>
                </div>
                <div>
                  <h3 className="text-4xl font-extrabold text-gray-900">{queue.length}</h3>
                  <p className="text-sm text-gray-500 mt-1">All time</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Review</span>
                </div>
                <div>
                  <h3 className="text-4xl font-extrabold text-gray-900">{queue.filter(q => q.status !== 'COMPLETED').length}</h3>
                  <p className="text-sm text-gray-500 mt-1">Needs attention</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completion Rate</span>
                </div>
                <div>
                  <h3 className="text-4xl font-extrabold text-gray-900">{Math.round((queue.filter(q => q.status === 'COMPLETED').length / (queue.length || 1)) * 100)}%</h3>
                  <p className="text-sm text-gray-500 mt-1">Efficiency score</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Confidence</span>
                </div>
                <div>
                  <h3 className="text-4xl font-extrabold text-gray-900">{Math.round(queue.reduce((acc, curr) => acc + curr.confidence, 0) / (queue.length || 1))}%</h3>
                  <p className="text-sm text-gray-500 mt-1">Average accuracy</p>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#8B1E32]" /> Phân bố mức độ khẩn cấp
                </h3>
                <p className="text-xs text-gray-500 mb-4">Tổng ca theo mức RED / YELLOW / GREEN</p>
                <UrgencyPieChart redCount={redCount} yellowCount={yellowCount} greenCount={greenCount} />
              </div>

              {/* Bar Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#8B1E32]" /> Ca xử lý theo ngày
                </h3>
                <p className="text-xs text-gray-500 mb-4">Số ca tiếp nhận và hoàn tất trong tuần</p>
                <WeeklyBarChart data={getWeeklyData()} />
              </div>
            </div>

            {/* Trend Area Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#8B1E32]" /> Xu hướng ca bệnh 7 ngày
              </h3>
              <p className="text-xs text-gray-500 mb-4">Biến động số ca Đỏ, Vàng, Xanh theo thời gian</p>
              <TrendAreaChart data={getTrendData()} />
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Recent AI Triage Activity</h3>
              <div className="space-y-6">
                {queue.slice(0, 5).map((q, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${q.urgency === 'RED' ? 'bg-[#8B1E32] shadow-[0_0_10px_rgba(139,30,50,0.5)]' : q.urgency === 'YELLOW' ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
                      {idx !== 4 && <div className="absolute top-4 left-1.5 w-0.5 h-12 bg-gray-100 -ml-[0.5px]"></div>}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-bold text-gray-900">{q.patientName} <span className="text-gray-400 font-normal ml-2">Confidence: {q.confidence}%</span></p>
                      <p className="text-sm text-gray-500 mt-0.5 truncate max-w-2xl">{q.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {activeTab === 'Queue' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8 shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Active Cases</p>
              <div className="flex items-end">
                <span className="text-4xl font-bold text-gray-900">{queue.length}</span>
                <span className="text-emerald-500 text-sm font-bold ml-2 mb-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  {filteredQueue.length} relevant
                </span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#8B1E32] border-y border-r border-gray-200">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 rounded-full bg-[#8B1E32] mr-2 animate-pulse"></div>
                <p className="text-xs font-bold text-[#8B1E32] uppercase tracking-wider">Pending Review</p>
              </div>
              <div className="flex items-end mb-2">
                <span className="text-4xl font-bold text-gray-900">{filteredQueue.filter(q => q.status !== 'COMPLETED').length}</span>
                <span className="text-gray-500 text-sm ml-2 mb-1">total in queue</span>
              </div>
              <div className="flex space-x-2">
                {role === "DOCTOR" ? <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-md">Red Cases</span> : <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-md">Yellow Cases</span>}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Completed Today</p>
              <div className="flex items-end">
                <span className="text-4xl font-bold text-gray-900">{queue.filter(q => q.status === 'COMPLETED').length}</span>
                <span className="text-gray-500 text-sm ml-2 mb-1">verifications</span>
              </div>
            </div>
            </div>

        {/* Split View Content */}
        <div className="flex-1 flex overflow-hidden gap-6">
          
          {/* 2. Middle Pane (Queue List) */}
          <div className="w-1/3 flex flex-col bg-transparent">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Verification Queue</h3>
              <button className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center">
                <Search className="w-4 h-4 mr-1" /> Filter
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {filteredQueue.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedCase(item)}
                  className={`bg-white p-5 rounded-2xl border-l-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    selectedCase && item.id === selectedCase.id ? 'border-[#8B1E32] ring-2 ring-[#8B1E32]/20' : 
                    item.status === 'WAITING_DOCTOR' || item.urgency === 'RED' ? 'border-red-500' : 
                    item.status === 'WAITING_MIDWIFE' || item.urgency === 'YELLOW' ? 'border-amber-400' : 'border-emerald-500 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-bold text-lg ${item.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.patientName}</h4>
                    {(item.status === 'WAITING_DOCTOR' || item.urgency === 'RED') && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center uppercase"><AlertTriangle className="w-3 h-3 mr-1" /> Danger Signs</span>}
                    {(item.status === 'WAITING_MIDWIFE' || item.urgency === 'YELLOW') && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded uppercase">Med Schedule</span>}
                    {item.status === 'COMPLETED' && <span className="text-emerald-500 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Verified</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.summary}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                    <span>Submitted: {new Date(item.created_at).toLocaleTimeString()}</span>
                    {item.status !== 'COMPLETED' && <span className="flex items-center">Confidence: {item.confidence}%</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Right Pane (Detail View) */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            {!selectedCase ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">{loading ? "Đang tải dữ liệu..." : "Chưa có hồ sơ nào cần duyệt"}</p>
              </div>
            ) : (
              <>
                {/* Urgent Banner */}
                <div className={`text-white px-6 py-4 flex flex-col ${selectedCase.urgency === 'RED' ? 'bg-[#8B1E32]' : selectedCase.urgency === 'YELLOW' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                  <div className="flex items-center font-bold text-lg">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {selectedCase.urgency === 'RED' ? 'URGENT REVIEW' : selectedCase.urgency === 'YELLOW' ? 'REVIEW REQUIRED' : 'COMPLETED'}: {selectedCase.patientName}
                  </div>
                  <p className="text-white/80 text-sm mt-1">
                    {selectedCase.urgency === 'RED' ? `Low AI Confidence (${selectedCase.confidence}%) on Danger Signs extraction.` : `AI Confidence: ${selectedCase.confidence}%`}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6" key={selectedCase.id}>
                  {/* Health Checklist - Giấy khám sức khỏe */}
                  {selectedCase.health_checklist && selectedCase.health_checklist.length > 0 && (
                    <HealthChecklist
                      checklist={selectedCase.health_checklist}
                      patientName={selectedCase.patientName}
                      date={new Date(selectedCase.created_at).toLocaleDateString('vi-VN')}
                      overallUrgency={selectedCase.urgency}
                    />
                  )}

                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Source Image */}
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Source Image</h4>
                      <div className="bg-gray-100 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-gray-200 relative group">
                        <FileText className="w-16 h-16 text-gray-300" />
                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setShowImageModal(true)} className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-bold shadow-sm backdrop-blur-sm text-sm">View Full Document</button>
                        </div>
                      </div>
                    </div>

                    {/* Extracted Data */}
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Extracted Data</h4>
                        {selectedCase.confidence < 90 && (
                          <span className="text-xs font-bold text-[#8B1E32] uppercase flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Needs Correction
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Patient Name</label>
                          <input 
                            type="text" 
                            value={editForm.patientName} 
                            onChange={(e) => setEditForm({...editForm, patientName: e.target.value})}
                            readOnly={!isEditing}
                            className={`w-full rounded-lg p-2.5 text-gray-900 outline-none transition-colors ${isEditing ? 'border-2 border-[#8B1E32] bg-white shadow-inner focus:ring-2 focus:ring-[#8B1E32]/20' : 'border border-gray-200 bg-gray-50'}`} 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Reported Symptoms / Diagnosis</label>
                          <div className="relative">
                            <textarea 
                              value={editForm.summary} 
                              onChange={(e) => setEditForm({...editForm, summary: e.target.value})}
                              readOnly={!isEditing}
                              rows={3} 
                              className={`w-full rounded-lg p-2.5 outline-none transition-colors ${isEditing ? 'border-2 border-[#8B1E32] bg-white shadow-inner text-gray-900 focus:ring-2 focus:ring-[#8B1E32]/20' : 'bg-red-50 border border-red-200 text-red-900'}`} 
                            />
                            {!isEditing && <div className="absolute top-2.5 right-2.5 text-red-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></div>}
                          </div>
                          <p className="text-xs text-red-600 mt-1 italic">AI Confidence: {selectedCase.confidence}%</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                          <input 
                            type="text" 
                            value={editForm.phone_number} 
                            onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                            readOnly={!isEditing}
                            className={`w-full rounded-lg p-2.5 text-gray-900 outline-none transition-colors ${isEditing ? 'border-2 border-[#8B1E32] bg-white shadow-inner focus:ring-2 focus:ring-[#8B1E32]/20' : 'border border-gray-200 bg-gray-50'}`} 
                          />
                        </div>
                        {(isEditing || editForm.suggestion_for_doctor) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Gợi ý cho Bác sĩ (Escalate)</label>
                            <textarea 
                              value={editForm.suggestion_for_doctor} 
                              onChange={(e) => setEditForm({...editForm, suggestion_for_doctor: e.target.value})}
                              readOnly={!isEditing}
                              rows={3} 
                              placeholder="Nhập ghi chú hoặc gợi ý cho bác sĩ (nếu cần chuyển viện/chuyển ca)..."
                              className={`w-full rounded-lg p-2.5 outline-none transition-colors ${isEditing ? 'border-2 border-rose-500 bg-white shadow-inner focus:ring-2 focus:ring-rose-500/20' : 'border border-gray-200 bg-gray-50'}`} 
                            />
                          </div>
                        )}
                        {(isEditing || editForm.instruction_for_patient) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Hướng dẫn cho Bệnh nhân</label>
                            <textarea 
                              value={editForm.instruction_for_patient} 
                              onChange={(e) => setEditForm({...editForm, instruction_for_patient: e.target.value})}
                              readOnly={!isEditing}
                              rows={3} 
                              placeholder="Nhập hướng dẫn, dặn dò uống thuốc, lịch tái khám cho bệnh nhân..."
                              className={`w-full rounded-lg p-2.5 outline-none transition-colors ${isEditing ? 'border-2 border-emerald-500 bg-white shadow-inner focus:ring-2 focus:ring-emerald-500/20' : 'border border-gray-200 bg-gray-50'}`} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
                  <button 
                    onClick={() => {
                      if (isEditing) {
                        handleSaveChanges();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    className={`px-5 py-2.5 border font-bold rounded-xl transition-colors ${isEditing ? 'border-[#8B1E32] text-[#8B1E32] bg-rose-50' : 'border-gray-300 text-gray-700 hover:bg-white bg-transparent'}`}
                  >
                    {isEditing ? "Save Edits" : "Edit Extraction"}
                  </button>
                  <div className="space-x-3 flex items-center">
                    {role === 'MIDWIFE' && (
                      <button onClick={handleEscalate} className="px-5 py-2.5 bg-[#8B1E32] text-white font-bold rounded-xl shadow-sm hover:bg-rose-900 transition-colors">
                        Escalate to Doctor
                      </button>
                    )}
                    <button onClick={handleApprove} className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors flex items-center">
                      <PlayCircle className="w-4 h-4 mr-2" /> Approve & Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
          </>
        )}
        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
            <div className="relative max-w-4xl w-full h-full flex flex-col items-center justify-center">
              <button 
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              {selectedCase?.document_url && selectedCase.document_url !== "mock_url" ? (
                <img src={selectedCase.document_url} className="max-h-full max-w-full rounded-xl object-contain" />
              ) : (
                <div className="bg-gray-900 w-full max-w-lg h-96 rounded-2xl flex flex-col items-center justify-center text-gray-500 shadow-2xl">
                  <FileText className="w-24 h-24 mb-6 opacity-20" />
                  <p className="text-xl">Image not available in Mock Mode</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
