import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Brain, 
  Terminal, 
  BookOpen, 
  Image as ImageIcon, 
  Mic, 
  Zap, 
  ArrowRight,
  Gauge, 
  Layers,
  CheckCircle,
  Clock
} from "lucide-react";

interface LandingPageProps {
  onStartChat: () => void;
  onShowAuth: () => void;
  isAuthenticated: boolean;
  userEmail?: string | null;
}

export default function LandingPage({ onStartChat, onShowAuth, isAuthenticated, userEmail }: LandingPageProps) {
  const features = [
    {
      icon: <Brain className="w-6 h-6 text-[#00f2fe]" />,
      title: "Reasoning 'Think Mode'",
      desc: "Menampilkan proses penalaran rincian (Chain of Thought), mengoreksi kesalahan asumsi, dan memeriksa kasus batas sebelum menulis jawaban.",
      tag: "Deep Reasoning"
    },
    {
      icon: <Terminal className="w-6 h-6 text-[#c77dff]" />,
      title: "Asisten Koding Ahli",
      desc: "Membantu Anda coding dalam puluhan bahasa, debugging bug rumit secara runtut, mementaskan optimasi Big-O, dan menceritakan alur logika.",
      tag: "Software Engineering"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-[#4cc9f0]" />,
      title: "Asisten Belajar Sekolah",
      desc: "Tutor pribadi yang ramah. Menerangkan matematika rumit selangkah demi selangkah, membuat analogi sains yang seru, dan membuat kuis singkat.",
      tag: "Edu Tutor"
    },
    {
      icon: <ImageIcon className="w-6 h-6 text-emerald-400" />,
      title: "Membaca & Analisis Gambar",
      desc: "Fitur kecerdasan multimodal. Unggah tangkapan layar, foto tabel, atau grafik, dan biarkan AI menjelaskan isinya dalam waktu singkat.",
      tag: "Multimodal"
    },
    {
      icon: <Mic className="w-6 h-6 text-[#ff007f]" />,
      title: "Input & Output Suara",
      desc: "Ketik pesan Anda hanya dengan berbicara memakai Voice Input, dan dengarkan jawaban AI dibacakan kembali dengan Text-to-Speech natural.",
      tag: "Audio Sync"
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Model Presets Gabungan",
      desc: "Sesuaikan taktik respons Anda. Ingin gaya struktural respons seimbang, ekspresi kreatif penuh warna, kedalaman analisis detail, atau kecepatan ringkas perencana tindakan.",
      tag: "4-in-1 AI Style"
    }
  ];

  return (
    <div id="landing_container" className="min-h-screen bg-[#030408] text-slate-100 flex flex-col relative overflow-hidden">
      
      {/* Absolute decorative neon backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#9d4edd]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-[#00f2fe]/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Decorative top landing banner */}
      <header className="border-b border-[#1f2937]/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between bg-[#030408]/80">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-[#00f2fe] to-[#9d4edd] p-2 rounded-xl shadow-[0_0_15px_rgba(0,242,254,0.3)]">
            <Layers className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#00f2fe] via-[#b5179e] to-[#9d4edd] bg-clip-text text-transparent">
              ZERO AI
            </h1>
            <p className="text-[9px] text-[#4cc9f0] tracking-widest font-mono uppercase">Unified Brain</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {userEmail}
              </span>
              <button 
                onClick={onStartChat}
                className="px-4 py-2 bg-gradient-to-r from-[#00f2fe] to-blue-500 rounded-xl text-black font-semibold text-xs cursor-pointer hover:shadow-[0_0_15px_rgba(0,242,254,0.4)] transition-all flex items-center gap-1.5"
              >
                Ke Ruang Obrolan <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onShowAuth}
              className="px-5 py-2 border border-[#00f2fe]/30 rounded-xl text-xs font-semibold hover:bg-[#00f2fe]/10 hover:border-[#00f2fe] transition-all cursor-pointer"
            >
              Masuk / Daftar
            </button>
          )}
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center justify-center relative z-10 text-center">
        
        {/* Futuristic Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-850 text-[11px] text-[#00f2fe] font-mono mb-8 shadow-[0_0_12px_rgba(0,242,254,0.1)]"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#00f2fe]" /> 
          <span>ASISTEN AI SUPER PINTAR GENERASI 2026</span>
        </motion.div>

        {/* Master Heading */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl"
        >
          Satu Asisten. <br/>
          <span className="bg-gradient-to-r from-[#00f2fe] via-[#c77dff] to-[#ff007f] bg-clip-text text-transparent">
            Empat Kekuatan Otak Sempurna.
          </span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-base sm:text-lg text-slate-400 max-w-2xl mb-12 leading-relaxed"
        >
          Merasakan respon gabungan kekuatan cerdas dari <span className="text-[#00f2fe] font-medium">ZERO Balanced</span> (presisi), <span className="text-pink-400 font-medium">ZERO Creative</span> (ekspresif), <span className="text-[#9d4edd] font-medium">ZERO Detailed</span> (detail), dan <span className="text-[#4cc9f0] font-medium">ZERO Planner</span> (taktis) dalam satu dashboard glassmorphism nan mewah.
        </motion.p>

        {/* Hero Interactive CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-20 w-full justify-center px-4"
        >
          <button 
            id="start_now_button"
            onClick={onStartChat}
            className="px-8 py-4 bg-gradient-to-r from-[#00f2fe] via-violet-600 to-[#9d4edd] text-white font-bold rounded-2xl cursor-pointer hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] transition-all text-sm group flex items-center justify-center gap-2 scale-100 active:scale-95"
          >
            Mulai Percakapan Instan 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {!isAuthenticated && (
            <button 
              onClick={onShowAuth}
              className="px-8 py-4 bg-slate-950/80 border border-slate-800 rounded-2xl hover:border-slate-700 hover:bg-slate-900 text-slate-300 font-semibold transition-all text-sm cursor-pointer"
            >
              Buat Akun Premium
            </button>
          )}
        </motion.div>

        {/* Model quick visual selector showoff */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full max-w-4xl p-1 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-950/80 border border-slate-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden mb-24"
        >
          <div className="bg-slate-950/90 rounded-2xl px-6 py-4 flex items-center justify-between border-b border-slate-900/80 text-left">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-500">nexus-ai-orchestration-dashboard_v2.0.26_local</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[10px] text-[#00f2fe] font-mono">CONNECTED</span>
            </div>
          </div>
          
          <div className="p-6 text-left grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30">
              <h4 className="text-sm font-semibold text-[#00f2fe] flex items-center gap-1">ZERO Balanced</h4>
              <p className="text-xs text-slate-500 mt-2">Fokus pada akurasi logika, tabel data rapi, penyelesaian rumit.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30">
              <h4 className="text-sm font-semibold text-pink-400 flex items-center gap-1">ZERO Creative</h4>
              <p className="text-xs text-slate-500 mt-2">Asisten inovatif, ramah, interaktif penuh emoji, unggah file kilat.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30">
              <h4 className="text-sm font-semibold text-[#9d4edd] flex items-center gap-1">ZERO Detailed</h4>
              <p className="text-xs text-slate-500 mt-2">Daya ulas literasi tinggi, detail tak bercela, empatik dan beretika.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30">
              <h4 className="text-sm font-semibold text-[#4cc9f0] flex items-center gap-1">ZERO Planner</h4>
              <p className="text-xs text-slate-500 mt-2">To-do planner, peta tindakan cepat, tangkas, jadwalkan to-do list.</p>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <section className="w-full text-left mb-24">
          <div className="text-center mb-16">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Fitur Pintar Premium Tanpa Batas</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Kami mengemas fungsionalitas premium termodern tahun 2026 ke dalam genggaman Anda.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div 
                key={i}
                className="p-6 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800/70 hover:border-slate-700 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-brand-purple/5 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {f.icon}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#00f2fe]/80">{f.tag}</span>
                <h4 className="text-lg font-bold text-slate-200 mt-1 mb-2">{f.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Membership simulated pricing dashboard */}
        <section className="w-full text-center mb-20">
          <div className="mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Pilih Paket Membership Anda</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Tingkatkan efisiensi berkreasi Anda dengan paket prioritas.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            
            {/* Free Tier card */}
            <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-850 text-left flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#00f2fe] uppercase tracking-wider">PAKET STANDAR</span>
                <h4 className="text-2xl font-black text-white mt-1">Free Trial</h4>
                <p className="text-xs text-slate-400 mt-2 mb-6">Mencoba kehebatan asisten AI terpadu secara langsung.</p>
                <div className="text-3xl font-extrabold text-white mb-6">Rp 0 <span className="text-xs font-normal text-slate-500">/ selamanya</span></div>
                
                <ul className="space-y-3.5 mb-8">
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Akses seluruh asisten (Umum, Koding, Belajar)</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Gaya Bernavigasi Pintar (Balanced & Creative)</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-400 line-through">
                    <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <span>Prioritas respon lebih cepat premium</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-400 line-through">
                    <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <span>Analisis Multimodal unggah gambar</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={onStartChat}
                className="w-full py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl font-bold text-xs text-slate-300 cursor-pointer hover:bg-slate-850"
              >
                Mulai Gratis Sekarang
              </button>
            </div>

            {/* Premium Tier card */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-[#181a28] to-[#0d0e1b] border-2 border-[#9d4edd] text-left flex flex-col justify-between relative shadow-[0_0_30px_rgba(157,78,221,0.2)]">
              <div className="absolute top-4 right-4 px-2 py-0.5 rounded bg-[#9d4edd]/20 border border-[#9d4edd]/40 text-[9px] text-[#c77dff] font-mono">REKOMENDASI</div>
              <div>
                <span className="text-xs font-mono text-[#9d4edd] uppercase tracking-wider">PAKET PRIORITAS EKSTRIM</span>
                <h4 className="text-2xl font-black text-white mt-1">ZERO Premium</h4>
                <p className="text-xs text-slate-300 mt-2 mb-6">Membuka seluruh kekuatan AI super tanpa batas.</p>
                <div className="text-3xl font-extrabold text-white mb-6">Rp 149.000 <span className="text-xs font-normal text-slate-400">/ bulan</span></div>
                
                <ul className="space-y-3.5 mb-8">
                  <li className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle className="w-4 h-4 text-[#00f2fe] flex-shrink-0" />
                    <span>Prioritas Respon Kilat Premium</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle className="w-4 h-4 text-[#00f2fe] flex-shrink-0" />
                    <span>Akses Seluruh ZERO Multi-Style Presets (Detailed & Planner)</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle className="w-4 h-4 text-[#00f2fe] flex-shrink-0" />
                    <span>Ulasan 'Think Mode' Tanpa Hambatan</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle className="w-4 h-4 text-[#00f2fe] flex-shrink-0" />
                    <span>Uploader Gambar & Berkas Berkapasitas Besar</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={onStartChat}
                className="w-full py-3 bg-gradient-to-r from-[#00f2fe] to-[#9d4edd] hover:shadow-[0_0_20px_rgba(157,78,221,0.4)] text-black font-black rounded-xl text-xs cursor-pointer"
              >
                Langganan Premium Bersama Kami
              </button>
            </div>

          </div>
        </section>

      </main>

      <footer className="border-t border-[#1f2937]/30 py-8 bg-[#020205] text-center z-10">
        <p className="text-xs text-slate-500 font-mono">ZERO AI Unified Assistant Hub &bull; Powered by ZERO AI Core &bull; Jakarta 2026</p>
      </footer>

    </div>
  );
}
