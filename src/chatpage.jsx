// ChatPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import ChatSession from './ChatSession';

// const socket = io("http://localhost:3001");
const socket = io("https://ayna-socket-server.onrender.com");

function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const navigate = useNavigate();

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
          } else {
            setCurrentSessionId(parsedSessions[0].id);
          }
          return;
        }
      } catch (error) {
        console.error("Error parsing stored sessions:", error);
      }
    }
    createNewSession();
  }, []);

  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId !== null) {
      localStorage.setItem("currentSessionId", currentSessionId);
    }
  }, [currentSessionId]);

  const createNewSession = () => {
    const newSession = { id: Date.now(), messages: [] };
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (sessionId) => {
    setSessions(prevSessions => {
      const newSessions = prevSessions.filter(session => session.id !== sessionId);
      if (sessionId === currentSessionId) {
        if (newSessions.length > 0) {
          setCurrentSessionId(newSessions[0].id);
        } else {
          createNewSession();
        }
      }
      return newSessions;
    });
  };

  const sendMessage = (message) => {
    const newMessage = { sender: "user", content: message, timestamp: Date.now() };
    updateCurrentSession(newMessage);
    socket.emit("chatMessage", message);
  };

  const receiveMessage = (message) => {
    const newMessage = { sender: "ai", content: message, timestamp: Date.now() };
    updateCurrentSession(newMessage);
  };

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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const currentSession = sessions.find(session => session.id === currentSessionId);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl mb-4">Chats</h2>
          <ul>
            {sessions.map(session => (
              <li
                key={session.id}
                className={`flex justify-between items-center p-2 cursor-pointer rounded mb-2 ${
                  session.id === currentSessionId ? "bg-blue-200" : "hover:bg-blue-50"
                }`}
              >
                <span onClick={() => setCurrentSessionId(session.id)}>
                  Session {session.id}
                </span>
                <button
                  onClick={() => deleteSession(session.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded w-full"
            onClick={createNewSession}
          >
            New Chat
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded w-full hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Chat Window */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex-1 overflow-auto border p-4 mb-4">
          {currentSession &&
            currentSession.messages.map((msg, index) => (
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
        <ChatSession sendMessage={sendMessage} />
      </div>
    </div>
  );
}

export default ChatPage;
