import { useState, useEffect } from 'react';
import Navbar from './HradminNavbar';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';

const MainLayout = ({ children, module }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('hr');
  const router = useRouter();

  useEffect(() => {
    // If module prop is provided, use it directly
    if (module) {
      setActiveModule(module);
      return;
    }

    // Otherwise, determine module from the path
    const path = router.pathname;
    if (path.startsWith('/SalesManager') || path.startsWith('/manager')) {
      setActiveModule('sales');
    } else if (path.startsWith('/hradmin')) {
      setActiveModule('hr');
    } else if (path.startsWith('/account')) {
      setActiveModule('accounts');
    } else if (path.startsWith('/asset-management')) {
      setActiveModule('assets');
    } else if (path.startsWith('/employee')) {
        setActiveModule('employee');
    }
  }, [router.pathname, module]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} module={activeModule} />
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