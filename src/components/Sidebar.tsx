import React from "react";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Settings, 
  Crown, 
  LogOut, 
  LogIn, 
  X, 
  Cpu, 
  User,
  Sparkles,
  Zap
} from "lucide-react";
import { ChatSession } from "../types";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: (model?: "gpt" | "gemini" | "claude" | "dola", assistant?: "general" | "coding" | "study") => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
  onTogglePremium: () => void;
  isPremium: boolean;
  currentUser: { uid: string; email: string | null; displayName: string | null } | null;
  onLogout: () => void;
  onLogin: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onOpenSettings,
  onTogglePremium,
  isPremium,
  currentUser,
  onLogout,
  onLogin,
  isOpen = false,
  onClose
}: SidebarProps) {

  const handleCreateChat = () => {
    onNewSession("gemini", "general");
    if (onClose) onClose();
  };

  const handleSelectSession = (id: string) => {
    onSelectSession(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          id="sidebar_overlay"
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Main Sidebar Wrapper */}
      <aside
        id="app_sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#05060a]/95 lg:bg-[#05060b] border-r border-[#1e293b]/50 flex flex-col h-full transform transition-transform duration-300 ease-out-expo
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        
        {/* Sidebar Header Brand */}
        <div className="p-5 border-b border-[#1e293b]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00f2fe] to-[#9d4edd] flex items-center justify-center shadow-[0_0_15px_rgba(157,78,221,0.3)]">
              <Cpu className="w-4.5 h-4.5 text-black" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-white">ZERO AI</h1>
              <span className="text-[9px] font-mono text-[#00f2fe] tracking-widest uppercase">Super Hub v2.0</span>
            </div>
          </div>

          {/* Mobile Close Button */}
          {onClose && (
            <button 
              id="close_sidebar_btn"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-450 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Premium Banner Badge */}
        <div className="px-4 pt-4">
          <div className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
            isPremium 
              ? "bg-gradient-to-br from-violet-950/20 to-slate-950/50 border-violet-800/40 shadow-[0_0_12px_rgba(157,78,221,0.06)]"
              : "bg-slate-950/40 border-slate-900/80"
          }`}>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isPremium ? "bg-[#9d4edd]/25 text-[#c77dff]" : "bg-slate-900 text-slate-400"}`}>
                <Crown className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">
                  {isPremium ? "ZERO PRO Activated" : "ZERO AI Basic Free"}
                </p>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                  {isPremium ? "Semua model premium aktif" : "Batas model harian aktif"}
                </p>
              </div>
            </div>

            <button
              id="sidebar_premium_toggle"
              onClick={onTogglePremium}
              className={`w-full py-1.5 rounded-lg text-[10px] sm:text-xs font-black tracking-wider cursor-pointer uppercase transition-all duration-300 ${
                isPremium
                  ? "bg-gradient-to-r from-red-650 to-rose-700 text-white hover:opacity-90"
                  : "bg-gradient-to-r from-[#00f2fe] to-[#9d4edd] text-black hover:shadow-[0_0_10px_rgba(0,242,254,0.3)] font-black"
              }`}
            >
              {isPremium ? "Downgrade Pro" : "Upgrade ke Premium"}
            </button>
          </div>
        </div>

        {/* Create Sesi Obrolan Trigger */}
        <div className="p-4">
          <button
            id="new_chat_btn"
            onClick={handleCreateChat}
            className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-850 hover:border-[#00f2fe]/45 hover:bg-slate-900/20 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-sm group"
          >
            <Plus className="w-4 h-4 text-[#00f2fe] group-hover:rotate-90 transition-transform duration-300" />
            <span>Mulai Obrolan Baru</span>
          </button>
        </div>

        {/* Saved Sessions Container */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 scrollbar-thin">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Riwayat Obrolan</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-900 text-slate-400">
              {sessions.length}
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="py-8 text-center text-slate-550 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-900/40 rounded-xl">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              <p className="text-[11px]">Belum ada riwayat obrolan</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                
                // Get badge colors based on session configuration
                let modelBadgeColor = "text-[#00f2fe] bg-[#00f2fe]/5 border-[#00f2fe]/10";
                if (session.modelType === "gemini") {
                  modelBadgeColor = "text-pink-400 bg-pink-400/5 border-pink-400/10";
                } else if (session.modelType === "claude") {
                  modelBadgeColor = "text-[#c77dff] bg-[#c77dff]/5 border-[#c77dff]/10";
                } else if (session.modelType === "dola") {
                  modelBadgeColor = "text-[#4cc9f0] bg-[#4cc9f0]/5 border-[#4cc9f0]/10";
                }

                return (
                  <div
                    key={session.id}
                    className={`group w-full flex items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 ${
                      isActive 
                        ? "bg-[#10131d] border-slate-800 text-white shadow-inner" 
                        : "bg-transparent border-transparent text-slate-400 hover:bg-slate-950 hover:text-slate-200"
                    }`}
                  >
                    <button
                      onClick={() => handleSelectSession(session.id)}
                      className="flex-1 text-left flex items-start gap-2.5 min-w-0 cursor-pointer"
                    >
                      <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? "text-[#00f2fe]" : "text-slate-500"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate leading-tight">
                          {session.title || "Obrolan"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${modelBadgeColor}`}>
                            {session.modelType === "gpt" && "Balanced"}
                            {session.modelType === "gemini" && "Creative"}
                            {session.modelType === "claude" && "Detailed"}
                            {session.modelType === "dola" && "Planner"}
                          </span>
                          <span className="text-[8px] font-mono text-slate-600">
                            {new Date(session.updatedAt || session.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short"
                            })}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Delete Session Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="p-1.5 rounded-md hover:bg-red-950/20 text-slate-600 hover:text-red-400 hover:border-red-950 border border-transparent transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      title="Hapus riwayat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lower Persistent Account & Action Controls */}
        <div className="p-4 border-t border-[#1e293b]/40 bg-[#030406]/60 space-y-2">
          
          {/* Settings Trigger inside footer */}
          <button
            id="sidebar_settings_btn"
            onClick={() => {
              onOpenSettings();
              if (onClose) onClose();
            }}
            className="w-full p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-950/40 hover:bg-slate-900/30 border border-slate-900/80 hover:border-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Pengaturan & Telemetri</span>
          </button>

          {/* User Signin / Logout Section */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-left">
            {currentUser ? (
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 text-xs font-black uppercase flex-shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">{currentUser.displayName || "Client User"}</p>
                    <p className="text-[9px] font-mono text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  id="sidebar_logout_btn"
                  onClick={onLogout}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:text-red-400 cursor-pointer transition-colors"
                  title="Keluar Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-slate-500 text-center leading-normal">
                  Gunakan mode cloud untuk menyimpan riwayat chat selamanya.
                </p>
                <button
                  id="sidebar_login_btn"
                  onClick={() => {
                    onLogin();
                    if (onClose) onClose();
                  }}
                  className="w-full py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sinkronisasi Cloud</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </aside>
    </>
  );
}
