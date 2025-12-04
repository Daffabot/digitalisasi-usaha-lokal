import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// --- Import Halaman Utama ---
import Landing from "../pages/Landing/Landing";
import Home from "../pages/Home/Home";
import ScanBooks from "../pages/Scan/ScanBooks";
import UploadResult from "../pages/Scan/UploadResult";
import Settings from "../pages/Settings/Settings";

// --- Import Halaman Auth (Login & Register) ---
// CATATAN: Pastikan lokasi filenya sesuai dengan folder kamu.
// Jika kamu menaruhnya di dalam folder 'pages/Auth', gunakan path ini:
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";

// Jika kamu TIDAK memindahkannya (masih di 'pages' langsung),
// hapus 2 baris import di atas dan pakai yang ini:
// import Login from '../pages/Login';
// import Register from '../pages/Register';

// --- Import Komponen Layout ---
import MobileNavbar from "../components/layout/MobileNavbar";
import DesktopSidebar from "../components/layout/DesktopSidebar";
import Header from "../components/layout/Header";

const AppRoutes = () => {
  const location = useLocation();

  // Daftar halaman yang tampil "Full Screen" (Tanpa Sidebar & Header)
  const publicRoutes = ["/", "/login", "/register"];

  // Cek apakah halaman saat ini termasuk halaman public
  const isPublicPage = publicRoutes.includes(location.pathname);

  return (
    <div className="flex h-screen w-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 overflow-hidden">
      {/* Sidebar Desktop: Hanya muncul jika BUKAN halaman public */}
      {!isPublicPage && <DesktopSidebar />}

      <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${!isPublicPage ? "md:pl-64" : ""}`}>
        {/* Header: Hanya muncul jika BUKAN halaman public */}
        {!isPublicPage && <Header />}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${!isPublicPage ? "p-6 pb-24 md:pb-6" : ""}`}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* === Public Routes (Bebas Akses) === */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* === Private Routes (Perlu Login) === */}
              <Route path="/home" element={<Home />} />
              <Route path="/scan" element={<ScanBooks />} />
              <Route path="/scan/result" element={<UploadResult />} />
              <Route path="/settings" element={<Settings />} />

              {/* Fallback: Jika halaman tidak ditemukan, kembalikan ke Home atau Login */}
              <Route path="*" element={<Home />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Navbar Mobile: Hanya muncul jika BUKAN halaman public */}
        {!isPublicPage && <MobileNavbar />}
      </div>
    </div>
  );
};

export default AppRoutes;
