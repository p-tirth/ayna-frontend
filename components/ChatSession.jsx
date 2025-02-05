// ChatSession.js
import React, { useState } from 'react';

const ChatSession = ({ sendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() !== "") {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="flex">
      <input 
        type="text" 
        className="flex-1 border p-2 rounded-l focus:outline-none" 
        placeholder="Type your message..." 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => { if(e.key === 'Enter') handleSend(); }}
      />
      <button 
        className="px-4 bg-blue-500 text-white rounded-r hover:bg-blue-600"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
};

export default ChatSession;
