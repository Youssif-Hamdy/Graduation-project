import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'animate.css';
import RootLayout from "./pages/Layout";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import About from "./pages/About";

interface ToastProps {
  message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    visible && (
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-full animate__animated animate__fadeIn">
        {message}
      </div>
    )
  );
};

const App: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string>('');
  // @ts-ignore
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(true);

  useEffect(() => {
    const isAlreadyVisited = sessionStorage.getItem('hasVisited');
    
    if (!isAlreadyVisited) {
      setTimeout(() => {
        setToastMessage('Please Sign In');
      }, 3000);
      
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="about" element={<About />} />


         


        </Route>
      </Routes>

      <Toast message={toastMessage} />
    </BrowserRouter>
  );
}

export default App;