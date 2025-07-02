import { useState } from 'react';
import Navbar from './HradminNavbar';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const handleSidebarHover = (isHovered) => {
    setIsSidebarHovered(isHovered);
  };

  // Dynamic margin based on sidebar state: 64px when collapsed, 240px when expanded
  const mainContentMargin = isSidebarHovered ? 'lg:ml-60' : 'lg:ml-16';

  return (
    <div className="bg-gray-50 min-h-screen relative">
      <Sidebar onHoverChange={handleSidebarHover} />
      <Navbar />
      
      <main 
        className={`transition-all duration-300 min-h-screen ${mainContentMargin} p-6`}
        style={{
          paddingTop: '88px', // 64px navbar height + 24px top padding
        }}
      >
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 