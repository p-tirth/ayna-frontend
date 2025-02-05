// Sidebar.js
import React from 'react';
import { HiX, HiPlus, HiTrash, HiLogout } from 'react-icons/hi';

const Sidebar = ({
  sessions,
  currentSessionId,
  setCurrentSessionId,
  deleteSession,
  createNewSession,
  logout,
  sidebarOpen,
  setSidebarOpen,
  username,
}) => {
  return (
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
            {sessions.map((session) => (
              <li
                key={session.id}
                className={`flex justify-between items-center p-2 cursor-pointer rounded mb-2 ${
                  session.id === currentSessionId ? "bg-blue-200" : "hover:bg-blue-50"
                }`}
              >
                <span
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    setSidebarOpen(false);
                  }}
                >
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
  );
};

export default Sidebar;
