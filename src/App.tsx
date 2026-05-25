import React, { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  User as FirebaseUser 
} from "firebase/auth";
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, db, googleProvider, handleFirestoreError, OperationType } from "./firebase";
import { ChatSession, Message, UserProfile } from "./types";

// Import modular subcomponents
import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import SettingsModal from "./components/SettingsModal";
import AuthModal from "./components/AuthModal";

// Local storage keys in case of offline sandbox or guest profiles
const LOCAL_CHATS_KEY = "omniai_guest_chats";
const LOCAL_MESSAGES_PREFIX = "omniai_guest_msg_";

export default function App() {
  // Navigation: Landing vs Workspace Dashboard
  const [showLanding, setShowLanding] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string | null; displayName: string | null } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // User Settings Profile
  const [isPremium, setIsPremium] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [language, setLanguage] = useState("id");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Chats & Conversation History State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Admin Operational Stats Telemetry
  const [telemetryStats, setTelemetryStats] = useState({
    messagesCount: 12,
    sessionsCount: 0,
    simulatedLatency: 180
  });

  // Listen to Firebase Auth state on load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthReady(true);
      if (user) {
        // Authenticated user
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0] || "Authorized User"
        };
        setCurrentUser(userData);

        // Sync and look up user configuration doc inside Firestore
        await syncUserProfile(user.uid, user.email || "", user.displayName || "");
      } else {
        // Offline / Unauthenticated fallback
        setCurrentUser(null);
        clearToGuestState();
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch chats on user shift (Either Firestore sync or localStorage guest partitioned by email)
  useEffect(() => {
    if (currentUser) {
      if (currentUser.uid.startsWith("guest_")) {
        loadGuestSessions(currentUser.email || "guest");
      } else {
        fetchFirestoreSessions(currentUser.uid);
      }
    } else {
      setSessions([]);
    }
  }, [currentUser]);

  // Fetch messages whenever a specific session is opened
  useEffect(() => {
    if (activeSessionId && currentUser) {
      if (currentUser.uid.startsWith("guest_")) {
        loadGuestMessages(currentUser.email || "guest", activeSessionId);
      } else {
        fetchFirestoreMessages(activeSessionId);
      }
    } else {
      setMessages([]);
    }
  }, [activeSessionId, currentUser]);

  // Local Guest state initialization helper
  const clearToGuestState = () => {
    setIsPremium(false);
    setCustomApiKey("");
    setLanguage("id");
  };

  /**
   * Safe registration / syncing of user profiles within Firestore 'users' path
   */
  const syncUserProfile = async (uid: string, email: string, displayName: string) => {
    const userPath = `users/${uid}`;
    try {
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setIsPremium(data.isPremium || false);
        setCustomApiKey(data.customApiKey || "");
        setLanguage(data.language || "id");
      } else {
        // Create initial default user doc
        const newProfile: UserProfile = {
          uid,
          email,
          displayName,
          isPremium: false, // Start with false trial, can toggle anytime
          role: "user",
          customApiKey: "",
          language: "id"
        };
        await setDoc(docRef, newProfile);
        setIsPremium(false);
      }
    } catch (err) {
      // Gracefully handle or log Firestore access issues
      console.warn("Could not load Firestore users doc. Running in client-cache fallback.", err);
    }
  };

  /**
   * Firestore: Fetch sessions lists
   */
  const fetchFirestoreSessions = async (uid: string) => {
    try {
      const q = query(collection(db, "chats"), where("userId", "==", uid));
      const snap = await getDocs(q);
      const list: ChatSession[] = [];
      
      snap.forEach((d) => {
        list.push(d.data() as ChatSession);
      });

      // Sort by updatedAt descending manually to avoid compound index requirements on user project
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setSessions(list);
      setTelemetryStats(prev => ({
        ...prev,
        sessionsCount: list.length
      }));

      // Auto-focus on most recent session if available and none selected yet
      if (list.length > 0 && !activeSessionId) {
        setActiveSessionId(list[0].id);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "chats");
    }
  };

  /**
   * Firestore: Fetch messages logs in selected chat session
   */
  const fetchFirestoreMessages = async (chatId: string) => {
    const path = `chats/${chatId}/messages`;
    try {
      const q = collection(db, "chats", chatId, "messages");
      const snap = await getDocs(q);
      const list: Message[] = [];
      
      snap.forEach((d) => {
        list.push(d.data() as Message);
      });

      // Order chronologically
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      setMessages(list);
      setTelemetryStats(prev => ({
        ...prev,
        messagesCount: prev.messagesCount + list.length
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  };

  /**
   * Guest Persistence helpers (offline simulator) partitioned by email
   */
  const loadGuestSessions = (email: string) => {
    const key = "omniai_chats_" + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatSession[];
        setSessions(parsed);
        if (parsed.length > 0 && !activeSessionId) {
          setActiveSessionId(parsed[0].id);
        }
      } catch (e) {
        setSessions([]);
      }
    } else {
      setSessions([]);
    }
  };

  const loadGuestMessages = (email: string, chatId: string) => {
    const key = "omniai_msg_" + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_") + "_" + chatId;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  };

  /**
   * OAuth Actions: Trigger Google Signup Popups
   */
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setIsAuthOpen(false);
      setShowLanding(false); // jump in!
    } catch (err: any) {
      console.error("Sign-In failed: ", err);
      
      // Check specifically for popup closed or blocked errors
      if (err.code === "auth/popup-closed-by-user" || err.message?.includes("popup") || err.message?.includes("closed")) {
        alert(
          "Koneksi Google Auth Gagal / Dibatalkan.\n\n" +
          "Penyebab:\n" +
          "Browser memblokir jendela popup Google Auth Anda. Ini adalah pembatasan keamanan standar ketika aplikasi dijalankan di dalam bingkai interaktif (iframe) preview AI Studio.\n\n" +
          "Solusi:\n" +
          "1. DIREKOMENDASIKAN: Gunakan tombol 'Gunakan Sesi Tamu Premium (Instan)' di panel masuk untuk akses ZERO PRO langsung tanpa login!\n" +
          "2. ATAU: Jika Anda ingin menggunakan login Google riil, buka aplikasi ini di Tab Baru (klik tombol ikon kargo/eksternal berlogo panah miring ke atas di pojok kanan atas layar AI Studio Anda) lalu masuk kembali."
        );
      } else {
        alert("Proses masuk gagal. Browser memblokir popup atau cookie dinonaktifkan di sandbox Anda.\nError: " + err.message);
      }
    }
  };

  /**
   * Guest Demo trigger Option with stable, deterministic email-based identity
   */
  const handleGuestDemoSignIn = async (email: string, displayName: string) => {
    const cleanEmail = email.trim().toLowerCase() || "zeropremium-demo@zeroai.co";
    const deterministicId = "guest_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
    
    const mockUser = {
      uid: deterministicId,
      email: cleanEmail,
      displayName: displayName.trim() || cleanEmail.split("@")[0] || "VIP Guest"
    };
    setCurrentUser(mockUser);
    setIsPremium(true); // Treat guest demo as Premium immediately for perfect experience!
    setIsAuthOpen(false);
    setShowLanding(false); // jump in!
    
    // Sync profile values
    await syncUserProfile(mockUser.uid, mockUser.email, mockUser.displayName);
  };

  /**
   * Account Logouts
   */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      clearToGuestState();
      setShowLanding(true); // return home
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Actions: Create New Sesi obrolan
   */
  const handleNewSession = async (model: "gpt" | "gemini" | "claude" | "dola" = "gemini", assistant: "general" | "coding" | "study" = "general") => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const newId = "chat_" + Date.now();
    const userId = currentUser.uid;
    
    const newChat: ChatSession = {
      id: newId,
      title: "Obrolan Baru",
      userId,
      modelType: model,
      assistantType: assistant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Welcome initial prompts based on Assistant Persona chosen
    let introMsgText = "Halo! Saya adalah ZERO, asisten AI Anda. Ada yang bisa saya bantu hari ini?";
    if (assistant === "coding") {
      introMsgText = "Halo! Mode Asisten Koding diaktifkan. Silakan berikan kode Anda atau tanyakan arsitektur pemrograman yang ingin Anda optimalkan.";
    } else if (assistant === "study") {
      introMsgText = "Halo! Saya adalah Tutor Belajar Anda. Materi atau pekerjaan rumah apa yang ingin kita pelajari bersama hari ini?";
    }

    const welcomeMessage: Message = {
      id: "msg_welcome_" + Date.now(),
      chatId: newId,
      userId: "system",
      role: "model",
      content: introMsgText,
      createdAt: new Date().toISOString()
    };

    if (!userId.startsWith("guest_")) {
      // Save Session and initial Message Doc to Firestore
      try {
        await setDoc(doc(db, "chats", newId), newChat);
        await setDoc(doc(db, "chats", newId, "messages", welcomeMessage.id), welcomeMessage);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, "chats/" + newId);
      }
    } else {
      // Offline/Local mock save segmented by email
      const email = currentUser.email || "guest";
      const keyChats = "omniai_chats_" + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      const keyMsg = "omniai_msg_" + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_") + "_" + newId;

      const updatedSessions = [newChat, ...sessions];
      localStorage.setItem(keyChats, JSON.stringify(updatedSessions));
      localStorage.setItem(keyMsg, JSON.stringify([welcomeMessage]));
    }

    setSessions(prev => [newChat, ...prev]);
    setActiveSessionId(newId);
  };

  /**
   * Sesi Obrolan Deletions
   */
  const handleDeleteSession = async (chatId: string) => {
    if (!currentUser) return;
    const isConfirm = window.confirm("Apakah Anda yakin ingin menghapus riwayat obrolan ini?");
    if (!isConfirm) return;

    if (!currentUser.uid.startsWith("guest_")) {
      try {
        await deleteDoc(doc(db, "chats", chatId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, "chats/" + chatId);
      }
    } else {
      const email = currentUser.email || "guest";
      const keyChats = "omniai_chats_" + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
      const keyMsg = "omniai_msg_" + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_") + "_" + chatId;

      const updated = sessions.filter(s => s.id !== chatId);
      localStorage.setItem(keyChats, JSON.stringify(updated));
      localStorage.removeItem(keyMsg);
    }

    setSessions(prev => prev.filter(s => s.id !== chatId));
    if (activeSessionId === chatId) {
      setActiveSessionId(null);
    }
  };

  /**
   * Action: Message dispatch & backend api call trigger with memory preservation
   */
  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    let currentSessionId = activeSessionId;
    
    // Auto-create a session if none selected or open on send
    if (!currentSessionId) {
      const newId = "chat_" + Date.now();
      const userId = currentUser.uid;
      const autoChat: ChatSession = {
        id: newId,
        title: content.slice(0, 30) || "Pencarian Baru",
        userId,
        modelType: "gemini",
        assistantType: "general",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!userId.startsWith("guest_")) {
        try {
          await setDoc(doc(db, "chats", newId), autoChat);
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, "chats/" + newId);
        }
      } else {
        const email = currentUser.email || "guest";
        const keyChats = "omniai_chats_" + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
        const updated = [autoChat, ...sessions];
        localStorage.setItem(keyChats, JSON.stringify(updated));
      }

      setSessions(prev => [autoChat, ...prev]);
      setActiveSessionId(newId);
      currentSessionId = newId;
    }

    const userMsgId = "msg_user_" + Date.now();
    const newUserMessage: Message = {
      id: userMsgId,
      chatId: currentSessionId,
      userId: currentUser.uid,
      role: "user",
      content,
      imageUrl,
      createdAt: new Date().toISOString()
    };

    // Save user message to active view first
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    if (!currentUser.uid.startsWith("guest_")) {
      try {
        await setDoc(doc(db, "chats", currentSessionId, "messages", userMsgId), newUserMessage);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `chats/${currentSessionId}/messages/${userMsgId}`);
      }
    } else {
      const email = currentUser.email || "guest";
      const keyMsg = "omniai_msg_" + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_") + "_" + currentSessionId;
      localStorage.setItem(keyMsg, JSON.stringify(updatedMessages));
    }

    setIsLoading(true);
    const startLoadTime = Date.now();

    try {
      // Map entire history for model processing to preserve conversational remembrance context
      const chatPayload = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
        imageUrl: m.imageUrl
      }));

      const activeSessionObj = sessions.find(s => s.id === currentSessionId);
      const activeModelType = activeSessionObj?.modelType || "gemini";
      const activeAssistantType = activeSessionObj?.assistantType || "general";

      // POST Request securely to backend Express server proxying Google GenAI
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatPayload,
          modelType: activeModelType,
          assistantType: activeAssistantType,
          thinkMode,
          customApiKey: customApiKey || undefined
        })
      });

      const resData = await res.json();
      
      if (res.status !== 200) {
        throw new Error(resData.error || resData.details || "API server-side routing error.");
      }

      const modelMsgId = "msg_model_" + Date.now();
      const newModelMessage: Message = {
        id: modelMsgId,
        chatId: currentSessionId,
        userId: "system_bot",
        role: "model",
        content: resData.content,
        createdAt: new Date().toISOString()
      };

      // Set final messages inside view
      const finalMsgList = [...updatedMessages, newModelMessage];
      setMessages(finalMsgList);

      if (currentUser && !currentUser.uid.startsWith("guest_")) {
        try {
          await setDoc(doc(db, "chats", currentSessionId, "messages", modelMsgId), newModelMessage);
          
          // Auto summarize chat title on first conversion
          if (activeSessionObj?.title === "Obrolan Baru") {
            const shortTitle = content.split(" ").slice(0, 4).join(" ") || "Obrolan";
            await updateDoc(doc(db, "chats", currentSessionId), {
              title: shortTitle,
              updatedAt: new Date().toISOString()
            });

            setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title: shortTitle } : s));
          } else {
            await updateDoc(doc(db, "chats", currentSessionId), {
              updatedAt: new Date().toISOString()
            });
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `chats/${currentSessionId}`);
        }
      } else if (currentUser) {
        // Guest mode session update partitioned by email
        const email = currentUser.email || "guest";
        const keyChats = "omniai_chats_" + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
        const keyMsg = "omniai_msg_" + email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_") + "_" + currentSessionId;

        localStorage.setItem(keyMsg, JSON.stringify(finalMsgList));
        if (activeSessionObj?.title === "Obrolan Baru") {
          const shortTitle = content.split(" ").slice(0, 4).join(" ") || "Obrolan";
          const updatedSessions = sessions.map(s => s.id === currentSessionId ? { ...s, title: shortTitle, updatedAt: new Date().toISOString() } : s);
          setSessions(updatedSessions);
          localStorage.setItem(keyChats, JSON.stringify(updatedSessions));
        }
      }

      // Record telemetry response latency
      const loadSpan = Date.now() - startLoadTime;
      setTelemetryStats(prev => ({
        ...prev,
        simulatedLatency: loadSpan,
        messagesCount: prev.messagesCount + 2
      }));

    } catch (apiErr: any) {
      console.error(apiErr);
      
      const errorMsgId = "msg_error_" + Date.now();
      const errorMsg: Message = {
        id: errorMsgId,
        chatId: currentSessionId,
        userId: "system_bot",
        role: "model",
        content: `MOHON MAAF, KONEKSI SERVER TERHAMBAT.\nDeskripsi Kesalahan: ${apiErr.message || "Mohon periksa sambungan internet atau luruskan Secrets API Key Anda di panel Settings."}`,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Regenerate responses
   */
  const handleRegenerateResponse = async () => {
    if (messages.length < 2) return;
    
    // Find last user message, slice the rest, and trigger send
    const userMsgs = messages.filter(m => m.role === "user");
    if (userMsgs.length === 0) return;

    const lastUserMsgUrl = userMsgs[userMsgs.length - 1].imageUrl;
    const lastUserText = userMsgs[userMsgs.length - 1].content;

    // Filter messages up to last user message
    const lastUserIndex = messages.findLastIndex(m => m.role === "user");
    const sliced = messages.slice(0, lastUserIndex);
    setMessages(sliced);

    await handleSendMessage(lastUserText, lastUserMsgUrl);
  };

  /**
   * Save API config state directly to Firestore or Guest
   */
  const handleSaveApiKey = async (apiKey: string) => {
    setCustomApiKey(apiKey);
    if (currentUser) {
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          customApiKey: apiKey
        });
      } catch (err) {
        console.warn("Offline caching settings update.", err);
      }
    }
  };

  /**
   * Save localized language selector
   */
  const handleSaveLanguage = async (lang: string) => {
    setLanguage(lang);
    if (currentUser) {
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          language: lang
        });
      } catch (err) {
        console.warn("Offline caching language settings.", err);
      }
    }
  };

  /**
   * Upgrade Membership (Simulated)
   */
  const handleTogglePremium = async () => {
    const nextPremium = !isPremium;
    setIsPremium(nextPremium);
    
    if (currentUser) {
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          isPremium: nextPremium
        });
        alert(nextPremium ? "Selamat! Berhasil mendaftar ke ZERO PREMIUM. Semua fitur tingkat lanjut (Detailed & Planner) kini terbuka penuh." : "Keanggotaan Anda diturunkan kembali ke Trial Gratis.");
      } catch (err) {
        alert("Gagal melakukan upgrade. Menggunakan fallback offline.");
      }
    } else {
      alert(nextPremium ? "Selamat! Berhasil mendaftar ke ZERO PREMIUM. Semua fitur tingkat lanjut (Detailed & Planner) kini terbuka penuh." : "Keanggotaan Anda diturunkan kembali ke Trial Gratis.");
    }
  };

  // Sync session configuration changes
  const handleSessionModelTypeChange = async (model: "gpt" | "gemini" | "claude" | "dola") => {
    if (!activeSessionId) return;
    
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, modelType: model } : s));
    if (currentUser) {
      try {
        await updateDoc(doc(db, "chats", activeSessionId), {
          modelType: model
        });
      } catch (e) {
        console.warn("Caches session config", e);
      }
    }
  };

  const handleSessionAssistantTypeChange = async (assistant: "general" | "coding" | "study") => {
    if (!activeSessionId) return;

    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, assistantType: assistant } : s));
    if (currentUser) {
      try {
        await updateDoc(doc(db, "chats", activeSessionId), {
          assistantType: assistant
        });
      } catch (e) {
        console.warn("Caches session config", e);
      }
    }
  };

  // Think Mode Toggle State
  const [thinkMode, setThinkMode] = useState(false);
  const handleThinkModeToggle = () => {
    setThinkMode(!thinkMode);
  };

  const activeSessionObj = sessions.find(s => s.id === activeSessionId);

  return (
    <div id="app_frame" className="min-h-screen bg-[#050508] text-slate-100 flex overflow-hidden">
      
      {showLanding ? (
        /* Landing Page view - Enforces sign in to enter workspace and ask/chat */
        <LandingPage 
          onStartChat={() => {
            if (currentUser) {
              setShowLanding(false);
            } else {
              setIsAuthOpen(true);
            }
          }}
          onShowAuth={() => setIsAuthOpen(true)}
          isAuthenticated={!!currentUser}
          userEmail={currentUser?.email}
        />
      ) : (
        /* Dashboard view */
        <div className="flex w-full h-screen overflow-hidden">
          
          <Sidebar 
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onTogglePremium={handleTogglePremium}
            isPremium={isPremium}
            currentUser={currentUser}
            onLogout={handleLogout}
            onLogin={() => setIsAuthOpen(true)}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <ChatArea 
            messages={messages}
            activeSessionId={activeSessionId}
            modelType={activeSessionObj?.modelType || "gemini"}
            assistantType={activeSessionObj?.assistantType || "general"}
            thinkMode={thinkMode}
            onModelTypeChange={handleSessionModelTypeChange}
            onAssistantTypeChange={handleSessionAssistantTypeChange}
            onThinkModeToggle={handleThinkModeToggle}
            onSendMessage={handleSendMessage}
            onRegenerateResponse={handleRegenerateResponse}
            isLoading={isLoading}
            isPremium={isPremium}
            onShowAuth={() => setIsAuthOpen(true)}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

        </div>
      )}

      {/* Dynamic Popups Gateways */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        customApiKey={customApiKey}
        onSaveApiKey={handleSaveApiKey}
        language={language}
        onSaveLanguage={handleSaveLanguage}
        stats={telemetryStats}
      />

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onGoogleSignIn={handleGoogleSignIn}
        onGuestDemoSignIn={handleGuestDemoSignIn}
      />

    </div>
  );
}
