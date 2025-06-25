import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/common/Sidebar";
import Categories from "./pages/Categories";
import Emails from "./pages/BorcEmail";
import LoginPage from "./pages/Login-Page";
import FileList from "./pages/FileList";

import { useLocation } from "react-router-dom";

// import FAQPage from "./pages/FAQ";

function App() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/";

  return (
    <div className='flex h-screen bg-gray-900 text-gray-100 overflow-hidden'>
      {/* BG */}
      {!hideSidebar && (
        <div className='fixed inset-0 z-0'>
          <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80' />
          <div className='absolute inset-0 backdrop-blur-sm' />
        </div>
      )}

      {!hideSidebar && <Sidebar />}
      
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Categories />} />
        <Route path="/Emails" element={<Emails />} />
        <Route path="/files" element={<FileList />} />
      </Routes>
    </div>
  );
}

export default App;
