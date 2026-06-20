import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Stethoscope, Activity } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-[#8B1E32] mb-4">ViTem</h1>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          Intelligent AI Triage system supporting reproductive health for ethnic minority communities. Please select your role to log in:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {/* Patient Role */}
        <div 
          onClick={() => navigate("/patient")}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all cursor-pointer flex flex-col items-center text-center group"
        >
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <User className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient</h2>
          <p className="text-gray-500 text-sm">Submit exam results, receive guidelines in English and Tày.</p>
        </div>

        {/* Midwife Role */}
        <div 
          onClick={() => navigate("/midwife")}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all cursor-pointer flex flex-col items-center text-center group"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Activity className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Midwife</h2>
          <p className="text-gray-500 text-sm">Manage Yellow cases, review medication schedules, and check appointments.</p>
        </div>

        {/* Doctor Role */}
        <div 
          onClick={() => navigate("/doctor")}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-300 transition-all cursor-pointer flex flex-col items-center text-center group"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Stethoscope className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor</h2>
          <p className="text-gray-500 text-sm">Manage urgent Red cases and issue final emergency medical instructions.</p>
        </div>
      </div>
    </div>
  );
}
