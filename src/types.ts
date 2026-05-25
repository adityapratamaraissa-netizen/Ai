export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isPremium: boolean;
  role: "user" | "admin";
  customApiKey?: string;
  language?: string;
  createdAt?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  modelType: "gpt" | "gemini" | "claude" | "dola";
  assistantType: "general" | "coding" | "study";
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  userId: string;
  role: "user" | "model";
  content: string;
  reasoning?: string; // Content inside <thinking>...</thinking> tags for Think Mode
  imageUrl?: string; // Attached base64 images for multimodal explanation
  createdAt: string;
}
