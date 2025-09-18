import { useState, useRef, useEffect } from "react";
import { askGemini } from "../api";
import "bootstrap/dist/css/bootstrap.min.css";

function CareerPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([{ id: 1, title: "First Chat" }]); // sidebar chats
  const [activeChat, setActiveChat] = useState(1);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await askGemini(input);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: res.data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "❌ Error connecting to Gemini" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = () => {
    const newId = Date.now();
    setChats([...chats, { id: newId, title: `Chat ${chats.length + 1}` }]);
    setActiveChat(newId);
    setMessages([]);
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        
        {/* Sidebar */}
        <div className="col-3 col-md-2 bg-dark text-white d-flex flex-column p-3">
          <button
            className="btn btn-outline-light w-100 mb-3"
            onClick={createNewChat}
          >
            + New Chat
          </button>

          <h6 className="text-secondary">Recent Chats</h6>
          <ul className="list-unstyled flex-grow-1 overflow-auto">
            {chats.map((chat) => (
              <li
                key={chat.id}
                className={`p-2 rounded mb-1 ${
                  activeChat === chat.id ? "bg-secondary" : "hover-bg"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setActiveChat(chat.id);
                  setMessages([]); // reset for simplicity (could load history)
                }}
              >
                {chat.title}
              </li>
            ))}
          </ul>

          <div className="mt-auto small text-muted">⚡ Gemini Career AI</div>
        </div>

        {/* Chat Area */}
        <div className="col-9 col-md-10 d-flex flex-column border-start p-0">
       
{/* Header */}
<header className="p-3 bg-primary text-white fw-bold d-flex justify-content-between align-items-center">
  <span>🚀 Career Advisor (Gemini)</span>
  <div>
    <button className="btn btn-outline-light me-2"><a href="login">Login</a></button>
    <button className="btn btn-light text-primary">Register</button>
  </div>
</header>


          {/* Messages */}
          <div className="flex-grow-1 overflow-auto p-3 bg-white">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`d-flex mb-3 ${
                  msg.sender === "user"
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                {msg.sender === "ai" && <div className="me-2">🤖</div>}
                <div
                  className={`p-2 rounded-3 ${
                    msg.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-secondary text-white"
                  }`}
                  style={{ maxWidth: "70%" }}
                >
                  {msg.text}
                </div>
                {msg.sender === "user" && <div className="ms-2">👤</div>}
              </div>
            ))}

            {loading && (
              <div className="d-flex align-items-center text-muted">
                <div className="me-2">🤖</div>
                <div>
                  <em>⏳ Gemini is thinking...</em>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 border-top bg-light d-flex">
            <input
              type="text"
              value={input}
              placeholder="Ask Gemini about your career..."
              onChange={(e) => setInput(e.target.value)}
              className="form-control me-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CareerPage;
