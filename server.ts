import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON bodies with generous limits for base64 image streams
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper function to create a GoogleGenAI client with key fallback
function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required. Please check your Secrets settings.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// REST Endpoint: Check API connection status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// REST Endpoint: Super smart multi-model AI assistant conversation route
app.post("/api/chat", async (req, res) => {
  try {
    const { 
      messages, 
      modelType = "gemini", // gpt, gemini, claude, dola
      assistantType = "general", // general, coding, study
      thinkMode = false, 
      customApiKey = ""
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Initialize Gemini API client
    const ai = getGeminiClient(customApiKey);

    // Build the system instruction instructions based on modelType, assistantType, and thinkMode
    let promptStyleInstruction = "";
    if (modelType === "gpt") {
      promptStyleInstruction = "Gaya respon: OpenAI ChatGPT (sangat terstruktur, profesional, to-the-point, menggunakan heading yang jelas, bullet points yang rapi, dan bahasa Indonesia baku yang formal namun bersahabat). Berikan jawaban yang presisi dan seimbang.";
    } else if (modelType === "claude") {
      promptStyleInstruction = "Gaya respon: Anthropic Claude (sangat detail, komprehensif, akademis, analitis, bernuansa tinggi, empatik, menggunakan tata bahasa yang sangat indah, dan berhati-hati dalam membuat klaim). Berikan penjelasan menyeluruh dan logis.";
    } else if (modelType === "dola") {
      promptStyleInstruction = "Gaya respon: Dola AI Planner (sangat lincah, taktis, berorientasi pada perencanaan, action-oriented, mengutamakan daftar tugas (to-do list), jadwal, prioritas, dan sangat ringkas tanpa membuang kata. Membantu mengorganisir kegiatan).";
    } else {
      promptStyleInstruction = "Gaya respon: Google Gemini (interaktif, kreatif, kaya format, menggunakan emoji secara proporsional untuk meningkatkan kejelasan visual, senang bercurah pikir (brainstorming), dan sangat ramah).";
    }

    let assistantTypeInstruction = "";
    if (assistantType === "coding") {
      assistantTypeInstruction = "Role: Coding Assistant & Ahli Rekayasa Perangkat Lunak. Tugas Anda adalah membantu menulis kode berkualitas tinggi, menjelaskan logika pemrograman, debugging kesalahan, menjelaskan konsep algoritma dengan analogi, serta menganalisis efisiensi ruang dan waktu (Big O). Pastikan blok kode Anda menggunakan penanda bahasa (markdown syntax highlighting) dan berikan penjelasan langkah demi langkah yang detail.";
    } else if (assistantType === "study") {
      assistantTypeInstruction = "Role: Study Assistant & Guru/Tutor Akademis. Tugas Anda adalah membantu mempelajari konsep pelajaran sekolah, ujian, sains, matematika, sejarah, dll. Gunakan penjelasan bertahap yang mudah dipelajari oleh anak sekolah/mahasiswa. Buatkan analogi yang sederhana, berikan contoh konkret, pecahkan masalah matematika baris demi baris, dan jika diinginkan buatkan kuis kecil di akhir penjelasan untuk menguji pemahaman user.";
    } else {
      assistantTypeInstruction = "Role: Super AI Assistant Serbabisa. Anda mampu menjawab semua pertanyaan umum secara akurat, translate bahasa dengan natural, menulis esai, caption, cerita, merangkum konten panjang, dan berpikir kreatif.";
    }

    let thinkingInstruction = "";
    if (thinkMode) {
      thinkingInstruction = "INSTRUKSI KHUSUS THINK MODE: Sebelum memberikan jawaban akhir, Anda WAJIB melakukan deep reasoning (analisis berpikir mendalam) terlebih dahulu secara transparan. Tuliskan seluruh proses berpikir Anda di awal jawaban, dibungkus secara eksklusif di dalam tag <thinking>...</thinking>. Di dalam proses berpikir tersebut, Anda harus: menganalisis maksud pengguna secara mendalam, mengecek kasus batas, merencanakan struktur jawaban, mengoreksi diri jika ada kesalahan asumsi, dan menunjukkan pemecahan masalah logis. Setelah tag </thinking>, baru Anda menuliskan jawaban final yang bersih, rapi, dan sesuai instruksi formatting. Tulis proses thinking Anda dalam Bahasa Indonesia yang logis dan runtut.";
    }

    const unifiedSystemInstruction = `
Kamu adalah "OmniAI Unified Assistant", sebuah kecerdasan buatan super pintar yang mewakili gabungan kekuatan ChatGPT (struktur logis), Gemini (kreativitas interaktif), Claude (kedalaman analisis), dan Dola AI (kecepatan taktis & organisasi).
Bahasa utama Anda adalah Bahasa Indonesia (atau menyesuaikan dengan bahasa input pengguna). Jawablah secara natural, sangat pintar, cepat, dan modern.

${assistantTypeInstruction}
${promptStyleInstruction}
${thinkingInstruction}

Penting: Selalu berpijak pada fakta yang akurat, berikan kode yang bisa langsung disalin jika ada coding request, serta jadilah asisten yang penuh empati dan suportif.
`;

    // Process chat history into Gemini contents format
    // Filter last messages to avoid token bloat, ensuring we keep the context
    const maxContextLength = 15;
    const historyToProcess = messages.slice(-maxContextLength);

    const contents = historyToProcess.map((msg, index) => {
      const parts: any[] = [];

      // Check if message has an inline image attached
      if (msg.imageUrl && index === historyToProcess.length - 1) {
        // Only process inline image on the final message to save bandwidth & token cost
        const imageMatch = msg.imageUrl.match(/^data:([^;]+);base64,(.*)$/);
        if (imageMatch) {
          parts.push({
            inlineData: {
              mimeType: imageMatch[1],
              data: imageMatch[2]
            }
          });
        }
      }

      parts.push({ text: msg.content });

      return {
        role: msg.role === "user" ? "user" : "model",
        parts
      };
    });

    // Execute server-side Gemini request with high-reliability retry & fallback pattern
    let response;
    let modelUsed = "gemini-3.5-flash";
    const maxAttempts = 2;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash", // Primary high-speed engine
          contents,
          config: {
            systemInstruction: unifiedSystemInstruction,
            temperature: 0.7,
            topP: 0.95,
          }
        });
        break; // Successfully generated content!
      } catch (error: any) {
        console.warn(`[Gemini API] Primary model attempt ${attempt} failed:`, error.message || error);
        
        if (attempt === maxAttempts) {
          console.warn(`[Gemini API] Primary model heavily overloaded. Attempting fallback to gemini-3.1-flash-lite.`);
          try {
            response = await ai.models.generateContent({
              model: "gemini-3.1-flash-lite", // Reliable high-capacity fallback
              contents,
              config: {
                systemInstruction: unifiedSystemInstruction,
                temperature: 0.7,
                topP: 0.95,
              }
            });
            modelUsed = "gemini-3.1-flash-lite";
          } catch (fallbackError: any) {
            console.error(`[Gemini API] Fallback model also failed:`, fallbackError);
            throw fallbackError; // Propagate up if fallback fails too
          }
        } else {
          // Wait 1000ms before retrying the primary model
          console.log(`[Gemini API] Retrying primary model in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    const replyText = response?.text || "Mohon maaf, saya mengalami kendala teknis dalam memproses respon.";

    res.json({
      content: replyText,
      modelUsed: modelUsed
    });

  } catch (error: any) {
    console.error("Gemini API server-side generation failed:", error);
    res.status(500).json({ 
      error: "AI Generation Error", 
      details: error.message || String(error) 
    });
  }
});

// Serve static assets / launch dev server middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Vite dev server integrating as middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Productive mode: serving static build assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OmniAI Fullstack Server] Running on http://localhost:${PORT}`);
    console.log(`Dev/Production gateway ports bound successfully to 0.0.0.0:${PORT}`);
  });
}

startServer();
