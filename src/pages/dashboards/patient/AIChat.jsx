import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../../../context/NotificationContext";
import {
  FaRobot,
  FaUser,
  FaArrowLeft,
  FaPaperPlane,
  FaExclamationTriangle,
  FaPlus,
  FaHistory,
  FaChevronLeft,
  FaCloudUploadAlt,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import "./AIChat.css";

const INITIAL_MESSAGE = {
  sender: "ai",
  text: "Welcome to the Heal Connect Clinical Assistant. I am here to provide a professional preliminary assessment of your symptoms and guide you toward the appropriate care. Please describe your symptoms or health concerns to begin.",
};

const AIChat = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const { notify } = useNotify();

  // Local chat state
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("healconnect_ai_chat");
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
    } catch { return [INITIAL_MESSAGE]; }
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [triageResult, setTriageResult] = useState(() => {
    try {
      const saved = localStorage.getItem("healconnect_ai_triage");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [error, setError] = useState(null);

  // Sidebar + session tracking
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pastSessions, setPastSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(() =>
    localStorage.getItem("healconnect_session_id") || null
  );
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error

  // Get current patient ID from localStorage auth
  const getPatientId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.id || user.email || "demo-patient";
    } catch { return "demo-patient"; }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Persist current chat to localStorage
  useEffect(() => {
    localStorage.setItem("healconnect_ai_chat", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (triageResult) {
      localStorage.setItem("healconnect_ai_triage", JSON.stringify(triageResult));
    } else {
      localStorage.removeItem("healconnect_ai_triage");
    }
  }, [triageResult]);

  // Load past sessions from DynamoDB on mount or when patient changes
  const patientId = getPatientId();
  
  useEffect(() => {
    fetchPastSessions();
  }, [patientId]);

  const fetchPastSessions = async () => {
    if (!patientId) return;
    setIsLoadingSessions(true);
    try {
      const response = await fetch(`http://localhost:5000/api/chat/sessions/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        setPastSessions(data);
        
        // Auto-restore last session if we are in a fresh empty state
        if (data.length > 0 && messages.length <= 1) {
          const latest = data[0];
          setMessages(latest.messages);
          setTriageResult(latest.triageResult || null);
          setCurrentSessionId(latest.sessionId);
          localStorage.setItem("healconnect_session_id", latest.sessionId);
        }
      }
    } catch (err) {
      console.error("Fetch past sessions failed:", err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Auto-save silently after every AI reply (like ChatGPT)
  const autoSaveSession = async (updatedMessages, updatedTriageResult, sessionId) => {
    try {
      setSaveStatus("saving");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const patientId = getPatientId();
      const response = await fetch("http://localhost:5000/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          patientName: user.name || patientId,
          age: user.age,
          village: user.village,
          messages: updatedMessages,
          triageResult: updatedTriageResult,
          sessionId, // reuse same ID to update, not create new
        }),
      });
      if (!response.ok) throw new Error("Save failed");
      const data = await response.json();
      // If this was a brand new session, store the assigned ID
      if (data.isNew) {
        setCurrentSessionId(data.sessionId);
        localStorage.setItem("healconnect_session_id", data.sessionId);
      }
      setSaveStatus("saved");
      // Refresh sidebar unobtrusively
      fetchPastSessions();
      // Reset icon back after 2s
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const loadSession = (session) => {
    if (window.confirm(`Load session? This will replace your current chat.`)) {
      setMessages(session.messages);
      setTriageResult(session.triageResult || null);
      setCurrentSessionId(session.sessionId);
      localStorage.setItem("healconnect_session_id", session.sessionId);
      setError(null);
    }
  };

  const clearChat = () => {
    if (window.confirm("Start a new chat? This will begin a fresh session.")) {
      setMessages([INITIAL_MESSAGE]);
      setTriageResult(null);
      setCurrentSessionId(null);
      localStorage.removeItem("healconnect_session_id");
      setError(null);
    }
  };

  const analyzeWithBedrock = async (userInput) => {
    try {
      const response = await fetch("http://localhost:5000/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userInput }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
      const data = await response.json();
      return data.content;
    } catch (err) {
      setError(`Could not connect to Heal Connect AI Server. Details: ${err.message}`);
      return null;
    }
  };

  const parseTriageData = (text) => {
    const regex = /\[?TRIAGE_DATA:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]?/i;
    const match = text.match(regex);
    if (match) {
      return {
        urgency: match[1].trim().toUpperCase(),
        specialty: match[2].trim(),
        recommendation: match[3].trim(),
      };
    }
    const lowerText = text.toLowerCase();
    if (lowerText.includes("emergency") || lowerText.includes("immediate")) {
      return { urgency: "EMERGENCY", specialty: "General Medicine", recommendation: "Seek immediate medical attention." };
    }
    if (lowerText.includes("consult") || lowerText.includes("doctor")) {
      return { urgency: "CONSULT", specialty: "General Medicine", recommendation: "Please consult with a healthcare professional." };
    }
    return { urgency: "SELF_CARE", specialty: "Home Care", recommendation: "Monitor symptoms. See a doctor if they worsen." };
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage = { sender: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setError(null);
    const userInput = input;

    const aiText = await analyzeWithBedrock(userInput);
    if (aiText) {
      const result = parseTriageData(aiText);
      setTriageResult(result);
      notify(`AI Triage Complete: ${result.urgency}`, result.urgency === "EMERGENCY" ? "error" : "success");
      const chatBody = aiText.split(/\[?TRIAGE_DATA:/i)[0].trim();
      const aiMessage = { sender: "ai", text: chatBody };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      // Auto-save to DynamoDB silently (ChatGPT-style)
      autoSaveSession(finalMessages, result, currentSessionId);
    }
    setIsTyping(false);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "EMERGENCY": return "#ef4444";
      case "CONSULT": return "#f59e0b";
      default: return "var(--primary)";
    }
  };

  const formatSessionDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="ai-chat-page">
      {/* Sidebar */}
      <div className={`chat-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h3><FaHistory /> Chat History</h3>}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaChevronLeft style={{ transform: sidebarOpen ? "none" : "rotate(180deg)", transition: "0.3s" }} />
          </button>
        </div>

        {sidebarOpen && (
          <>
            <button className="sidebar-new-chat-btn" onClick={clearChat}>
              <FaPlus /> New Chat
            </button>

            <div className="sidebar-sessions">
              {isLoadingSessions && <p className="sidebar-loading">Loading history…</p>}
              {!isLoadingSessions && pastSessions.length === 0 && (
                <p className="sidebar-empty">No saved sessions yet.<br/>Save a chat to see it here.</p>
              )}
              {pastSessions.map((session) => (
                <button
                  key={session.sk}
                  className="session-item"
                  onClick={() => loadSession(session)}
                >
                  <span className="session-title">{session.sessionTitle}</span>
                  <span className="session-date">{formatSessionDate(session.createdAt)}</span>
                  {session.triageResult && (
                    <span className="session-urgency-pill" style={{ background: getUrgencyColor(session.triageResult.urgency) }}>
                      {session.triageResult.urgency}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="ai-chat-container animate-fade-in">
        <div className="chat-header glass-nav">
          <div className="header-left">
            <button onClick={() => navigate("/dashboard/patient")} className="chat-back-btn">
              <FaArrowLeft />
            </button>
            <div className="header-info">
              <h2>HealAssist AI (AWS Bedrock)</h2>
              <span className="status-indicator">Cloud Engine Active</span>
            </div>
          </div>
          <div className="header-actions">
            <div className={`cloud-save-status ${saveStatus}`}>
              <FaCloudUploadAlt />
              <span>
                {saveStatus === "saving" && "Saving…"}
                {saveStatus === "saved" && "Saved ✓"}
                {saveStatus === "error" && "Save failed"}
                {saveStatus === "idle" && (currentSessionId ? "Auto-saved" : "Not saved")}
              </span>
            </div>
            <button className="header-action-btn new-chat-btn" onClick={clearChat}>
              <FaPlus /> New Chat
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender} animate-fade-in`}>
              <div className="message-icon">
                {msg.sender === "ai" ? <FaRobot /> : <FaUser />}
              </div>
              <div className="message-bubble glass-card">
                {msg.sender === "ai" ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message ai typing">
              <div className="message-icon"><FaRobot /></div>
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
          <div ref={messagesEndRef} />
        </div>

        {triageResult && !isTyping && (
          <div className={`triage-result glass-card urgency-${triageResult.urgency.toLowerCase()}`}>
            <div className="triage-header">
              <h3>Diagnostic Summary</h3>
              <span className="urgency-badge">
                {triageResult.urgency}
              </span>
            </div>
            
            <div className="triage-content">
              <div className="recommendation-section">
                <span className="label">Recommendation:</span>
                <p className="text">{triageResult.recommendation}</p>
              </div>

              {triageResult.urgency !== "SELF_CARE" && (
                <button 
                  className="btn-primary" 
                  onClick={() => navigate("/dashboard/patient/book", { 
                    state: { 
                      triageData: {
                        specialty: triageResult.specialty,
                        urgency: triageResult.urgency,
                        recommendation: triageResult.recommendation
                      }
                    } 
                  })}
                >
                  Consult with {triageResult.specialty}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="chat-input glass-card">
          <input
            type="text"
            placeholder="Describe symptoms to HealAssist AI…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} disabled={!input.trim() || isTyping}>
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
