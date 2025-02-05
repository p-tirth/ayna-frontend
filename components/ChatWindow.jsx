// ChatWindow.js
import React from 'react';
import ChatSession from './ChatSession';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const ChatWindow = ({ currentSession, sendMessage }) => {
  return (
    <div className="flex-1 p-4 flex flex-col md:ml-64">
      {currentSession ? (
        <div className="flex-1 overflow-auto border p-4 mb-4">
          {currentSession.messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}
            >
              <span
                className={`inline-block p-2 rounded ${
                  msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border p-4 mb-4">
          <p className="text-gray-500">Click on new chat to create a session</p>
        </div>
      )}
      {currentSession && <ChatSession sendMessage={sendMessage} />}
      <footer className="mt-4 border-t pt-2 flex justify-center gap-6 text-gray-600">
        <a
          href="https://github.com/p-tirth/ayna-frontend"
          target="_blank"
          rel="noopener noreferrer"
          title="Frontend Repository"
          className="flex items-center gap-1 hover:text-gray-800"
        >
          <FaGithub size={20} /> Frontend
        </a>
        <a
          href="https://www.linkedin.com/in/p-tirth-/"
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn Profile"
          className="flex items-center gap-1 hover:text-gray-800"
        >
          <FaLinkedin size={20} /> LinkedIn
        </a>
        <a
          href="https://github.com/p-tirth/ayna-socket-server"
          target="_blank"
          rel="noopener noreferrer"
          title="Backend Repository"
          className="flex items-center gap-1 hover:text-gray-800"
        >
          <FaGithub size={20} /> Socket Server
        </a>
      </footer>
    </div>
  );
};

export default ChatWindow;
