import express from 'express';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const router = express.Router();

const region = process.env.VITE_AWS_REGION || "us-east-1";
console.log("AWS Config Loader:", { 
  region: process.env.VITE_AWS_REGION,
  hasAccessKey: !!process.env.VITE_AWS_ACCESS_KEY_ID, 
  hasSecretKey: !!process.env.VITE_AWS_SECRET_ACCESS_KEY 
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

const BEDROCK_MODEL_ID = process.env.VITE_BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";

const SYSTEM_PROMPT = `You are the Heal Connect AI Clinical Assistant, a specialized medical triage expert. 
    Amazon Nova 2 Lite powers your reasoning to provide evidence-based preliminary assessments.
    
    RESPONSE STRUCTURE:
    - **Clinical Assessment**: Briefly summarize the potential causes in a professional medical tone.
    - **Triage Priority**: Clearly state the urgency level (EMERGENCY, CONSULT, or SELF_CARE).
    - **Actionable Steps**: Provide specific, bulleted actions for the user.
    - **Red Flags**: Explicitly list symptoms that require immediate emergency attention.
    - **Next Steps**: Advise on relevant clinical specialty and follow-up.
    - **Disclaimer**: "This assessment is for informational purposes and is not a substitute for professional medical advice."
    
    CAPABILITIES:
    - You are bilingual (English/Hindi). Respond ONLY in original language of the user.
    
    CLINICAL RULES:
    1. Maintain a high-quality, professional, and empathetic clinical tone.
    2. Suggest a specialty (e.g., Cardiology, Pediatrics, General Medicine).
    3. **NO HALLUCINATIONS**: If unsure, ask for more symptoms or recommend a general checkup.
    
    FORMAT YOUR RESPONSE TO END WITH THIS EXACT DATA BLOCK:
    [TRIAGE_DATA: URGENCY | SPECIALTY | RECOMMENDATION]`;

router.post('/triage', async (req, res) => {
  const { text: userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: 'Text input is required' });
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
            content: [{ text: userInput }]
          }
        ],
        inferenceConfig: {
          max_new_tokens: 1000,
          temperature: 0.5,
        }
      }),
    };

    const command = new InvokeModelCommand(input);
    const response = await bedrockClient.send(command);
    const output = JSON.parse(new TextDecoder().decode(response.body));
    
    const content = output.output.message.content[0].text;
    res.json({ content });
  } catch (err) {
    console.error("Bedrock Error:", err);
    res.status(500).json({ error: 'Failed to process AI triage', details: err.message });
  }
});

export default router;
