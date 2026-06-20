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
    created_at: new Date(Date.now() - 15 * 60000),
    location: "Bản Bành, xã Cổ Linh",
    latitude: 22.42,
    longitude: 105.62,
    health_checklist: [
      { label: "Huyết áp", value: "145/90 mmHg", tag: "RED", note: "Tăng huyết áp thai kỳ - nguy cơ tiền sản giật" },
      { label: "Cân nặng mẹ", value: "55 kg", tag: "GREEN", note: "Phù hợp với tuổi thai" },
      { label: "Tim thai", value: "148 nhịp/phút", tag: "GREEN", note: "Nhịp tim thai bình thường" },
      { label: "Nước ối (AFI)", value: "4 cm", tag: "RED", note: "Thiểu ối — dưới mức an toàn" },
      { label: "Protein niệu", value: "+2", tag: "RED", note: "Protein niệu cao, liên quan tiền sản giật" },
      { label: "Đường huyết", value: "5.1 mmol/L", tag: "GREEN", note: "Bình thường" },
      { label: "Tuổi thai", value: "34 tuần", tag: "GREEN", note: "Phù hợp kích thước" },
      { label: "Triệu chứng đau đầu", value: "Có — kéo dài 5 ngày", tag: "RED", note: "Dấu hiệu nguy hiểm" }
    ]
  },
  { 
    id: 2, 
    patientName: "Sầm Văn Bình", 
    phone_number: "0987654321",
    summary: "Bệnh nhân báo cáo thai nhi ít máy trong 12 giờ qua. Cần hẹn đến trạm y tế để đo tim thai và siêu âm kiểm tra lượng nước ối.", 
    confidence: 92, 
    urgency: "YELLOW", 
    status: "WAITING_MIDWIFE", 
    created_at: new Date(Date.now() - 45 * 60000),
    location: "Bản Nghèn, xã Khang Ninh",
    latitude: 22.38,
    longitude: 105.54,
    health_checklist: [
      { label: "Huyết áp", value: "120/75 mmHg", tag: "GREEN", note: "Huyết áp bình thường" },
      { label: "Cân nặng mẹ", value: "62 kg", tag: "GREEN", note: "Phù hợp" },
      { label: "Tim thai", value: "128 nhịp/phút", tag: "YELLOW", note: "Hơi thấp — cần theo dõi thêm" },
      { label: "Cử động thai", value: "< 10 lần/12h", tag: "YELLOW", note: "Thai ít máy, cần siêu âm kiểm tra" },
      { label: "Nước ối (AFI)", value: "8 cm", tag: "GREEN", note: "Trong ngưỡng bình thường" },
      { label: "Tuổi thai", value: "36 tuần", tag: "GREEN", note: "Phù hợp" },
      { label: "Đường huyết", value: "6.8 mmol/L", tag: "YELLOW", note: "Hơi cao, cần theo dõi tiểu đường thai kỳ" }
    ]
  }
];
let idCounter = 3;

async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No document image uploaded" });
    }

    const { phoneNumber, selectedSymptoms, latitude, longitude, location, patientName } = req.body;
    const symptoms = selectedSymptoms ? (typeof selectedSymptoms === 'string' ? JSON.parse(selectedSymptoms) : selectedSymptoms) : [];
    const fileBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype;

    // 1. Process with Gemini AI
    const aiResult = await processMedicalDocument(fileBuffer, mimeType, phoneNumber, symptoms);

    // 2. Upload to Supabase (Skip if keys not set)
    let publicUrl = "mock_url";
    if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== "your_supabase_url") {
      const fileName = `docs/${Date.now()}_${req.file.originalname}`;
      const { data: storageData, error: storageError } = await supabase.storage.from("medical-docs").upload(fileName, fileBuffer, { contentType: mimeType });
      if (storageError) {
        console.error("Supabase Storage Upload Error:", storageError);
      }
      if (storageData) {
        const { data: pubData } = supabase.storage.from("medical-docs").getPublicUrl(fileName);
        publicUrl = pubData.publicUrl;
      }
    }

    let status = "WAITING_MIDWIFE";
    if (aiResult.urgency === "RED") status = "WAITING_DOCTOR";

    const caseData = {
      phone_number: phoneNumber,
      patientName: patientName || aiResult.patientName || ("Bệnh nhân " + phoneNumber.slice(-4)),
      document_url: publicUrl,
      summary: aiResult.summary,
      urgency: aiResult.urgency,
      confidence: aiResult.confidence,
      health_checklist: aiResult.health_checklist || [],
      checklist: aiResult.checklist,
      warning_box: aiResult.warning_box,
      tay_translation: aiResult.tay_translation,
      status: status,
      created_at: new Date(),
      location: location || "Chưa xác định",
      latitude: parseFloat(latitude) || 22.415,
      longitude: parseFloat(longitude) || 105.625
    };

    if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== "your_supabase_url") {
      const { data: dbData, error: dbError } = await supabase.from("cases").insert([caseData]).select().single();
      if (dbError) {
        console.error("Supabase Database Insert Error:", dbError);
      }
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
  const { phone } = req.query;

  if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== "your_supabase_url") {
    let query = supabase.from("cases").select("*").order("created_at", { ascending: false });
    if (phone) {
      query = query.eq("phone_number", phone);
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, cases: data || [] });
  }
  // Mock DB fallback
  let filtered = mockCases;
  if (phone) {
    filtered = mockCases.filter(c => c.phone_number === phone);
  }
  res.status(200).json({ success: true, cases: filtered, localOnly: true });
}

async function updateCase(req, res) {
  const { id } = req.params;
  const { patientName, phone_number, summary, suggestion_for_doctor, instruction_for_patient, health_checklist, status, urgency } = req.body;

  if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== "your_supabase_url") {
    const { data, error } = await supabase.from("cases").update({
      ...(patientName && { patientName }),
      ...(phone_number && { phone_number }),
      ...(summary && { summary }),
      ...(suggestion_for_doctor && { suggestion_for_doctor }),
      ...(instruction_for_patient && { instruction_for_patient }),
      ...(health_checklist && { health_checklist }),
      ...(status && { status }),
      ...(urgency && { urgency })
    }).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, case: data });
  }

  // Mock DB fallback
  const caseIndex = mockCases.findIndex(c => c.id == id);
  if (caseIndex !== -1) {
    if (patientName) mockCases[caseIndex].patientName = patientName;
    if (phone_number) mockCases[caseIndex].phone_number = phone_number;
    if (summary) mockCases[caseIndex].summary = summary;
    if (suggestion_for_doctor) mockCases[caseIndex].suggestion_for_doctor = suggestion_for_doctor;
    if (instruction_for_patient) mockCases[caseIndex].instruction_for_patient = instruction_for_patient;
    if (health_checklist) mockCases[caseIndex].health_checklist = health_checklist;
    if (status) mockCases[caseIndex].status = status;
    if (urgency) mockCases[caseIndex].urgency = urgency;
    return res.status(200).json({ success: true, case: mockCases[caseIndex], localOnly: true });
  }

  res.status(404).json({ error: "Case not found" });
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
  updateCase,
  approveCase,
  escalateCase
};
