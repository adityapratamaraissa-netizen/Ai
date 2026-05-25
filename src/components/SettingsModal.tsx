import React, { useState } from "react";
import { 
  X, 
  Settings, 
  Key, 
  Globe, 
  ShieldCheck, 
  Activity, 
  Database, 
  Cpu, 
  Gauge, 
  Sparkles,
  Award
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customApiKey: string;
  onSaveApiKey: (key: string) => void;
  language: string;
  onSaveLanguage: (lang: string) => void;
  stats: {
    messagesCount: number;
    sessionsCount: number;
    simulatedLatency: number;
  };
}

export default function SettingsModal({
  isOpen,
  onClose,
  customApiKey,
  onSaveApiKey,
  language,
  onSaveLanguage,
  stats
}: SettingsModalProps) {
  const [keyInput, setKeyInput] = useState(customApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isSavedDone, setIsSavedDone] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(keyInput);
    setIsSavedDone(true);
    setTimeout(() => setIsSavedDone(false), 2000);
  };

  const IndonesianLanguages = [
    { code: "id", name: "Bahasa Indonesia Standard" },
    { code: "en", name: "English (US / UK)" },
    { code: "jp", name: "日本語 (Japanese Formal)" },
    { code: "jv", name: "Boso Jowo (Javanese Casual)" },
    { code: "su", name: "Basa Sunda (Sundanese Friendly)" }
  ];

  return (
    <div id="settings_portal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      
      {/* Settings Grid Frame container */}
      <div className="w-full max-w-2xl bg-[#08090d] border border-slate-800/80 rounded-2xl overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.8)]">
        
        {/* Modal Top bar */}
        <div className="px-6 py-4 border-b border-slate-850 bg-[#0c0d12] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#00f2fe]" />
            <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-200">Sistem & Pengaturan Admin</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-red-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Main sections grid: left settings options, right stats telemetry dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left settings forms */}
            <div className="space-y-5 text-left">
              
              {/* API Key configuration info panel */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-pink-400" /> Pengaturan API Key Pribadi
                </label>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Secara default, ZERO AI menggunakan cloud premium developer kami. Bila Anda ingin melampirkan limit pemakaian API Key ZERO AI pribadi Anda sendiri, letakkan di sini.
                </p>
                
                <div className="relative">
                  <input 
                    type={showKey ? "text" : "password"}
                    placeholder="AIzaSy..."
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="w-full py-2 pl-3 pr-16 bg-slate-950 border border-slate-850 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-pink-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-2 px-1.5 py-0.5 rounded bg-slate-900 text-[9px] text-slate-400 font-mono hover:text-white"
                  >
                    {showKey ? "HIDE" : "SHOW"}
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-xs font-bold text-white cursor-pointer hover:shadow-[0_0_12px_rgba(102,16,242,0.3)]"
                >
                  {isSavedDone ? "Berhasil Disimpan!" : "Terapkan API Key"}
                </button>
              </div>

              {/* Language Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#00f2fe]" /> Lokalisasi Multi Bahasa
                </label>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Pilih gaya penulisan bahasa Indonesia atau transkripsi aksen slang daerah yang ingin ditekankan oleh model AI.
                </p>

                <select
                  value={language}
                  onChange={(e) => onSaveLanguage(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#00f2fe]"
                >
                  {IndonesianLanguages.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Right Telemetry admin panel */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-4">
                  <Activity className="w-4 h-4 text-[#00f2fe] animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-[#00f2fe] uppercase tracking-wider">Telemetri Admin Real-time</span>
                </div>

                <div className="space-y-4">
                  
                  {/* System Core Load */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-slate-550" />
                      <span className="text-[10px] font-mono text-slate-400">Status Server Core</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#00f2fe] font-black">ACTIVE / HEALTY</span>
                  </div>

                  {/* Message write counters */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-slate-550" />
                      <span className="text-[10px] font-mono text-slate-400">Total Transaksi Chat</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-200">{stats.messagesCount} pesan</span>
                  </div>

                  {/* Active chats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-550" />
                      <span className="text-[10px] font-mono text-slate-400">Riwayat Sesi Firestore</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-200">{stats.sessionsCount} dokumen</span>
                  </div>

                  {/* Latency statistics */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-3.5 h-3.5 text-slate-550" />
                      <span className="text-[10px] font-mono text-slate-400">Kecepatan Latensi Simp.</span>
                    </div>
                    <span className="text-[10px] font-mono text-pink-400 font-bold">{stats.simulatedLatency} ms</span>
                  </div>

                </div>
              </div>

              {/* Micro diagnostic tag */}
              <div className="mt-6 pt-3 border-t border-slate-900 text-[10px] font-mono text-slate-650 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#9d4edd]" />
                <span>Premium Gateway 256-bit SSL</span>
              </div>

            </div>

          </div>

          {/* Bottom section close button info */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-850">
            <span className="text-[9px] text-slate-505 font-mono">ZERO AI Dashboard v2.0.26 Jakarta, ID</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-all text-xs font-bold cursor-pointer"
            >
              Selesai & Keluar
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
