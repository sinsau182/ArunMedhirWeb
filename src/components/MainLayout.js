import { useState } from 'react';
import Navbar from './HradminNavbar';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <Navbar />
      
      <main 
        className="transition-all duration-300"
        style={{
          paddingTop: '64px', // Standard height of the navbar
          paddingLeft: isSidebarCollapsed ? '64px' : '224px' // Adjusts based on sidebar width
        }}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 