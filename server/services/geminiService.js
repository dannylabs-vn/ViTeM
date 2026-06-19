const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey && apiKey !== "your_gemini_api_key" ? new GoogleGenAI({ apiKey }) : null;

async function processMedicalDocument(imageBuffer, mimeType, phoneMetadata) {
  // If API key is not configured, return simulated mock data to allow UI testing
  if (!ai) {
    console.warn("GEMINI_API_KEY not configured. Returning simulated AI response.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: "Kết quả siêu âm cho thấy bệnh nhân có dấu hiệu thiểu ối (nước ối ít). Huyết áp đo được là 145/90 mmHg (tăng huyết áp thai kỳ). Bệnh nhân khai báo thường xuyên bị đau đầu và hoa mắt trong 3 ngày qua.",
          urgency: "RED", // Simulate RED to trigger Waiting for Doctor
          confidence: 85,
          checklist: [
            "Lập tức nằm nghỉ ngơi nghiêng về bên trái trên giường êm để tăng cường máu lưu thông đến thai nhi.",
            "Uống ngay 1-2 ly nước ấm lớn (khoảng 500ml) để cải thiện tình trạng nước ối trong lúc chờ đợi.",
            "Tuyệt đối không tự ý uống thuốc giảm đau đầu khi chưa có chỉ định của bác sĩ.",
            "Chuẩn bị sẵn đồ đạc cá nhân, giấy tờ tùy thân và sổ khám thai để sẵn sàng đến bệnh viện tuyến huyện kiểm tra."
          ],
          warning_box: "Huyết áp cao 145/90 kèm đau đầu là dấu hiệu nguy hiểm của tiền sản giật. Cần có sự theo dõi y tế ngay lập tức.",
          tay_translation: "Nước ối nọi, chích pây nghỉ ngơi. Cần thiết pây bệnh viện ngay (Tày mock translation)."
        });
      }, 2000);
    });
  }

  const prompt = `
You are an expert medical AI specialized in rural maternal health triage for the Tày ethnic minority in Vietnam.
Read the attached medical document carefully.
Extract the details and provide a JSON response:
1. "summary": A short, simple summary WITHOUT complex medical jargon so the patient can easily understand. Replace hard medical terms with simple explanations.
2. "urgency": "GREEN", "YELLOW", or "RED".
   - RED: Critical danger signs (fever, rash, water breaking, severe headache, heavy bleeding).
   - YELLOW: Requires attention (antibiotics affecting fetus, checkup schedules).
   - GREEN: Routine wellness or minor issues.
3. "confidence": A score from 0 to 100 based on text clarity.
4. "checklist": An array of actionable health suggestions.
   - IF RED: Provide ONLY emergency first-aid instructions. ABSOLUTELY NO OTHER INSTRUCTIONS.
   - IF YELLOW: Provide a checklist for the midwife to review (e.g., antibiotic safety, schedule).
   - IF GREEN: Provide simple wellness tips.
5. "warning_box": If RED, a short warning message. Else null.
6. "tay_translation": A SINGLE STRING containing the translated summary into the Tày ethnic language. DO NOT return a nested object.
Return ONLY valid JSON without any markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: mimeType,
          },
        },
        prompt,
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const textResult = response.text;
    return JSON.parse(textResult);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
}

module.exports = {
  processMedicalDocument,
};
