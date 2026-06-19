const { processMedicalDocument } = require("../services/geminiService");
const { supabase } = require("../services/supabaseService");
const { generateAudio } = require("../services/ttsService");
const fs = require("fs");

// In-memory mock database for testing without Supabase
let mockCases = [
  { 
    id: 1, 
    patientName: "Lò Thị Mai", 
    phone_number: "0901212112",
    summary: "Bệnh nhân có biểu hiện huyết áp cao (145/90) và đau đầu dữ dội kéo dài. Có nguy cơ tiền sản giật, cần theo dõi sát sao.", 
    confidence: 85, 
    urgency: "RED", 
    status: "WAITING_DOCTOR", 
    created_at: new Date(Date.now() - 15 * 60000) // 15 mins ago
  },
  { 
    id: 2, 
    patientName: "Sầm Văn Bình", 
    phone_number: "0987654321",
    summary: "Bệnh nhân báo cáo thai nhi ít máy trong 12 giờ qua. Cần hẹn đến trạm y tế để đo tim thai và siêu âm kiểm tra lượng nước ối.", 
    confidence: 92, 
    urgency: "YELLOW", 
    status: "WAITING_MIDWIFE", 
    created_at: new Date(Date.now() - 45 * 60000) // 45 mins ago
  }
];
let idCounter = 3;

async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No document image uploaded" });
    }

    const { phoneNumber } = req.body;
    const fileBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype;

    // 1. Process with Gemini AI
    const aiResult = await processMedicalDocument(fileBuffer, mimeType, phoneNumber);

    // 2. Upload to Supabase (Skip if keys not set)
    let publicUrl = "mock_url";
    if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== "your_supabase_url") {
      const fileName = `docs/${Date.now()}_${req.file.originalname}`;
      const { data: storageData } = await supabase.storage.from("medical-docs").upload(fileName, fileBuffer, { contentType: mimeType });
      if (storageData) {
        const { data: pubData } = supabase.storage.from("medical-docs").getPublicUrl(fileName);
        publicUrl = pubData.publicUrl;
      }
    }

    let status = "COMPLETED";
    if (aiResult.urgency === "RED") status = "WAITING_DOCTOR";
    else if (aiResult.urgency === "YELLOW" || aiResult.confidence < 60) status = "WAITING_MIDWIFE";

    const caseData = {
      phone_number: phoneNumber,
      patientName: "Bệnh nhân " + phoneNumber.slice(-4), // Mock name
      document_url: publicUrl,
      summary: aiResult.summary,
      urgency: aiResult.urgency,
      confidence: aiResult.confidence,
      checklist: aiResult.checklist,
      warning_box: aiResult.warning_box,
      tay_translation: aiResult.tay_translation,
      status: status,
      created_at: new Date(),
    };

    if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== "your_supabase_url") {
      const { data: dbData } = await supabase.from("cases").insert([caseData]).select().single();
      if (dbData) {
        fs.unlinkSync(req.file.path);
        return res.status(200).json({ success: true, case: dbData });
      }
    }

    // Mock DB Fallback
    const newCase = { id: idCounter++, ...caseData };
    mockCases.unshift(newCase);
    fs.unlinkSync(req.file.path);

    res.status(200).json({ success: true, case: newCase, localOnly: true });
  } catch (error) {
    console.error("Error in uploadDocument:", error);
    res.status(500).json({ error: "Failed to process document" });
  }
}

async function getCases(req, res) {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== "your_supabase_url") {
    const { data } = await supabase.from("cases").select("*").order("created_at", { ascending: false });
    return res.status(200).json({ success: true, cases: data || [] });
  }
  // Mock DB fallback
  res.status(200).json({ success: true, cases: mockCases, localOnly: true });
}

async function approveCase(req, res) {
  const { id } = req.params;
  const { patientName, phone_number, summary, instruction_for_patient } = req.body;

  if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== "your_supabase_url") {
    const { data, error } = await supabase.from("cases").update({ 
      status: "COMPLETED",
      ...(patientName && { patientName }),
      ...(phone_number && { phone_number }),
      ...(summary && { summary }),
      ...(instruction_for_patient && { instruction_for_patient })
    }).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, case: data });
  }

  // Mock DB fallback
  const caseIndex = mockCases.findIndex(c => c.id == id);
  if (caseIndex !== -1) {
    mockCases[caseIndex].status = "COMPLETED";
    if (patientName) mockCases[caseIndex].patientName = patientName;
    if (phone_number) mockCases[caseIndex].phone_number = phone_number;
    if (summary) mockCases[caseIndex].summary = summary;
    if (instruction_for_patient) mockCases[caseIndex].instruction_for_patient = instruction_for_patient;
    return res.status(200).json({ success: true, case: mockCases[caseIndex], localOnly: true });
  }
  
  res.status(404).json({ error: "Case not found" });
}
async function escalateCase(req, res) {
  const { id } = req.params;
  const { patientName, phone_number, summary, suggestion_for_doctor } = req.body;

  if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== "your_supabase_url") {
    const { data, error } = await supabase.from("cases").update({ 
      status: "WAITING_DOCTOR",
      urgency: "RED",
      ...(patientName && { patientName }),
      ...(phone_number && { phone_number }),
      ...(summary && { summary }),
      ...(suggestion_for_doctor && { suggestion_for_doctor })
    }).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, case: data });
  }

  // Mock DB fallback
  const caseIndex = mockCases.findIndex(c => c.id == id);
  if (caseIndex !== -1) {
    mockCases[caseIndex].status = "WAITING_DOCTOR";
    mockCases[caseIndex].urgency = "RED";
    if (patientName) mockCases[caseIndex].patientName = patientName;
    if (phone_number) mockCases[caseIndex].phone_number = phone_number;
    if (summary) mockCases[caseIndex].summary = summary;
    if (suggestion_for_doctor) mockCases[caseIndex].suggestion_for_doctor = suggestion_for_doctor;
    return res.status(200).json({ success: true, case: mockCases[caseIndex], localOnly: true });
  }
  
  res.status(404).json({ error: "Case not found" });
}

module.exports = {
  uploadDocument,
  getCases,
  approveCase,
  escalateCase
};
