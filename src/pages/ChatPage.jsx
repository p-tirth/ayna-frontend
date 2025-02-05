// ChatPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { HiMenu } from 'react-icons/hi';
import Sidebar from '../../components/Sidebar';
import ChatWindow from '../../components/ChatWindow';

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
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Retrieve user info from localStorage (assumes user is stored as JSON)
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const username = user?.username || "User";

  // Load sessions from localStorage on mount
  useEffect(() => {
    const storedSessionsStr = localStorage.getItem("chatSessions");
    if (storedSessionsStr !== null) {
      try {
        const parsedSessions = JSON.parse(storedSessionsStr);
        if (Array.isArray(parsedSessions)) {
          setSessions(parsedSessions);
          const storedSessionId = localStorage.getItem("currentSessionId");
          if (storedSessionId && parsedSessions.some((s) => s.id === Number(storedSessionId))) {
            setCurrentSessionId(Number(storedSessionId));
          }
        }
      } catch (error) {
        console.error("Error parsing stored sessions:", error);
      }
    }
  }, []);

  // Persist sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(sessions));
  }, [sessions]);

  // Persist current session id
  useEffect(() => {
    if (currentSessionId !== null) {
      localStorage.setItem("currentSessionId", currentSessionId);
    }
  }, [currentSessionId]);

  // Create a new chat session
  const createNewSession = () => {
    const newSession = { id: Date.now(), messages: [] };
    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
  };

  // Delete a session by its id
  const deleteSession = (sessionId) => {
    setSessions((prevSessions) => {
      const newSessions = prevSessions.filter((session) => session.id !== sessionId);
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

  // Send a message if a session exists
  const sendMessage = (message) => {
    if (!currentSession) return;
    const newMessage = { sender: "user", content: message, timestamp: Date.now() };
    updateCurrentSession(newMessage);
    socket.emit("chatMessage", message);
  };

  // Receive a message from the server
  const receiveMessage = (message) => {
    if (!currentSession) return;
    const newMessage = { sender: "ai", content: message, timestamp: Date.now() };
    updateCurrentSession(newMessage);
  };

  const updateCurrentSession = (newMessage) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSessionId
          ? { ...session, messages: [...session.messages, newMessage] }
          : session
      )
    );
  };

  useEffect(() => {
    socket.on("message", receiveMessage);
    return () => {
      socket.off("message", receiveMessage);
    };
  }, [currentSessionId]);

  // Logout clears localStorage and navigates to login
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const currentSession = sessions.find((session) => session.id === currentSessionId);

  return (
    <div className="flex h-screen">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        deleteSession={deleteSession}
        createNewSession={createNewSession}
        logout={logout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        username={username}
      />

      {/* Hamburger menu for small screens (only when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-30 md:hidden bg-gray-100 p-2 rounded focus:outline-none"
          onClick={() => setSidebarOpen(true)}
          title="Open Menu"
        >
          <HiMenu size={24} />
        </button>
      )}

      <ChatWindow currentSession={currentSession} sendMessage={sendMessage} />
    </div>
  );
}

export default ChatPage;
