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
  const [sessionAccepted, setSessionAccepted] = useState(0);

  useEffect(() => {
    const savedUuid = localStorage.getItem('uuid');
    if (!savedUuid) return;

    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };

    fetch(import.meta.env.VITE_API_URL + "/autologinCheck/" + savedUuid, requestOptions)
      .then(response => response.json())
      .then(response => {
        if (response.status === false) {
          localStorage.setItem('uuid', "");
          console.warn(`Autologin to: '${savedUuid}' rejected by API with reason: '${response.err_msg}'`);
          setSessionAccepted(0);
        } else {
          sessionStorage.setItem('session-accepted', 1);
          localStorage.setItem("fullname", response.data.fullname);
          localStorage.setItem("email", response.data.email);
          console.log(`Autologin successful to: '${savedUuid}'`);
          setSessionAccepted(1);
        }
      })
      .catch(err => {
        localStorage.setItem('uuid', "");
        console.warn("Failed to request autologin");
        setSessionAccepted(0);
      });
  }, []);

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
