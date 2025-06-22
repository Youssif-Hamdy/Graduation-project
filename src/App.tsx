import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./pages/Layout"; // استيراد الـ RootLayout
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import About from "./pages/About";
import AvailableMedicine from "./pages/AvailableMedicine";
import MedicinePage from "./pages/MedicinePage";
import Start from "./pages/Start";
import PharmacyLogin from "./pages/PharmacyLogin";
import Exchange from "./pages/Exchange";
import CartPage from "./pages/CartPage";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = localStorage.getItem("token"); 

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />; 
  }

  return <>{children}</>; 
};

const App: React.FC = () => {
  return (
    <Routes>
      
      <Route path="/start" element={<Start />} />

      <Route path="/signin" element={<SignIn />} />

      <Route path="/" element={<RootLayout />}>
        <Route index element={<Navigate to="/start" replace />} /> 
        <Route path="home" element={<Home />} /> 
        <Route path="about" element={<About />} /> 
        <Route path="availablemedicine" element={<AvailableMedicine />} /> 
        <Route path="medicine" element={<MedicinePage />} /> 
        <Route path="/pharmacy-login" element={<PharmacyLogin />} /> 
        <Route path="/exchange" element={<Exchange />} /> 
        <Route path="/cart" element={<CartPage />} />


      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
           {/* @ts-ignore */}
            <RootLayout>
              <div>Admin Dashboard</div>
            </RootLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/start" replace />} />
    </Routes>
  );
};

export default App;