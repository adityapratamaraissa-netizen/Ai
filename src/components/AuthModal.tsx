import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  User, 
  ShieldAlert, 
  Award,
  CheckCircle,
  HelpCircle
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  onGuestDemoSignIn: (email: string, displayName: string) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onGoogleSignIn,
  onGuestDemoSignIn
}: AuthModalProps) {
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [useCustomGuest, setUseCustomGuest] = useState(false);

  if (!isOpen) return null;

  const handleLaunchGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = customName.trim() || "VVIP Tester";
    const finalEmail = customEmail.trim().toLowerCase() || "zeropremium-demo@zeroai.co";
    
    // Trigger guest sign in failover
    onGuestDemoSignIn(finalEmail, finalName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      
      {/* Frame Box */}
      <div className="w-full max-w-sm bg-[#08090c] border border-slate-800/80 rounded-2xl overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.8)] relative">
        
        {/* Glowing Decorative border top */}
        <div className="h-1 bg-gradient-to-r from-[#00f2fe] via-[#9d4edd] to-indigo-650" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center space-y-6">
          
          {/* Logo Heading */}
          <div className="space-y-2 mt-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00f2fe] to-[#9d4edd] mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.3)]">
              <Sparkles className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Gerbang Masuk ZERO AI</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
              Masuk memakai akun Google untuk sinkronisasi cloud atau akses simulasi tamu langsung.
            </p>
          </div>

          <div className="space-y-3.5">
            
            {/* Primary OAuth Method - Google Auth */}
            <button
              onClick={onGoogleSignIn}
              className="w-full py-3 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(102,16,242,0.15)] hover:shadow-[0_0_15px_rgba(102,16,242,0.3)] hover:scale-[1.01] transition-all"
            >
              <User className="w-4 h-4" /> Masuk via Akun Google
            </button>

            {/* Simulated premium client guest failover Option */}
            {useCustomGuest ? (
              <form onSubmit={handleLaunchGuest} className="p-4 rounded-xl border border-slate-850 bg-slate-950/40 text-left space-y-3">
                <p className="text-[10px] text-[#4cc9f0] font-mono leading-tight flex items-center gap-1.5 font-bold uppercase">
                  <Award className="w-3.5 h-3.5 text-[#00f2fe]" /> Konfigurasi Profil Tamu VIP
                </p>
                <div>
                  <input 
                    type="text" 
                    placeholder="Masukkan nama Anda (cth: Aditya)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00f2fe]"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Masukkan email (cth: adit@zeroai.co)"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00f2fe]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                >
                  Masuk Sesi Tamu
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setUseCustomGuest(true)}
                className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Gunakan Sesi Tamu Premium (Instan)
              </button>
            )}

          </div>

          {/* Secure compliance note */}
          <div className="pt-2 border-t border-slate-850/60 flex items-center gap-2 justify-center text-[10px] text-slate-510 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-[#00f2fe]" />
            <span>Koneksi aman SSL terpasang otomatis</span>
          </div>

        </div>

      </div>

    </div>
  );
}
