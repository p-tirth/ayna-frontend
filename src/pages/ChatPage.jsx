// ChatPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import ChatSession from './ChatSession';
import { HiMenu, HiX, HiPlus, HiTrash, HiLogout } from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const socket = io("https://ayna-socket-server.onrender.com");

function ChatPage() {
  const [sessions, setSessions] = useState(() => {
    const stored = localStorage.getItem("chatSessions");
    if (stored !== null) {
      try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Error parsing stored sessions:", error);
      }
    }
    return [];
  });
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const storedId = localStorage.getItem("currentSessionId");
    return storedId ? Number(storedId) : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get user info from localStorage (assumes user was saved as JSON)
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const username = user?.username || "User";

  // Load sessions from localStorage on mount (if any exist)
  useEffect(() => {
    const storedSessionsStr = localStorage.getItem("chatSessions");
    if (storedSessionsStr) {
      try {
        const parsedSessions = JSON.parse(storedSessionsStr);
        if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
          setSessions(parsedSessions);
          const storedSessionId = localStorage.getItem("currentSessionId");
          if (storedSessionId && parsedSessions.some(s => s.id === Number(storedSessionId))) {
            setCurrentSessionId(Number(storedSessionId));
          }
          return;
        }
      } catch (error) {
        console.error("Error parsing stored sessions:", error);
      }
    }
    // Leave sessions empty on login (no auto-creation)
    setSessions([]);
    setCurrentSessionId(null);
  }, []);

  // Persist sessions and current session id in localStorage
  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId !== null) {
      localStorage.setItem("currentSessionId", currentSessionId);
    }
  }, [currentSessionId]);

  // Create a new chat session
  const createNewSession = () => {
    const newSession = { id: Date.now(), messages: [] };
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
  };

  // Delete a session by its id
  const deleteSession = (sessionId) => {
    setSessions(prevSessions => {
      const newSessions = prevSessions.filter(session => session.id !== sessionId);
      if (sessionId === currentSessionId) {
        if (newSessions.length > 0) {
          setCurrentSessionId(newSessions[0].id);
        } else {
          setCurrentSessionId(null);
        }
      }
      return newSessions;
    });
  };

  // Send message only if a session exists
  const sendMessage = (message) => {
    if (!currentSession) return;
    const newMessage = { sender: "user", content: message, timestamp: Date.now() };
    updateCurrentSession(newMessage);
    socket.emit("chatMessage", message);
  };

  // Receive message from server and update session
  const receiveMessage = (message) => {
    if (!currentSession) return;
    const newMessage = { sender: "ai", content: message, timestamp: Date.now() };
    updateCurrentSession(newMessage);
  };

  // Utility to update the current session with a new message
  const updateCurrentSession = (newMessage) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === currentSessionId) {
          return { ...session, messages: [...session.messages, newMessage] };
        }
        return session;
      })
    );
  };

  useEffect(() => {
    socket.on("message", receiveMessage);
    return () => {
      socket.off("message", receiveMessage);
    };
  }, [currentSessionId]);

  // Logout clears all localStorage data and navigates to login page
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const currentSession = sessions.find(session => session.id === currentSessionId);

  return (
    <div className="flex h-screen">
      {/* Responsive Sidebar */}
      <div
        className={`
          fixed z-20 top-0 left-0 h-full bg-gray-100 p-4 transform 
          transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0 md:w-64
        `}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-center md:block">
              <h2 className="text-xl font-bold mb-4">Chats</h2>
              {/* User Greeting */}
              <p className="text-gray-700 mb-4">Hello, {username}</p>
              {sidebarOpen && (
                <button 
                  className="md:hidden mb-4" 
                  onClick={() => setSidebarOpen(false)}
                  title="Close Menu"
                >
                  <HiX size={24} />
                </button>
              )}
            </div>
            <ul>
              {sessions.map(session => (
                <li
                  key={session.id}
                  className={`flex justify-between items-center p-2 cursor-pointer rounded mb-2 ${
                    session.id === currentSessionId ? "bg-blue-200" : "hover:bg-blue-50"
                  }`}
                >
                  <span onClick={() => { setCurrentSessionId(session.id); setSidebarOpen(false); }}>
                    Session {session.id}
                  </span>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                    title="Delete Session"
                  >
                    <HiTrash size={18} />
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded w-full hover:bg-green-600"
              onClick={createNewSession}
            >
              <HiPlus size={20} /> New Chat
            </button>
          </div>
          <div>
            <button
              onClick={logout}
              className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded w-full hover:bg-red-600"
            >
              <HiLogout size={20} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Hamburger Menu for small screens (only visible when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-30 md:hidden bg-gray-100 p-2 rounded focus:outline-none"
          onClick={() => setSidebarOpen(true)}
          title="Open Menu"
        >
          <HiMenu size={24} />
        </button>
      )}

      {/* Main chat window */}
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

        {/* Render the chat input only if a session exists */}
        {currentSession && <ChatSession sendMessage={sendMessage} />}

        {/* Footer with Social Links */}
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
    </div>
  );
}

export default ChatPage;
