import React from "react";
import "./Sidebar.css";

export default function Sidebar({ chats, newChat, selectChat }) {
  return (
    <aside className="sidebar">
      <button className="new-chat-btn" onClick={newChat}>+ New Chat</button>
      <div className="chat-list">
        {chats.map((chat, idx) => (
          <div key={idx} className="chat-item" onClick={() => selectChat(chat)}>
            {chat.title || `Chat ${idx + 1}`}
          </div>
        ))}
      </div>
    </aside>
  );
}
