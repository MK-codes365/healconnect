import express from "express";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const router = express.Router();

/* ================= AWS CONFIG ================= */

const region = process.env.VITE_AWS_REGION || "us-east-1";

console.log("AWS Config Loader:", {
  region,
  hasAccessKey: !!process.env.VITE_AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.VITE_AWS_SECRET_ACCESS_KEY,
});

const bedrockClient = new BedrockRuntimeClient({
  region,
  ...(process.env.VITE_AWS_ACCESS_KEY_ID && process.env.VITE_AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

const BEDROCK_MODEL_ID =
  process.env.VITE_BEDROCK_MODEL_ID ||
  "anthropic.claude-3-haiku-20240307-v1:0";

/* ================= SYSTEM PROMPT ================= */

const SYSTEM_PROMPT = `
You are Heal Connect AI, a medical triage assistant designed to help patients understand symptoms.

-------------------------
DECISION LOGIC
-------------------------
1. DETECT INTENT: Determine if the user is sending a greeting (e.g., "hi", "hey", "hello") or describing a medical concern/symptom.
2. IF GREETING: 
   - Respond warmly and politely.
   - Ask if they are experiencing any specific symptoms or health concerns.
   - CRITICAL: DO NOT use any headings (###), clinical assessment blocks, or the TRIAGE_DATA block below.
3. IF MEDICAL CONCERN:
   - Perform clinical triage immediately using the STRICT RESPONSE FORMAT below.

-------------------------
EXAMPLES (FEW-SHOT)
-------------------------

User: "hey"
Response: "Hello! I am Heal Connect AI. How are you feeling today? Are you experiencing any symptoms or discomfort that you would like to discuss?"

User: "I have a sharp pain in my chest"
Response:
### 1. Clinical Assessment
The patient reports sharp chest pain, which is a potential emergency flag.

[... Rest of Triage Format ...]

TRIAGE_DATA
URGENCY=EMERGENCY
SPECIALTY=Cardiology / Emergency Medicine
RECOMMENDATION=Go to the nearest emergency room immediately.

-------------------------
STRICT RESPONSE FORMAT (FOR MEDICAL ONLY)
-------------------------

### 1. Clinical Assessment
Summarize symptoms and ask necessary follow-up questions.

### 2. Triage Priority
Status: EMERGENCY or CONSULT or SELF_CARE
Reasoning: Brief medical reasoning.

### 3. Actionable Steps
- List clear, vertical steps for the patient to follow.

### 4. Red Flags
- List specific warning signs related to the symptoms.

### 5. Suggested Specialty
Recommend a specific medical specialty or doctor type (e.g., General Medicine, Cardiology, Pediatrics, etc.).

### 6. Next Steps
Clear instruction on what to do now.

### 7. Disclaimer
Educational only. Not a substitute for professional medical advice.

-------------------------
END RESPONSE WITH (FOR MEDICAL ONLY)
-------------------------

TRIAGE_DATA
URGENCY=EMERGENCY or CONSULT or SELF_CARE
SPECIALTY=Appropriate Medical Specialty
RECOMMENDATION=Summary recommendation

-------------------------
STRICT RULES
-------------------------
- NO TABLES. NO "|" PIPES.
- RESPOND ONLY IN THE USER'S LANGUAGE (English/Hindi).
- BE CONCISE AND PROFESSIONAL.
`;

/* ================= TRIAGE ROUTE ================= */

router.post("/triage", async (req, res) => {
  const { text: userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({
      error: "Text input is required",
    });
  }

  try {
    const input = {
      modelId: BEDROCK_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        system: [{ text: SYSTEM_PROMPT }],
        messages: [
          {
            role: "user",
            content: [{ text: userInput }],
          },
        ],
        inferenceConfig: {
          max_new_tokens: 1000,
          temperature: 0.2, // Lower temp for smarter adherence
          topP: 0.9,
        },
      }),
    };

    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);

    const decoded = new TextDecoder().decode(response.body);
    const output = JSON.parse(decoded);

    let content = output.output.message.content[0].text || "";

    /* ===== Safety Cleanup (Prevent Markdown Tables) ===== */

    content = content.replace(/\|/g, "");
    content = content.replace(/---/g, "");

    res.json({ content });
  } catch (err) {
    console.error("Bedrock Error:", err);

    res.status(500).json({
      error: "Failed to process AI triage",
      details: err.message,
    });
  }
});

export default router;