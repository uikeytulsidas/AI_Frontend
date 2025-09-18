import { useState, useEffect, useRef } from "react";
import {
  analyzeCareer,
  getChats,
  createChat,
  getMessages,
  sendMessage,
} from "../api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../CSS/CareerForm.css";
import { Link, useNavigate } from "react-router-dom";

function CareerForm() {
  const [resumeText, setResumeText] = useState("");
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const navigate = useNavigate();
  const username = localStorage.getItem("user") || "Guest";

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch existing chats on mount
  const fetchChats = async () => {
    try {
      const res = await getChats();
      setChats(res.data || []);
    } catch (err) {
      console.error("Failed to load chats", err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // "New Chat" → frontend only (no API call)
  const handleNewChat = () => {
    setActiveChatId(null); // remove current chat context
    setMessages([]);       // clear chat window
    // Sidebar is untouched until first message creates a chat
  };

  // Select an existing chat
  const handleSelectChat = async (chatId) => {
    setActiveChatId(chatId);
    setMessages([]); // clear first to avoid mixing
    try {
      const res = await getMessages(chatId);
      const msgs = (res.data || []).map((m) => parseBackendMessage(m));
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  // Parse AI messages stored as JSON
    const parseBackendMessage = (msg) => {
    if (!msg) return msg;
    const parsed = { ...msg };
    if (typeof parsed.text === "string") {
      const t = parsed.text.trim();
      if (
        (t.startsWith("{") && t.endsWith("}")) ||
        (t.startsWith("[") && t.endsWith("]"))
      ) {
        try {
          parsed._parsed = JSON.parse(t);
        } catch {}
      }
    }
    return parsed;
  };   // ✅ close here

 


const isGuest = username === "Guest";

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!resumeText.trim()) return;

  setLoading(true);

  // Optimistic user message
  const userMsg = { sender: "user", text: resumeText, created_at: new Date().toISOString() };
  setMessages((prev) => [...prev, userMsg]);
  setResumeText("");

  try {
    if (isGuest) {
      // 🚀 Guest mode → only call AI API, no backend chat creation
      const data = await analyzeCareer(resumeText);
      const aiMsg = {
        sender: "ai",
        text: " ",
        _parsed: data,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } else {
      // 🔑 Logged-in mode → backend persistence
      let chatId = activeChatId;
      if (!chatId) {
        const res = await createChat("Career Analysis");
        chatId = res.data.id;
        setActiveChatId(chatId);
        await fetchChats();
      }

      await sendMessage({ chat: chatId, text: resumeText });

      const data = await analyzeCareer(resumeText);
      const aiMsg = {
        sender: "ai",
        text: JSON.stringify(data),
        _parsed: data,
        created_at: new Date().toISOString(),
      };

      await sendMessage({ chat: chatId, text: JSON.stringify(data) });
      setMessages((prev) => [...prev, aiMsg]);
    }
  } catch (err) {
    console.error("Analysis failed", err);
    setMessages((prev) => [...prev, { sender: "ai", text: "❌ Failed to analyze resume." }]);
  } finally {
    setLoading(false);
  }
};








  // Logout
  const handleLogout = () => {
    localStorage.removeItem("tokens");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div className="d-flex flex-column bg-dark text-white p-3" style={{ width: 280 }}>
        <div className="mb-3 fw-bold fs-5 d-flex align-items-center gap-2">
          {/* <span className="material-symbols-outlined">density_medium</span> */}
          {/* <img src="/logo192.png" alt="Logo" style={{ width: 30, height: 30 }} />
          Career Path Analyzer */}
        </div>

        <button
          className="btn btn-outline-light mb-3 d-flex align-items-center gap-2"
          onClick={handleNewChat}
        >
          <i className="bi bi-plus-lg"></i> New Chat
        </button>

        <div className="flex-grow-1 overflow-auto">
          {chats.length === 0 && <p className="text-muted">No previous chats</p>}
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={`p-2 rounded mb-2 hover-bg-secondary ${
                chat.id === activeChatId
                  ? "bg-primary text-white"
                  : "bg-secondary bg-opacity-10"
              }`}
              style={{ cursor: "pointer" }}
            >
              {chat.title || "Untitled Chat"}
            </div>
          ))}
        </div>

        {/* Profile + Logout */}
        <div className="mt-auto d-flex align-items-center justify-content-between p-2 rounded hover-bg-secondary">
          <div
            className="d-flex align-items-center gap-2"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span>{username}</span>
          </div>
          <span
            className="material-symbols-outlined"
            style={{ cursor: "pointer" }}
            onClick={handleLogout}
          >
            logout
          </span>
        </div>
      </div>

      {/* Main Area */}
      <div className="d-flex flex-column flex-grow-1">
        {/* Top Bar */}
        <div className="d-flex align-items-center justify-content-between p-3 shadow-sm topbar">
          <div className="fw-bold fs-5 d-flex align-items-center gap-2">
            <img src="/logo192.png" alt="Logo" style={{ width: 35, height: 35 }} />
            Career Path Analyzer
          </div>
          <div className="d-flex gap-3 align-items-center">
            <Link to="/register" className="btn btn-light d-flex align-items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined">person</span> Register
            </Link>
            <Link to="/login" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined">tv_signin</span> Login
            </Link>
          </div>
        </div>

        {/* Chat Section */}
        <div
          className="flex-grow-1 overflow-auto p-3"
          style={{ background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)" }}
        >
          {messages.length === 0 && (
            <div className="text-center text-muted mt-5">
              <h4>Welcome to Career Path Analyzer 🚀</h4>
              <p>Paste your resume text or skills below and start chatting.</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const parsed = msg._parsed || null;
            return (
              <div
                key={index}
                className={`d-flex mb-3 ${
                  msg.sender === "user" ? "justify-content-end" : "justify-content-start"
                }`}
              >
                <div
                  className={`p-3 rounded shadow-sm ${
                    msg.sender === "user" ? "bg-info text-white" : "bg-white"
                  }`}
                  style={{ maxWidth: "75%" }}
                >
                  {/* Show plain text only if there’s no parsed JSON */}
{!parsed && msg.text && (
  <p className="mb-2">{msg.text}</p>
)}

                  {parsed?.skills?.length > 0 && (
                    <div className="mt-2">
                      <h6 className="fw-bold mb-2">🛠 Extracted Skills</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {parsed.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="badge text-white"
                            style={{
                              background: "linear-gradient(90deg, #667eea, #764ba2)",
                              padding: "8px 12px",
                              borderRadius: 20,
                              fontWeight: 500,
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsed?.recommendations?.length > 0 && (
                    <div className="mt-3">
                      <h6 className="fw-bold mb-3">💼 Career Recommendations</h6>
                      {parsed.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="card my-3 border-0 shadow-sm"
                          style={{ borderLeft: "5px solid #667eea" }}
                        >
                          <div className="card-body p-3">
                            <h5 className="fw-bold text-primary">{rec.career}</h5>
                            <p className="mb-1">
                              <b>Match Score:</b>{" "}
                              <span className="badge bg-success">{rec.match_score}%</span>
                            </p>
                            <p className="mb-1">
                              <b>Present Skills:</b>{" "}
                              {rec.present_skills?.length > 0
                                ? rec.present_skills.join(", ")
                                : "N/A"}
                            </p>
                            <p className="mb-1">
                              <b>Missing Skills:</b>{" "}
                              {rec.missing_skills?.length > 0
                                ? rec.missing_skills.join(", ")
                                : "N/A"}
                            </p>
                            {rec.resources?.length > 0 && (
                              <div className="mt-2">
                                <h6 className="fw-semibold">📚 Resources</h6>
                                <ul className="list-unstyled">
                                  {rec.resources.map((res, j) => (
                                    <li key={j} className="mb-2">
                                      <a
                                        href={res.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2"
                                      >
                                        <i className="bi bi-box-arrow-up-right" /> {res.name}
                                      </a>
                                      <span className="ms-2 small text-muted">
                                        ({res.free === "True" ? "Free" : "Paid"})
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <p className="text-center fst-italic">⏳ Analyzing your resume...</p>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form className="d-flex p-3 border-top bg-white" onSubmit={handleSubmit}>
          <textarea
            className="form-control me-2 rounded-3 shadow-sm"
            rows="2"
            placeholder="Paste your resume text or skills here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
          <button
            className="btn btn-primary px-4"
            type="submit"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CareerForm;

