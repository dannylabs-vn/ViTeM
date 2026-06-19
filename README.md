

[User Input] ──> [AI Processing (Gemini)] ──> [Logic & Handoff] ──> [Outputs]

Photo          - OCR & Summarization         - Green: Direct AI     - Plain Summary

Audio Opt.     - Classify Urgency            - Yellow: Midwife      - Tày Audio

Metadata       - Confidence Score            - Red: Doctor Escal.   - Action Checklist


### 1. Inputs
*   **Document Upload:** User uploads a photo of a medical document (discharge papers, prescriptions, prenatal check-up slips, referral letters, or health brochures).
*   **User Options:** Optional checkbox or button selection for "Translate to Tày" or "Listen to audio".
*   **Metadata:** User phone number for localized healthcare worker routing and referral.

### 2. AI Capabilities Used
*   **Multimodal LLM (Google Gemini):** Handles OCR, document understanding, summarization, risk classification, checklist generation, and translation in a single optimized API call.
*   **Text-to-Speech (TTS):** Converts the translated Tày language text into spoken audio to support non-literate or low-literacy users.

### 3. Processing Flow
*   **Step 1 - OCR & Summarization:** Gemini extracts text from the image, filters administrative/procedural noise, replaces complex medical jargon with plain Vietnamese, and generates a concise 2-3 sentence summary.
*   **Step 2 - Classification:** AI assigns an urgency level based on detected danger signs:
    *   **RED (Emergency):** Danger signs detected $\rightarrow$ Requires immediate doctor review.
    *   **YELLOW (Important):** Important schedules, specific medications, or appointments $\rightarrow$ Requires midwife review.
    *   **GREEN (Routine):** General health information or routine wellness guides $\rightarrow$ Handled independently by AI.
*   **Step 3 - Confidence Scoring:** AI calculates a confidence score (0-100%) based on image quality, text clarity, and structural complexity:
    *   **High ($\ge 80\%$):** Proceed with standard automated workflow or triage.
    *   **Medium (60-79%):** Proceed but flag for human review if classified as YELLOW/RED.
    *   **Low (<60%):** Automatically escalate to human review regardless of urgency level.
*   **Step 4 - Checklist Generation:** AI structures information into a prioritized, chronological action checklist containing specific dosages and clear warnings. A specialized **RED safety warning box** is always prepended at the top if any risks are detected.
*   **Step 5 - Tiered Handoff:**
    *   *GREEN + High Confidence:* AI sends the checklist directly to the user.
    *   *YELLOW or Low Confidence:* Case file is dispatched to the local midwife for rapid verification.
    *   *RED:* AI provides immediate temporary first-aid guidelines, logs a case file, and escalates to a doctor for final approval.

### 4. System Outputs
*   Plain-language summary in simplified Vietnamese.
*   Optional Tày translation accompanied by high-quality audio playback.
*   Interactive checklist with chronological checkboxes in priority order.
*   Prominent RED warning box (always visible if danger signs exist).
*   Temporary first-aid guidance for RED cases with automated push alerts to nearby healthcare staff.
*   Transparent confidence score indicators displayed on the UI.

---

## 4. Triage Case Studies & Processing Logic

### CASE 1: GREEN (Routine - Thông thường)
*   **Document Type:** Nutritional supplement prescriptions (vitamins, iron, calcium), nutrition brochures, general health education literature.
*   **Input Example:** *"Thuốc sắt: uống 1 viên mỗi ngày sau ăn sáng. Canxi: uống 1 viên mỗi tối trước khi ngủ. Vitamin tổng hợp: uống 1 viên sau ăn trưa. Thời gian uống: 3 tháng."*

#### AI Processing Triage:
| Step | Result | Justification |
| :--- | :--- | :--- |
| **Classification** | **GREEN (XANH)** | No emergency danger signs, no complex follow-up schedule. |
| **Confidence** | **99%** | High clarity, printed text, no ambiguous terms. |
| **Approval** | **Automated** | Handled directly by AI and sent instantly. |

#### System Output:
> ### 📋 HƯỚNG DẪN UỐNG THUỐC
> - [ ] **Bước 1:** Mỗi sáng uống 1 viên sắt (sau khi ăn sáng).
> - [ ] **Bước 2:** Mỗi trưa uống 1 viên vitamin tổng hợp (sau khi ăn trưa).
> - [ ] **Bước 3:** Mỗi tối uống 1 viên canxi (trước khi đi ngủ).
> - [ ] **Bước 4:** Tiếp tục uống đều đặn trong vòng 3 tháng.
> 
> *ℹ️ ĐÂY LÀ HƯỚNG DẪN THÔNG THƯỜNG, KHÔNG CÓ DẤU HIỆU NGUY HIỂM VÀ ĐÃ ĐƯỢC HỆ THỐNG KIỂM TRA TỰ ĐỘNG.*

---

### CASE 2: YELLOW (Important - Quan trọng)

#### Example 2A: Routine Prenatal Follow-up
*   **Document Type:** Follow-up appointments, immunization records, routine lab results.
*   **Input Example:** *"Tên thai phụ: Lò Thị M. Tuổi thai: 28 tuần. Huyết áp: 120/80 mmHg. Kết quả siêu âm: thai phát triển bình thường. Hẹn tái khám sau 4 tuần (ngày 20/7/2026). Nhớ mang theo sổ khám thai. Bổ sung sắt và canxi theo đơn kèm theo."*

#### AI Processing Triage:
| Step | Result | Justification |
| :--- | :--- | :--- |
| **Classification** | **YELLOW (VÀNG)** | Contains a critical future appointment and medical management routine. |
| **Confidence** | **98%** | Printed document with clear layout. |
| **Approval** | **Midwife Verified** | Routed to the midwife's dashboard for verification. |

#### Midwife-Approved Output:
> ### 📅 VIỆC CẦN LÀM TRONG 4 TUẦN TỚI
> - [ ] **Bước 1:** Uống 1 viên sắt và 1 viên canxi đều đặn mỗi ngày.
> - [ ] **Bước 2:** Đến ngày **20/07/2026**, chuẩn bị đi tái khám.
> - [ ] **Bước 3:** Nhớ mang theo sổ khám thai khi đi khám.
> 
> **👩‍⚕️ LƯU Ý TỪ NỮ HỘ SINH TRẠM Y TẾ:**
> *"Mẹ nên uống thuốc sắt trước bữa ăn để cơ thể hấp thu tốt nhất. Nếu mẹ thấy có các biểu hiện lạ như đau đầu dữ dội hoặc bị phù chân, hãy báo ngay cho trạm y tế xã."*

#### Example 2B: Specialized Medication (Antibiotics)
*   **Document Type:** Specialized medical prescriptions, antibiotics, targeted therapies.
*   **Input Example:** *"Amoxicillin 500mg: uống mỗi 8 giờ, 1 viên/lần, trong 5 ngày. Paracetamol 500mg: uống 1 viên khi sốt trên 38.5°C. Uống nhiều nước, nghỉ ngơi."*

#### AI Processing Triage:
| Step | Result | Justification |
| :--- | :--- | :--- |
| **Classification** | **YELLOW (VÀNG)** | Requires exact dosing intervals for an antibiotic regime. |
| **Confidence** | **85%** | Moderate confidence due to handwritten text elements on the prescription. |
| **Approval** | **Midwife Verified** | Sent to a midwife to review handwriting extraction accuracy. |

#### Midwife-Corrected & Approved Output:
> ### 💊 HƯỚNG DẪN UỐNG THUỐC ĐIỀU TRỊ
> - [ ] **Bước 1:** Uống 1 viên **Amoxicillin 500mg** mỗi 8 tiếng (chia đều Sáng - Trưa - Tối), uống liên tục trong 5 ngày và không được bỏ cữ.
> - [ ] **Bước 2:** Chỉ uống 1 viên **Paracetamol 500mg** khi cơ thể sốt cao trên 38.5°C.
> - [ ] **Bước 3:** Uống thật nhiều nước trong ngày và nghỉ ngơi tại nhà.
> 
> **👩‍⚕️ LƯU Ý TỪ NỮ HỘ SINH TRẠM Y TẾ:**
> *"Thuốc kháng sinh Amoxicillin bắt buộc phải uống đúng giờ, đủ liều, tuyệt đối không tự ý ngừng thuốc dù đã hết triệu chứng. Nếu xuất hiện dấu hiệu nổi mẩn đỏ trên da hoặc cảm thấy khó thở, hãy dừng uống và liên hệ trạm y tế ngay lập tức."*

---

### CASE 3: RED (Emergency - Cấp cứu)
*   **Document Type:** Discharge summaries with warning criteria, ER logs, critical post-op tracking.
*   **Input Example:** *"HƯỚNG DẪN CHĂM SÓC SAU SINH - Theo dõi tình trạng vàng da của trẻ: Nếu vàng da xuất hiện trong 24 giờ đầu sau sinh, hoặc vàng da lan đến lòng bàn tay, bàn chân, hoặc trẻ bỏ bú, ngủ li bì, khó đánh thức, cần đưa trẻ đến bệnh viện nhi ngay. Theo dõi sức khỏe của mẹ: Nếu sốt trên 38.5°C kèm ớn lạnh, hoặc lượng máu ra nhiều hơn kỳ kinh, hoặc sản dịch có mùi hôi, cần khám ngay. Uống sắt 1 viên/ngày. Tái khám sau 2 tuần."*

#### AI Processing Triage:
| Step | Result | Justification |
| :--- | :--- | :--- |
| **Classification** | **RED (ĐỎ)** | **6 Danger Signs Detected:** Neonatal jaundice within 24 hours, jaundice extending to extremities, poor feeding, lethargy, maternal fever $\ge 38.5^\circ\text{C}$ with chills, and postpartum hemorrhage. |
| **Confidence** | **95%** | Printed text, highly structured phrases. |
| **Approval** | **Doctor (Mandatory)** | Instant triage to Doctor Dashboard. |

#### Phase 1: Immediate Temporary First-Aid Guidance (Sent Automatically by AI)
> ### 🚨 [CẢNH BÁO NGUY HIỂM] PHẢI ĐƯA ĐẾN BỆNH VIỆN NGAY LẬP TỨC
> 
> **MẸ CẦN CHÚ Ý CÁC DẤU HIỆU SAU:**
> - [ ] Sốt cao trên 38.5°C kèm theo cảm giác ớn lạnh.
> - [ ] Ra máu âm đạo nhiều hơn một kỳ kinh bình thường hoặc có cục máu đông lớn.
> - [ ] Sản dịch tiết ra có mùi hôi khó chịu.
> 
> **BÉ CẦN CHÚ Ý CÁC DẤU HIỆU SAU:**
> - [ ] Bị vàng da trong vòng 24 giờ đầu tiên sau khi sinh.
> - [ ] Vàng da lan rộng xuống tận lòng bàn tay và lòng bàn chân.
> - [ ] Bé bỏ bú hoàn toàn.
> - [ ] Bé ngủ li bì, mê mệt, rất khó để đánh thức.
> 
> ---
> 
> ### 🛑 HƯỚNG DẪN TẠM THỜI (HỖ TRỢ BAN ĐẦU)
> - [ ] **Bước 1:** Cởi bớt quần áo, tã lót để làm mát cơ thể cho trẻ (nếu trẻ đang bị sốt).
> - [ ] **Bước 2:** Theo dõi sát sao nhiệt độ, màu sắc da và tình trạng bú của bé từng giờ.
> - [ ] **Bước 3:** Chuẩn bị sẵn sàng các giấy tờ tùy thân, sổ khám bệnh để di chuyển ra viện.
> - [ ] **Bước 4:** Tiếp tục uống 1 viên thuốc sắt mỗi ngày.
> 
> *⚠️ ĐÂY LÀ HƯỚNG DẪN TẠM THỜI ĐỂ ĐẢM BẢO AN TOÀN TRONG KHI CHỜ ĐỢI. BÁC SĨ CHUYÊN KHOA ĐÃ ĐƯỢC HỆ THỐNG THÔNG BÁO VÀ SẼ CUNG CẤP HƯỚNG DẪN CHÍNH THỨC CHO MẸ TRONG VÀI PHÚT TỚI.*

#### Phase 2: Official Doctor-Approved & Tailored Output
*(After doctor logs in, checks the case, edits instructions, and clicks submit)*

> ### 🚨 DẤU HIỆU NGUY HIỂM - PHẢI ĐI VIỆN NGAY TỨC KHẮC:
> 1. Trẻ bị vàng da trong 24h đầu, hoặc vàng da lan sâu xuống tận lòng bàn tay/bàn chân.
> 2. Trẻ có dấu hiệu bỏ bú, ngủ li bì, khó đánh thức.
> 3. Mẹ bị sốt cao $\ge 38.5^\circ\text{C}$ hoặc có hiện tượng băng huyết (ra máu nhiều).
> 
> ### 📋 VIỆC CẦN LÀM THEO CHỈ ĐỊNH:
> - [ ] **Bước 1:** Mẹ uống 1 viên thuốc sắt vào mỗi buổi sáng (sau khi ăn no).
> - [ ] **Bước 2:** Đưa bé đi tái khám định kỳ tại khoa Nhi sau đúng 2 tuần.
> 
> **👨‍⚕️ CHỈ ĐỊNH CHUYÊN KHOA TỪ BÁC SĨ:**
> 1. Hãy đưa bé đến ngay bệnh viện nhi gần nhất nếu phát hiện bất kỳ biểu hiện vàng da tăng dần hoặc bé có xu hướng bỏ bú.
> 2. Hãy gọi ngay cho trạm y tế qua số điện thoại khẩn cấp: **0XXX-XXX-XXX** nếu mẹ thấy ra nhiều máu âm đạo.
> 3. Tuyệt đối không tự ý cho bé uống bất kỳ loại thuốc hay thảo dược nào khi chưa có sự đồng ý và chỉ định trực tiếp từ bác sĩ.
> 
> *✅ ĐÂY LÀ HƯỚNG DẪN Y TẾ CHÍNH THỨC ĐÃ ĐƯỢC BÁC SĨ CHUYÊN KHOA KIỂM TRA VÀ PHÊ DUYỆT.*
"""

with open("VITEM_Framework_Script.md", "w", encoding="utf-8") as f:
    f.write(content)

print("Markdown file generated successfully.")

Your Markdown file for the VITEM Framework project script is ready.
Biểu tượng MD
VITEM_Framework_Script
 MD 
Đang mở

Tất cả các phần nội dung từ script tiếng Việt và sơ đồ kiến trúc bằng tiếng Anh đã được chuẩn hóa cấu trúc rõ ràng, định dạng khoa học thành các phần tổng quan, cơ chế Human-in-the-Loop, phân loại rủi ro và các kịch bản phân loại chi tiết (Xanh, Vàng, Đỏ).




Gemini là AI và có thể mắc sai sót.

# VITEM Framework: Crisis-to-Action Translator
**AI-Powered Maternal Health Accessibility Solution for the Tày Ethnic Minority**

---

## 1. Project Overview & Description

### The Target Audience (WHO)
Our solution directly supports **pregnant women and new mothers from the Tày ethnic minority** living in remote, isolated areas of **Định Quán district, Đồng Nai province**.

### The Problem
When medical emergencies or maternal health crises arise, these mothers face overwhelming challenges in accessing and navigating critical healthcare information:
*   **Acute Stress Barriers:** Current healthcare systems, government maternal aid notices, and medical discharge forms are not designed for individuals under acute stress.
*   **Cognitive & Linguistic Gap:** Official documents rely heavily on dense medical jargon, complicated administrative procedures, and are strictly written in the national language (Vietnamese) rather than native ethnic dialects.
*   **The Invisible Resource:** This immense information gap creates deep panic, rendering vital health resources and life-saving instructions effectively "invisible" or impossible to navigate for isolated mothers.

### The Solution
To bridge this critical gap, we developed the **VITEM framework**, an AI-powered Minimum Viable Product (MVP) designed specifically as a **Crisis-to-Action Translator**. The solution transforms complex, high-stress medical documents into immediate, culturally tailored, and actionable steps.

### Key Features
1.  **Multilingual & Culturally Appropriate Translation:** Users can upload or snap a photo of any complex medical guidance, hospital discharge instruction, or immunization schedule. The AI translates the text into both simplified, plain Vietnamese and the native Tày language dialect, utilizing culturally familiar terms instead of clinical jargon.
2.  **Jargon-to-Plain-Language Simplification:** The AI strips away overwhelming medical terminology, extracting only what matters most to the mother right at that moment.
3.  **Actionable Crisis Checklists:** Instead of throwing long paragraphs of text at a panicked mother, the system automatically structures the processed information into a clear, chronological, step-by-step checklist of immediate next steps (e.g., precise medication dosages, exact warning signs to monitor, and specific times to visit the nearest clinic).

---

## 2. Responsible AI & Human-in-the-Loop Design

### The Decision AI Does NOT Make
The AI **does NOT** make the final decision to approve and send the action checklist for any case classified as **YELLOW** (midwife-reviewed) or **RED** (doctor-reviewed). 
*   It flags warning signs and suggests next steps, but it cannot authorize the final guidance that reaches the mother.
*   Additionally, if the AI's confidence score falls **below 60%**, the system automatically escalates the file for human review—even if no danger signs are detected.

### Why a Human Must Remain Involved
Medical decisions carry life-or-death consequences. Only trained healthcare workers—**midwives** for routine/important schedules and **doctors** for high-risk emergencies—can verify information accuracy, assess patient context, and take professional responsibility. This tiered approach reflects how rural healthcare actually operates, where community health workers are the first point of contact before physicians.

### The Handoff Mechanism
*   **RED Cases:** When the AI detects emergency signs, it immediately provides temporary, generic first-aid guidance only (so the mother is not left waiting) and creates an urgent case file in the doctor's dashboard.
*   **YELLOW Cases:** The file is routed directly to a midwife's dashboard for verification.
*   **Low Confidence (<60%):** Triggers automatic human review regardless of the text classification to ensure expert verification before any critical recommendation reaches the patient.

### Responsible AI Guardrail: Managing Risks
*   **Identified Risk:** *Misclassifying Tày Traditions.* Because standard AI models are largely urban and Western-centric, they may falsely flag culturally safe Tày maternal customs—such as specific highland diets, postpartum practices, or traditional herbal remedies—as "incorrect" or "unsafe" simply due to underrepresentation in training datasets.
*   **Risk Reduction Strategy:** *Hyper-Localized Data.* To overcome systemic biases toward the urban Kinh majority and Western medicine, the AI is fine-tuned on the lived realities of Tày mothers. This requires integrating the Tày language, local idioms for symptoms, and traditional highland health practices to ensure the AI provides culturally respectful, tailored support rather than generic, alienating hospital advice.

### Why Standard Tools (Like Google Search) Fail
Standard web search engines cannot effectively solve this problem because a panicked user under acute stress cannot type out complex medical texts, search tools cannot automatically perform OCR on messy paper forms, they cannot parse dense medical websites into simple lists, and they lack comprehensive support for native Tày dialects. 
*   **Only AI can:** "See" the document through OCR $
ightarrow$ "Understand" complex medical text $
ightarrow$ "Extract" what matters most $
ightarrow$ "Translate" into the Tày language $
ightarrow$ "Structure" information into actionable steps in **under 30 seconds**.

---

## 3. System & AI Architecture

```
[User Input] ──> [AI Processing (Gemini)] ──> [Logic & Handoff] ──> [Outputs]
  - Photo          - OCR & Summarization         - Green: Direct AI     - Plain Summary
  - Audio Opt.     - Classify Urgency            - Yellow: Midwife      - Tày Audio
  - Metadata       - Confidence Score            - Red: Doctor Escal.   - Action Checklist
```

### 1. Inputs
*   **Document Upload:** User uploads a photo of a medical document (discharge papers, prescriptions, prenatal check-up slips, referral letters, or health brochures).
*   **User Options:** Optional checkbox or button selection for "Translate to Tày" or "Listen to audio".
*   **Metadata:** User phone number for localized healthcare worker routing and referral.

### 2. AI Capabilities Used
*   **Multimodal LLM (Google Gemini):** Handles OCR, document understanding, summarization, risk classification, checklist generation, and translation in a single optimized API call.
*   **Text-to-Speech (TTS):** Converts the translated Tày language text into spoken audio to support non-literate or low-literacy users.

### 3. Processing Flow
*   **Step 1 - OCR & Summarization:** Gemini extracts text from the image, filters administrative/procedural noise, replaces complex medical jargon with plain Vietnamese, and generates a concise 2-3 sentence summary.
*   **Step 2 - Classification:** AI assigns an urgency level based on detected danger signs:
    *   **RED (Emergency):** Danger signs detected $
ightarrow$ Requires immediate doctor review.
    *   **YELLOW (Important):** Important schedules, specific medications, or appointments $
ightarrow$ Requires midwife review.
    *   **GREEN (Routine):** General health information or routine wellness guides $
ightarrow$ Handled independently by AI.
*   **Step 3 - Confidence Scoring:** AI calculates a confidence score (0-100%) based on image quality, text clarity, and structural complexity:
    *   **High ($\ge 80\%$):** Proceed with standard automated workflow or triage.
    *   **Medium (60-79%):** Proceed but flag for human review if classified as YELLOW/RED.
    *   **Low (<60%):** Automatically escalate to human review regardless of urgency level.
*   **Step 4 - Checklist Generation:** AI structures information into a prioritized, chronological action checklist containing specific dosages and clear warnings. A specialized **RED safety warning box** is always prepended at the top if any risks are detected.
*   **Step 5 - Tiered Handoff:**
    *   *GREEN + High Confidence:* AI sends the checklist directly to the user.
    *   *YELLOW or Low Confidence:* Case file is dispatched to the local midwife for rapid verification.
    *   *RED:* AI provides immediate temporary first-aid guidelines, logs a case file, and escalates to a doctor for final approval.

### 4. System Outputs
*   Plain-language summary in simplified Vietnamese.
*   Optional Tày translation accompanied by high-quality audio playback.
*   Interactive checklist with chronological checkboxes in priority order.
*   Prominent RED warning box (always visible if danger signs exist).
*   Temporary first-aid guidance for RED cases with automated push alerts to nearby healthcare staff.
*   Transparent confidence score indicators displayed on the UI.

---

## 4. Triage Case Studies & Processing Logic

### CASE 1: GREEN (Routine - Thông thường)
*   **Document Type:** Nutritional supplement prescriptions (vitamins, iron, calcium), nutrition brochures, general health education literature.
*   **Input Example:** *"Thuốc sắt: uống 1 viên mỗi ngày sau ăn sáng. Canxi: uống 1 viên mỗi tối trước khi ngủ. Vitamin tổng hợp: uống 1 viên sau ăn trưa. Thời gian uống: 3 tháng."*

#### AI Processing Triage:
| Step | Result | Justification |
| :--- | :--- | :--- |
| **Classification** | **GREEN (XANH)** | No emergency danger signs, no complex follow-up schedule. |
| **Confidence** | **99%** | High clarity, printed text, no ambiguous terms. |
| **Approval** | **Automated** | Handled directly by AI and sent instantly. |

#### System Output:
> ### 📋 HƯỚNG DẪN UỐNG THUỐC
> - [ ] **Bước 1:** Mỗi sáng uống 1 viên sắt (sau khi ăn sáng).
> - [ ] **Bước 2:** Mỗi trưa uống 1 viên vitamin tổng hợp (sau khi ăn trưa).
> - [ ] **Bước 3:** Mỗi tối uống 1 viên canxi (trước khi đi ngủ).
> - [ ] **Bước 4:** Tiếp tục uống đều đặn trong vòng 3 tháng.
> 
> *ℹ️ ĐÂY LÀ HƯỚNG DẪN THÔNG THƯỜNG, KHÔNG CÓ DẤU HIỆU NGUY HIỂM VÀ ĐÃ ĐƯỢC HỆ THỐNG KIỂM TRA TỰ ĐỘNG.*

---

### CASE 2: YELLOW (Important - Quan trọng)

#### Example 2A: Routine Prenatal Follow-up
*   **Document Type:** Follow-up appointments, immunization records, routine lab results.
*   **Input Example:** *"Tên thai phụ: Lò Thị M. Tuổi thai: 28 tuần. Huyết áp: 120/80 mmHg. Kết quả siêu âm: thai phát triển bình thường. Hẹn tái khám sau 4 tuần (ngày 20/7/2026). Nhớ mang theo sổ khám thai. Bổ sung sắt và canxi theo đơn kèm theo."*

#### AI Processing Triage:
| Step | Result | Justification |
| :--- | :--- | :--- |
| **Classification** | **YELLOW (VÀNG)** | Contains a critical future appointment and medical management routine. |
| **Confidence** | **98%** | Printed document with clear layout. |
| **Approval** | **Midwife Verified** | Routed to the midwife's dashboard for verification. |

#### Midwife-Approved Output:
> ### 📅 VIỆC CẦN LÀM TRONG 4 TUẦN TỚI
> - [ ] **Bước 1:** Uống 1 viên sắt và 1 viên canxi đều đặn mỗi ngày.
> - [ ] **Bước 2:** Đến ngày **20/07/2026**, chuẩn bị đi tái khám.
> - [ ] **Bước 3:** Nhớ mang theo sổ khám thai khi đi khám.
> 
> **👩‍⚕️ LƯU Ý TỪ NỮ HỘ SINH TRẠM Y TẾ:**
> *"Mẹ nên uống thuốc sắt trước bữa ăn để cơ thể hấp thu tốt nhất. Nếu mẹ thấy có các biểu hiện lạ như đau đầu dữ dội hoặc bị phù chân, hãy báo ngay cho trạm y tế xã."*

#### Example 2B: Specialized Medication (Antibiotics)
*   **Document Type:** Specialized medical prescriptions, antibiotics, targeted therapies.
*   **Input Example:** *"Amoxicillin 500mg: uống mỗi 8 giờ, 1 viên/lần, trong 5 ngày. Paracetamol 500mg: uống 1 viên khi sốt trên 38.5°C. Uống nhiều nước, nghỉ ngơi."*

#### AI Processing Triage:
| Step | Result | Justification |
| :--- | :--- | :--- |
| **Classification** | **YELLOW (VÀNG)** | Requires exact dosing intervals for an antibiotic regime. |
| **Confidence** | **85%** | Moderate confidence due to handwritten text elements on the prescription. |
| **Approval** | **Midwife Verified** | Sent to a midwife to review handwriting extraction accuracy. |

#### Midwife-Corrected & Approved Output:
> ### 💊 HƯỚNG DẪN UỐNG THUỐC ĐIỀU TRỊ
> - [ ] **Bước 1:** Uống 1 viên **Amoxicillin 500mg** mỗi 8 tiếng (chia đều Sáng - Trưa - Tối), uống liên tục trong 5 ngày và không được bỏ cữ.
> - [ ] **Bước 2:** Chỉ uống 1 viên **Paracetamol 500mg** khi cơ thể sốt cao trên 38.5°C.
> - [ ] **Bước 3:** Uống thật nhiều nước trong ngày và nghỉ ngơi tại nhà.
> 
> **👩‍⚕️ LƯU Ý TỪ NỮ HỘ SINH TRẠM Y TẾ:**
> *"Thuốc kháng sinh Amoxicillin bắt buộc phải uống đúng giờ, đủ liều, tuyệt đối không tự ý ngừng thuốc dù đã hết triệu chứng. Nếu xuất hiện dấu hiệu nổi mẩn đỏ trên da hoặc cảm thấy khó thở, hãy dừng uống và liên hệ trạm y tế ngay lập tức."*

---

### CASE 3: RED (Emergency - Cấp cứu)
*   **Document Type:** Discharge summaries with warning criteria, ER logs, critical post-op tracking.
*   **Input Example:** *"HƯỚNG DẪN CHĂM SÓC SAU SINH - Theo dõi tình trạng vàng da của trẻ: Nếu vàng da xuất hiện trong 24 giờ đầu sau sinh, hoặc vàng da lan đến lòng bàn tay, bàn chân, hoặc trẻ bỏ bú, ngủ li bì, khó đánh thức, cần đưa trẻ đến bệnh viện nhi ngay. Theo dõi sức khỏe của mẹ: Nếu sốt trên 38.5°C kèm ớn lạnh, hoặc lượng máu ra nhiều hơn kỳ kinh, hoặc sản dịch có mùi hôi, cần khám ngay. Uống sắt 1 viên/ngày. Tái khám sau 2 tuần."*

#### AI Processing Triage:
| Step | Result | Justification |
| :--- | :--- | :--- |
| **Classification** | **RED (ĐỎ)** | **6 Danger Signs Detected:** Neonatal jaundice within 24 hours, jaundice extending to extremities, poor feeding, lethargy, maternal fever $\ge 38.5^\circ	ext{C}$ with chills, and postpartum hemorrhage. |
| **Confidence** | **95%** | Printed text, highly structured phrases. |
| **Approval** | **Doctor (Mandatory)** | Instant triage to Doctor Dashboard. |

#### Phase 1: Immediate Temporary First-Aid Guidance (Sent Automatically by AI)
> ### 🚨 [CẢNH BÁO NGUY HIỂM] PHẢI ĐƯA ĐẾN BỆNH VIỆN NGAY LẬP TỨC
> 
> **MẸ CẦN CHÚ Ý CÁC DẤU HIỆU SAU:**
> - [ ] Sốt cao trên 38.5°C kèm theo cảm giác ớn lạnh.
> - [ ] Ra máu âm đạo nhiều hơn một kỳ kinh bình thường hoặc có cục máu đông lớn.
> - [ ] Sản dịch tiết ra có mùi hôi khó chịu.
> 
> **BÉ CẦN CHÚ Ý CÁC DẤU HIỆU SAU:**
> - [ ] Bị vàng da trong vòng 24 giờ đầu tiên sau khi sinh.
> - [ ] Vàng da lan rộng xuống tận lòng bàn tay và lòng bàn chân.
> - [ ] Bé bỏ bú hoàn toàn.
> - [ ] Bé ngủ li bì, mê mệt, rất khó để đánh thức.
> 
> ---
> 
> ### 🛑 HƯỚNG DẪN TẠM THỜI (HỖ TRỢ BAN ĐẦU)
> - [ ] **Bước 1:** Cởi bớt quần áo, tã lót để làm mát cơ thể cho trẻ (nếu trẻ đang bị sốt).
> - [ ] **Bước 2:** Theo dõi sát sao nhiệt độ, màu sắc da và tình trạng bú của bé từng giờ.
> - [ ] **Bước 3:** Chuẩn bị sẵn sàng các giấy tờ tùy thân, sổ khám bệnh để di chuyển ra viện.
> - [ ] **Bước 4:** Tiếp tục uống 1 viên thuốc sắt mỗi ngày.
> 
> *⚠️ ĐÂY LÀ HƯỚNG DẪN TẠM THỜI ĐỂ ĐẢM BẢO AN TOÀN TRONG KHI CHỜ ĐỢI. BÁC SĨ CHUYÊN KHOA ĐÃ ĐƯỢC HỆ THỐNG THÔNG BÁO VÀ SẼ CUNG CẤP HƯỚNG DẪN CHÍNH THỨC CHO MẸ TRONG VÀI PHÚT TỚI.*

#### Phase 2: Official Doctor-Approved & Tailored Output
*(After doctor logs in, checks the case, edits instructions, and clicks submit)*

> ### 🚨 DẤU HIỆU NGUY HIỂM - PHẢI ĐI VIỆN NGAY TỨC KHẮC:
> 1. Trẻ bị vàng da trong 24h đầu, hoặc vàng da lan sâu xuống tận lòng bàn tay/bàn chân.
> 2. Trẻ có dấu hiệu bỏ bú, ngủ li bì, khó đánh thức.
> 3. Mẹ bị sốt cao $\ge 38.5^\circ	ext{C}$ hoặc có hiện tượng băng huyết (ra máu nhiều).
> 
> ### 📋 VIỆC CẦN LÀM THEO CHỈ ĐỊNH:
> - [ ] **Bước 1:** Mẹ uống 1 viên thuốc sắt vào mỗi buổi sáng (sau khi ăn no).
> - [ ] **Bước 2:** Đưa bé đi tái khám định kỳ tại khoa Nhi sau đúng 2 tuần.
> 
> **👨‍⚕️ CHỈ ĐỊNH CHUYÊN KHOA TỪ BÁC SĨ:**
> 1. Hãy đưa bé đến ngay bệnh viện nhi gần nhất nếu phát hiện bất kỳ biểu hiện vàng da tăng dần hoặc bé có xu hướng bỏ bú.
> 2. Hãy gọi ngay cho trạm y tế qua số điện thoại khẩn cấp: **0XXX-XXX-XXX** nếu mẹ thấy ra nhiều máu âm đạo.
> 3. Tuyệt đối không tự ý cho bé uống bất kỳ loại thuốc hay thảo dược nào khi chưa có sự đồng ý và chỉ định trực tiếp từ bác sĩ.
> 
> *✅ ĐÂY LÀ HƯỚNG DẪN Y TẾ CHÍNH THỨC ĐÃ ĐƯỢC BÁC SĨ CHUYÊN KHOA KIỂM TRA VÀ PHÊ DUYỆT.*
VITEM_Framework_Script.md
Đang hiển thị VITEM_Framework_Script.md.
