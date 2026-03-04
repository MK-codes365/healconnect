import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../../../context/NotificationContext";
import {
  FaRobot,
  FaUser,
  FaArrowLeft,
  FaPaperPlane,
  FaExclamationTriangle,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { triageRules } from "../../../data/mockData";
import { bedrockClient, BEDROCK_MODEL_ID } from "../../../utils/aws-config";
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import "./AIChat.css";

const AIChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Welcome to the Heal Connect Clinical Assistant. I am here to provide a professional preliminary assessment of your symptoms and guide you toward the appropriate care. Please describe your symptoms or health concerns to begin.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [error, setError] = useState(null);
  const { notify } = useNotify();

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

  const analyzeWithBedrock = async (userInput) => {
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
      console.log("Bedrock (Nova) Output:", content);
      return content;
    } catch (err) {
      console.error("Bedrock Error Details:", err);
      setError(
        `Could not connect to AWS Bedrock (Nova). Details: ${err.message}`,
      );
      return null;
    }
  };

  const parseTriageData = (text) => {
    // Robust case-insensitive regex to handle variations in whitespace or missing brackets
    const regex = /\[?TRIAGE_DATA:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]?/i;
    const match = text.match(regex);

    if (match) {
      return {
        urgency: match[1].trim().toUpperCase(),
        specialty: match[2].trim(),
        recommendation: match[3].trim(),
      };
    }

    // Expanded fallback logic
    const lowerText = text.toLowerCase();
    if (
      lowerText.includes("emergency") ||
      lowerText.includes("immediate") ||
      lowerText.includes("urgent")
    ) {
      return {
        urgency: "EMERGENCY",
        specialty: "General Medicine",
        recommendation: "Seek immediate medical attention.",
      };
    }
    if (
      lowerText.includes("consult") ||
      lowerText.includes("doctor") ||
      lowerText.includes("visit")
    ) {
      return {
        urgency: "CONSULT",
        specialty: "General Medicine",
        recommendation: "Please consult with a healthcare professional.",
      };
    }

    return {
      urgency: "SELF_CARE",
      specialty: "Home Care",
      recommendation:
        "Monitor symptoms and rest. If they worsen, see a doctor.",
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setError(null);

    const aiText = await analyzeWithBedrock(input);

    if (aiText) {
      const result = parseTriageData(aiText);
      setTriageResult(result);
      
      notify(`AI Triage Complete: Urgency set to ${result.urgency}`, result.urgency === 'EMERGENCY' ? 'error' : 'success');

      // Case-insensitive split to prevent data block from leaking into chat bubble
      const chatBody = aiText.split(/\[?TRIAGE_DATA:/i)[0].trim();
      const aiResponse = { sender: "ai", text: chatBody };
      setMessages((prev) => [...prev, aiResponse]);
    }
    setIsTyping(false);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "EMERGENCY":
        return "#ef4444";
      case "CONSULT":
        return "#f59e0b";
      default:
        return "var(--primary)";
    }
  };

  return (
    <div className="ai-chat-container animate-fade-in">
      <div className="chat-header glass-nav">
        <button
          onClick={() => navigate("/dashboard/patient")}
          className="back-btn"
        >
          <FaArrowLeft />
        </button>
        <div className="header-info">
          <h2>HealAssist AI (AWS Bedrock)</h2>
          <span className="status-indicator">Cloud Engine Active</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender} animate-fade-in`}>
            <div className="message-icon">
              {msg.sender === "ai" ? <FaRobot /> : <FaUser />}
            </div>
            <div className="message-bubble glass-card">
              {msg.sender === "ai" ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message ai typing">
            <div className="message-icon">
              <FaRobot />
            </div>
            <div className="message-bubble glass-card">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        {error && (
          <div className="error-banner glass-card">
            <FaExclamationTriangle /> {error}
          </div>
        )}
      </div>

      {triageResult && !isTyping && (
        <div
          className="triage-result glass-card"
          style={{
            borderLeft: `5px solid ${getUrgencyColor(triageResult.urgency)}`,
          }}
        >
          <h3>Diagnostic Summary</h3>
          <div
            className="urgency-badge"
            style={{ background: getUrgencyColor(triageResult.urgency) }}
          >
            {triageResult.urgency}
          </div>
          <p>
            <strong>Recommendation:</strong> {triageResult.recommendation}
          </p>
          {triageResult.urgency !== "SELF_CARE" && (
            <button
              className="btn-primary"
              onClick={() => navigate("/dashboard/patient/doctors")}
            >
              Consult with {triageResult.specialty}
            </button>
          )}
        </div>
      )}

      <div className="chat-input glass-card">
        <input
          type="text"
          placeholder="Describe symptoms to HealAssist AI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={!input.trim() || isTyping}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default AIChat;
