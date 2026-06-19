import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, FileText, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

const tagConfig = {
  GREEN: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", label: "Bình thường", icon: CheckCircle2 },
  YELLOW: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-400", label: "Cần theo dõi", icon: AlertCircle },
  RED: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500", label: "Nguy hiểm", icon: AlertTriangle },
};

export default function HealthChecklist({ checklist = [], patientName, date, overallUrgency, compact = false }) {
  if (!checklist || checklist.length === 0) return null;

  const greenCount = checklist.filter(i => i.tag === "GREEN").length;
  const yellowCount = checklist.filter(i => i.tag === "YELLOW").length;
  const redCount = checklist.filter(i => i.tag === "RED").length;

  const urgencyConfig = tagConfig[overallUrgency] || tagConfig.GREEN;
  const UrgencyIcon = urgencyConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden ${compact ? '' : 'shadow-sm'}`}
      style={{ borderColor: '#e5e7eb' }}
    >
      {/* Header - Giấy khám sức khỏe */}
      <div className={`px-5 py-4 flex items-center justify-between ${urgencyConfig.bg} border-b ${urgencyConfig.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${overallUrgency === 'RED' ? 'bg-red-100' : overallUrgency === 'YELLOW' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
            <FileText className={`w-5 h-5 ${urgencyConfig.text}`} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Phiếu Khám Sức Khỏe</h4>
            {patientName && <p className="text-xs text-gray-500">{patientName} {date ? `• ${date}` : ''}</p>}
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${urgencyConfig.bg} ${urgencyConfig.text} border ${urgencyConfig.border}`}>
          <UrgencyIcon className="w-3.5 h-3.5" />
          {overallUrgency === 'RED' ? 'Ca Đỏ' : overallUrgency === 'YELLOW' ? 'Ca Vàng' : 'Bình thường'}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="divide-y divide-gray-100">
        {checklist.map((item, idx) => {
          const cfg = tagConfig[item.tag] || tagConfig.GREEN;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`px-5 py-3 flex items-start gap-3 hover:bg-gray-50/50 transition-colors ${compact ? 'py-2.5' : ''}`}
            >
              {/* Tag Dot */}
              <div className="mt-1 flex-shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${item.tag === 'RED' ? 'shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' : ''}`}></div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                  <span className={`text-sm font-bold ${cfg.text} whitespace-nowrap`}>{item.value}</span>
                </div>
                {!compact && item.note && (
                  <p className={`text-xs mt-0.5 ${cfg.text} opacity-80`}>{item.note}</p>
                )}
              </div>

              {/* Tag Badge */}
              <div className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                {item.tag === 'RED' ? '🔴' : item.tag === 'YELLOW' ? '🟡' : '🟢'}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-gray-600">{greenCount} bình thường</span>
          </span>
          {yellowCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-gray-600">{yellowCount} cần theo dõi</span>
            </span>
          )}
          {redCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-gray-600">{redCount} nguy hiểm</span>
            </span>
          )}
        </div>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">ViTeM AI</span>
      </div>
    </motion.div>
  );
}
