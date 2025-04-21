import { Outlet } from "react-router-dom";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";

const RootLayout = () => {
  return (
    <div className="root-layout flex flex-col min-h-screen">
      {/* شريط التنقل (Navbar) */}
      <Navbar />

      {/* المحتوى الرئيسي */}
      <main className="flex-grow">
        <Outlet /> {/* هذا المكان الذي سيتم عرض الصفحات الفرعية فيه */}
      </main>

      {/* الفوتر */}
      <Footer /> {/* إضافة الفوتر هنا */}
    </div>
  );
};

export default RootLayout;