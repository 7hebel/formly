import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, StrictMode } from 'react';
import { LoginPanel, RegisterPanel } from './pages/SignIn.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FormBuilder from './pages/FormBuilder.jsx';
import Answer from './pages/Answer.jsx';
import Home from './pages/Home.jsx';
import butterup from "butteruptoasts";

butterup.options.toastLife = 5000;

sessionStorage.setItem("session-accepted", 0);


function App() {
  return (
    <StrictMode>
      <BrowserRouter>
        <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="/login" element={<LoginPanel />} />
        <Route path="/register" element={<RegisterPanel />}/>
        <Route path="/dash" element={<Dashboard />}/>
        <Route path="/builder/:formId" element={<FormBuilder />}/>
        <Route path="/form/:formId" element={<Answer />}/>
        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
