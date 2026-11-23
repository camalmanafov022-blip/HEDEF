import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

export interface SuggestedStep {
  text: string;
  note?: string;
}

export async function optimizeGoalSteps(
  goalTitle: string,
  category: string,
  description?: string,
  targetDate?: string
): Promise<SuggestedStep[] | null> {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        İstifadəçi belə bir hədəf qoyub: "${goalTitle}".
        Kateqoriya: "${category}".
        ${description ? `Əlavə məlumat: "${description}".` : ""}
        ${targetDate ? `Son tarix: ${targetDate}.` : ""}
        Bu hədəfə çatmaq üçün 5 konkret, ardıcıl və icra edilə bilən addım (step) təklif et.
        Hər addım üçün qısa başlıq ("text") və 1 cümləlik faydalı ayrıntı/ipucu ("note") yaz.
        Yalnız JSON massivi formatında qaytar, başqa heç nə yazma.
        Nümunə cavab: [{"text": "Addım 1", "note": "Qısa izah"}, {"text": "Addım 2", "note": "Qısa izah"}]
        Dil: Azərbaycan dili.
      `,
    });

    const text = response.text;
    if (!text) return null;

    const cleanedText = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    if (Array.isArray(parsed)) {
      return parsed.map((item) =>
        typeof item === "string"
          ? { text: item }
          : { text: String(item.text || ""), note: item.note ? String(item.note) : undefined }
      ).filter((item) => item.text.trim().length > 0);
    }

    return null;
  } catch (error) {
    console.error("AI optimization error:", error);
    return null;
  }
}
