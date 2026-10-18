import express from "express";

const router = express.Router();

const collegeKnowledge = `
College name: Maa Maturani Devi Pharmacy College.
Managed by: Maa Maturani Devi Shikshan Sansthan.
Established: 2018.
Location context: The college website describes the institution as being in Ballia, Uttar Pradesh.
Focus: Quality education in pharmaceutical sciences and health sciences.
Website sections available: About, Admission Application, Courses, Contact, and enquiry.
Courses shown on the website include B.Pharm, D.Pharm, B.Ed, B.El.Ed, D.El.Ed, BA, ANM, and JNAM pages. Availability and current admission status must be confirmed with the college.
Admission: Students should complete the admission enquiry/application form and confirm eligibility, documents, fee, seat availability, and dates directly with the college.
Fees: The chatbot must not guess fees. Ask students to contact the college or use the official admission/contact page for the latest fee structure.
Faculty, placements, phone number, email, exact address, approvals, affiliation and current dates: provide only if verified from current official college information. Do not invent.
`;

const faq = [
  {
    keys: ["college name", "name of college", "कॉलेज का नाम", "कॉलेज का नाम क्या"],
    answer: "आपकी वेबसाइट के अनुसार कॉलेज का नाम Maa Maturani Devi Pharmacy College है।"
  },
  {
    keys: ["established", "establishment", "कब बना", "स्थापना", "कब स्थापित"],
    answer: "कॉलेज की वेबसाइट के About section के अनुसार, Maa Maturani Devi Pharmacy College की स्थापना 2018 में हुई थी।"
  },
  {
    keys: ["managed", "management", "संचालित", "किसके द्वारा"],
    answer: "कॉलेज की वेबसाइट के अनुसार यह Maa Maturani Devi Shikshan Sansthan द्वारा संचालित है।"
  },
  {
    keys: ["course", "courses", "कोर्स", "पाठ्यक्रम", "branch", "degree"],
    answer: "वेबसाइट पर B.Pharm, D.Pharm, B.Ed, B.El.Ed, D.El.Ed, BA, ANM और JNAM से जुड़े पेज मौजूद हैं। सभी कोर्स की वर्तमान उपलब्धता, पात्रता और मान्यता कॉलेज से पुष्टि करें।"
  },
  {
    keys: ["admission", "apply", "प्रवेश", "एडमिशन", "आवेदन"],
    answer: "Admission के लिए वेबसाइट के Admission page पर आवेदन/ enquiry form देखें। पात्रता, आवश्यक दस्तावेज़, सीट उपलब्धता और अंतिम तारीख कॉलेज से confirm करें।"
  },
  {
    keys: ["fee", "fees", "फीस", "शुल्क", "कितना पैसा"],
    answer: "मेरे पास वर्तमान verified fee structure उपलब्ध नहीं है, इसलिए मैं फीस का अनुमान नहीं लगाऊँगा। कृपया कॉलेज के Admission या Contact section से latest fees confirm करें।"
  },
  {
    keys: ["address", "location", "where", "पता", "कहां", "कहाँ", "लोकेशन"],
    answer: "वेबसाइट कॉलेज को Ballia, Uttar Pradesh से संबंधित बताती है। जाने से पहले आधिकारिक Contact page से पूरा पता और directions confirm करें।"
  },
  {
    keys: ["contact", "phone", "email", "संपर्क", "मोबाइल", "नंबर", "फोन"],
    answer: "कृपया वेबसाइट के Contact page को खोलें। मैं कोई अपुष्ट फोन नंबर या ईमेल नहीं बताऊँगा।"
  },
  {
    keys: ["faculty", "teacher", "फैकल्टी", "शिक्षक"],
    answer: "Faculty की verified और current जानकारी के लिए कॉलेज की Faculty section या official Contact page देखें।"
  },
  {
    keys: ["placement", "job", "प्लेसमेंट", "नौकरी"],
    answer: "मेरे पास current verified placement statistics नहीं हैं। Placement records, recruiters और job assistance के बारे में कॉलेज से सीधे पुष्टि करें।"
  },
  {
    keys: ["documents", "document", "दस्तावेज", "कागजात"],
    answer: "Admission के लिए सामान्यतः qualifying exam marksheets, पहचान पत्र, फोटो और आवश्यक certificates मांगे जा सकते हैं। Exact document list अपने course और admission year के लिए कॉलेज से confirm करें।"
  },
  {
    keys: ["hello", "hi", "hey", "नमस्ते", "हेलो", "नमस्कार"],
    answer: "नमस्ते! मैं College AI Assistant हूँ। आप courses, admission, fees, college details या पढ़ाई से जुड़ा सवाल पूछ सकते हैं।"
  }
];

function localAnswer(message) {
  const q = message.toLowerCase().normalize("NFKC");
  for (const item of faq) {
    if (item.keys.some((key) => q.includes(key.toLowerCase()))) return item.answer;
  }
  if (/(who are you|your name|तुम कौन|आप कौन)/i.test(q)) {
    return "मैं आपकी वेबसाइट का College AI Assistant हूँ। मैं कॉलेज की उपलब्ध जानकारी और सामान्य पढ़ाई/टेक्नोलॉजी के सवालों में मदद करता हूँ।";
  }
if (/(javascript|python|mern|react|node\.?js|mongodb|html|css|programming|coding|artificial intelligence|ai kya)/i.test(q)) {
  return "मैं इस विषय में मदद कर सकता हूँ। अपना सवाल थोड़ा specific लिखें—जैसे definition, example, code या step-by-step explanation।";
}
  return "मुझे इस सवाल का verified जवाब अभी उपलब्ध जानकारी में नहीं मिला। कृपया अपना सवाल दूसरे तरीके से पूछें या कॉलेज के official Contact/Admission page से पुष्टि करें। मैं फीस, dates, phone numbers या approvals का अनुमान नहीं लगाता।";
}

router.post("/chat", async (req, res) => {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message) return res.status(400).json({ success: false, message: "Please enter a message." });
    if (message.length > 2000) return res.status(400).json({ success: false, message: "Message is too long. Please keep it under 2000 characters." });

    // Optional OpenAI-compatible API. Without credentials, verified local FAQ answers still work.
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = process.env.AI_MODEL || "gpt-4o-mini";

    if (apiKey) {
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            temperature: 0.3,
            messages: [
              { role: "system", content: `You are the helpful assistant for the Maa Maturani Devi Pharmacy College website. Answer in the language used by the user (Hindi, Hinglish, or English). Help with general knowledge, study, coding, and college questions. Use this college knowledge only as the source for college-specific facts: ${collegeKnowledge}. Never invent fees, contact details, admission dates, approvals, affiliation, placement statistics or policies. If not present, say it is not verified and direct the user to the official Contact/Admission section. Keep answers clear and concise.` },
              { role: "user", content: message }
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          const answer = data?.choices?.[0]?.message?.content?.trim();
          if (answer) return res.json({ success: true, answer, mode: "ai" });
        }
      } catch (error) {
        console.error("AI provider request failed:", error.message);
      }
    }

    return res.json({ success: true, answer: localAnswer(message), mode: "knowledge-base" });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({ success: false, message: "Chat assistant is temporarily unavailable." });
  }
});

export default router;
