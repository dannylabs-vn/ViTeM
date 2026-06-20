import React from "react";
import { useNavigate } from "react-router-dom";
import { HeartPulse, ShieldCheck, Activity, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-rose-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-rose-700" />
            <span className="text-2xl font-extrabold text-rose-800 tracking-tight">ViTem</span>
          </div>
          <button 
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-rose-600 text-white font-bold rounded-full hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-800 font-semibold text-sm mx-auto">
            <ShieldCheck className="w-4 h-4" /> Smart Medical AI Solution
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight max-w-4xl mx-auto">
            AI Triage System Supporting <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-pink-600">
              Reproductive Healthcare
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The ViTem project utilizes Artificial Intelligence (AI) for automated medical triage, prioritization of care, and ethnic minority language support (Tày language).
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <button 
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-gradient-to-r from-rose-700 to-rose-600 text-white rounded-full font-bold text-lg shadow-xl shadow-rose-600/30 hover:-translate-y-1 transition-transform flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Activity className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Automated Triage</h3>
            <p className="text-gray-600">AI comprehends medical examination documents and automatically routes them (Red, Yellow, Green) to the appropriate Doctor or Midwife.</p>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Professional Connection</h3>
            <p className="text-gray-600">Specialized workflows ensure critical cases (Red) are prioritized for emergency action by specialist doctors.</p>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Remove Language Barriers</h3>
            <p className="text-gray-600">Integrated translation capabilities for the Tày ethnic language, replacing complex clinical terminology with plain everyday language.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
