import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotify } from "../../../context/NotificationContext";
import {
  FaRobot,
  FaArrowLeft,
  FaPaperPlane,
  FaExclamationTriangle,
  FaPlus,
  FaHistory,
  FaChevronLeft,
  FaCloudUploadAlt,
  FaTrash,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import "./AIChat.css";

const INITIAL_MESSAGE = {
  sender: "ai",
  text: "Hello! I'm your Heal Connect AI Assistant. How can I help you today?",
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
    } catch {
      return [INITIAL_MESSAGE];
    }
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [triageResult, setTriageResult] = useState(() => {
    try {
      const saved = localStorage.getItem("healconnect_ai_triage");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState(null);

  // Sidebar + session tracking
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pastSessions, setPastSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(
    () => localStorage.getItem("healconnect_session_id") || null,
  );
  const [saveStatus, setSaveStatus] = useState("idle");

  // Get current patient ID from localStorage auth
  const getPatientId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.id || user.email || "demo-patient";
    } catch {
      return "demo-patient";
    }
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

  // Load past sessions
  const patientId = getPatientId();

  useEffect(() => {
    fetchPastSessions();
  }, [patientId]);

  const fetchPastSessions = async () => {
    if (!patientId) return;
    setIsLoadingSessions(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/chat/sessions/${encodeURIComponent(patientId)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setPastSessions(data);

        // Auto-restore last session
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

  const autoSaveSession = async (updatedMessages, updatedTriageResult, sessionId) => {
    try {
      setSaveStatus("saving");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const patientId = getPatientId();
      
      // Find original createdAt if it exists in the first message metadata or passed in
      const existingCreatedAt = updatedMessages[0]?.createdAt;

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
          sessionId,
          createdAt: existingCreatedAt // Preserve original timestamp
        }),
      });
      if (!response.ok) throw new Error("Save failed");
      const data = await response.json();
      if (data.isNew) {
        setCurrentSessionId(data.sessionId);
        localStorage.setItem("healconnect_session_id", data.sessionId);
      }
      setSaveStatus("saved");
      fetchPastSessions();
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation(); // Prevent loading the session when clicking delete
    
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    try {
      const patientId = getPatientId();
      const response = await fetch(
        `http://localhost:5000/api/chat/session/${encodeURIComponent(patientId)}/${encodeURIComponent(sessionId)}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        notify("Chat deleted successfully", "success");
        // If we deleted the current active session, reset chat
        if (sessionId === currentSessionId) {
          clearChat();
        }
        fetchPastSessions();
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error("Delete session failed:", err);
      notify("Failed to delete chat", "error");
    }
  };

  const loadSession = (session) => {
    if (window.confirm(`Load session? This will replace your current chat.`)) {
      setMessages(session.messages);
      setTriageResult(session.triageResult || null);
      setCurrentSessionId(session.sessionId);
      localStorage.setItem("healconnect_session_id", session.sessionId);
      setError(null);
      if (window.innerWidth < 768) setSidebarOpen(false);
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
    // New tag-based regex for URGENCY=..., SPECIALTY=..., RECOMMENDATION=...
    const regex = /URGENCY=(.*?)\s+SPECIALTY=(.*?)\s+RECOMMENDATION=(.*)/i;
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
      return {
        urgency: "EMERGENCY",
        specialty: "General Medicine",
        recommendation: "Seek immediate medical attention.",
      };
    }
    if (lowerText.includes("consult") || lowerText.includes("doctor")) {
      return {
        urgency: "CONSULT",
        specialty: "General Medicine",
        recommendation: "Please consult with a healthcare professional.",
      };
    }
    return {
      urgency: "SELF_CARE",
      specialty: "Home Care",
      recommendation: "Monitor symptoms. See a doctor if they worsen.",
    };
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
    try {
      // Simplified prompt as backend SYSTEM_PROMPT now handles strict verticality and formatting
      const prompt = `Medical Triage Request: ${input}`;
      
      const aiText = await analyzeWithBedrock(prompt);
      
      if (aiText) {
        const result = parseTriageData(aiText);
        setTriageResult(result);
        
        let chatBody = aiText.split(/TRIAGE_DATA:/i)[0].trim();
        
        // Safety Filter: Remove any accidental markdown tables or pipes that break layout
        chatBody = chatBody.replace(/\|/g, "").replace(/---/g, "");
        
        const aiMessage = { 
          sender: "ai", 
          text: chatBody,
          createdAt: new Date().toISOString() 
        };
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        
        // Auto-save to DynamoDB silently (ChatGPT-style)
        autoSaveSession(finalMessages, result, currentSessionId);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError("Failed to get response from AI. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "EMERGENCY": return "#ef4444";
      case "CONSULT": return "#f59e0b";
      default: return "#10a37f";
    }
  };

  const formatSessionDate = (isoString) => {
    if (!isoString) return "Recent";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Recent"; // Fallback for invalid dates
    return date.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short"
    });
  };

  return (
    <div className="ai-chat-page">
      {/* Sidebar (ChatGPT Style) */}
      <div className={`chat-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h3><FaRobot /> New Chat</h3>}
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
              {isLoadingSessions && <p style={{color: '#888', padding: '1rem'}}>Loading history…</p>}
              {!isLoadingSessions && pastSessions.length === 0 && (
                <p style={{color: '#888', padding: '1rem', fontSize: '0.85rem'}}>No past conversations found.</p>
              )}
              {pastSessions.map((session) => (
                <button
                  key={session.sk}
                  className={`session-item ${session.sessionId === currentSessionId ? 'active' : ''}`}
                  onClick={() => loadSession(session)}
                >
                  <div className="session-info">
                    <div className="session-title">{session.sessionTitle}</div>
                    <div className="session-date">{formatSessionDate(session.createdAt)}</div>
                  </div>
                  <button 
                    className="delete-session-btn" 
                    onClick={(e) => deleteSession(e, session.sessionId)}
                    title="Delete Chat"
                  >
                    <FaTrash />
                  </button>
                </button>
              ))}
            </div>
            
            <div className="sidebar-footer">
              <button className="exit-btn" onClick={() => navigate("/dashboard/patient")}>
                <FaArrowLeft /> Exit to Dashboard
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="ai-chat-container">
        
        {!sidebarOpen && (
          <div className="chat-header">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>
              <FaChevronLeft style={{ transform: "rotate(180deg)" }} />
            </button>
            <div style={{fontWeight: 500, fontSize: "0.95rem"}}>HealAssist AI</div>
            <div style={{width: '24px'}}></div>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-icon">
                {msg.sender === "ai" ? <FaRobot size={18} /> : "U"}
              </div>
              <div className="ai-message-bubble">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h3 className="ai-section" {...props} />,
                    h2: ({ node, ...props }) => <h3 className="ai-section" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="ai-section" {...props} />,
                    p: ({ node, ...props }) => <p className="ai-paragraph" {...props} />,
                    ul: ({ node, ...props }) => <ul className="ai-list" {...props} />,
                    ol: ({ node, ...props }) => <ol className="ai-list" {...props} />,
                    li: ({ node, ...props }) => <li className="ai-list-item" {...props} />,
                    table: () => null,
                    thead: () => null,
                    tbody: () => null,
                    tr: () => null,
                    td: () => null,
                    th: () => null,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message ai">
              <div className="message-icon">
                <FaRobot size={18} />
              </div>
              <div className="ai-message-bubble">
                <div style={{display: 'flex', gap: '4px', padding: '6px 0'}}>
                   <div style={{width: 6, height: 6, background: '#888', borderRadius: '50%', animation: 'pulse 1.5s infinite'}} />
                   <div style={{width: 6, height: 6, background: '#888', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.2s'}} />
                   <div style={{width: 6, height: 6, background: '#888', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.4s'}} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="chat-input">
            <input
              type="text"
              placeholder="Message Heal Connect AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isTyping}
            />
            <button onClick={handleSend} disabled={!input.trim() || isTyping}>
              <FaPaperPlane size={14} />
            </button>
          </div>
          <div style={{textAlign: "center", fontSize: "0.75rem", color: "#888", marginTop: "0.5rem"}}>
             AI can make mistakes. Check important medical info.
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AIChat;
