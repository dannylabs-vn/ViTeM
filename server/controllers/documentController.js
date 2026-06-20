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
    summary: "Patient presents with high blood pressure (145/90) and persistent severe headache. High risk of preeclampsia, requires close monitoring.", 
    confidence: 85, 
    urgency: "RED", 
    status: "WAITING_DOCTOR", 
    created_at: new Date(Date.now() - 15 * 60000),
    location: "Ban Banh, Co Linh Commune",
    latitude: 22.42,
    longitude: 105.62,
    health_checklist: [
      { label: "Blood Pressure", value: "145/90 mmHg", tag: "RED", note: "Gestational hypertension - risk of preeclampsia" },
      { label: "Maternal Weight", value: "55 kg", tag: "GREEN", note: "Appropriate for gestational age" },
      { label: "Fetal Heart Rate", value: "148 bpm", tag: "GREEN", note: "Normal fetal heart rate" },
      { label: "Amniotic Fluid (AFI)", value: "4 cm", tag: "RED", note: "Oligohydramnios — below safe level" },
      { label: "Urine Protein", value: "+2", tag: "RED", note: "High urine protein, associated with preeclampsia" },
      { label: "Blood Glucose", value: "5.1 mmol/L", tag: "GREEN", note: "Normal" },
      { label: "Gestational Age", value: "34 weeks", tag: "GREEN", note: "Consistent with size" },
      { label: "Headache Symptoms", value: "Yes — persisting for 5 days", tag: "RED", note: "Danger sign" }
    ]
  },
  { 
    id: 2, 
    patientName: "Sầm Văn Bình", 
    phone_number: "0987654321",
    summary: "Patient reports reduced fetal movement in the past 12 hours. Scheduled appointment at the health station for fetal heart rate measurement and amniotic fluid ultrasound check.", 
    confidence: 92, 
    urgency: "YELLOW", 
    status: "WAITING_MIDWIFE", 
    created_at: new Date(Date.now() - 45 * 60000),
    location: "Ban Nghen, Khang Ninh Commune",
    latitude: 22.38,
    longitude: 105.54,
    health_checklist: [
      { label: "Blood Pressure", value: "120/75 mmHg", tag: "GREEN", note: "Normal blood pressure" },
      { label: "Maternal Weight", value: "62 kg", tag: "GREEN", note: "Appropriate" },
      { label: "Fetal Heart Rate", value: "128 bpm", tag: "YELLOW", note: "Mildly low — additional monitoring required" },
      { label: "Fetal Movements", value: "< 10 times/12h", tag: "YELLOW", note: "Reduced fetal movement, ultrasound check required" },
      { label: "Amniotic Fluid (AFI)", value: "8 cm", tag: "GREEN", note: "Within normal limits" },
      { label: "Gestational Age", value: "36 weeks", tag: "GREEN", note: "Appropriate" },
      { label: "Blood Glucose", value: "6.8 mmol/L", tag: "YELLOW", note: "Mildly elevated, monitor for gestational diabetes" }
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
      patientName: patientName || aiResult.patientName || ("Patient " + phoneNumber.slice(-4)),
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
      location: location || "Undetermined",
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
