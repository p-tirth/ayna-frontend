// App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './Login';
import Signup from './Signup';
import ChatPage from './ChatPage';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<ChatPage />} />
        </Route>
        {/* Redirect any unknown route to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
