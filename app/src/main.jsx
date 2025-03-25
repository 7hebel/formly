import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import './ui/theme.css'
import './ui/ui-style.css'
import Home from './pages/Home.jsx'
import { LoginPanel, RegisterPanel } from './pages/SignIn.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Home />}></Route>
        <Route path="/login" element={<LoginPanel />} />
        <Route path="/register" element={<RegisterPanel />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
