
//export default AssetManagementLayout; //
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaHome, FaCog, FaAngleLeft, FaAngleRight, FaBoxOpen } from 'react-icons/fa';
import HradminNavbar from './HradminNavbar';

const AssetManagementLayout = ({ children }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const isActiveLink = (link) => {
  if (link === "/asset-management") {
    // Only active on the exact home route
    return router.pathname === link;
  }
  // Active on exact match or subpages for other links
  return router.pathname === link || router.pathname.startsWith(link + "/");
};

  const menuItems = [
    { 
      label: "Home", 
      icon: <FaHome />, 
      link: "/asset-management",
      description: "View and manage all assets"
    },
    { 
      label: "Settings", 
      icon: <FaCog />, 
      link: "/asset-management/settings",
      description: "Configure asset categories and fields"
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/*Top Navigation Bar */}
      {/* <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <FaBoxOpen className="text-2xl text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Asset Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {menuItems.find(item => isActiveLink(item.link))?.description || "Asset Management System"}
            </span>
          </div>
        </div>
      </nav>*/}

      <HradminNavbar />

 <aside
  className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-white shadow-md transition-all duration-300 z-30 ${
    isSidebarCollapsed ? "w-16" : "w-64"
  }`}
>
  {/* Collapse/Expand Button */}
  <div className="absolute -right-4 top-3 z-50">
    <button
      onClick={toggleSidebar}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-gray-600 hover:text-blue-600 shadow-md transition-all duration-300 border border-gray-200"
      title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {isSidebarCollapsed ? (
        <FaAngleRight className="w-4 h-4" />
      ) : (
        <FaAngleLeft className="w-4 h-4" />
      )}
    </button>
  </div>

  {/* Navigation Menu */}
  <nav className="flex-1 pt-4">
    <ul className="space-y-2">
      {menuItems.map((item, index) => {
        const isActive = isActiveLink(item.link);

        return (
          <li key={index}>
            <Link
              href={item.link}
              className={`
                group flex items-center px-4 py-3 
                transition-all duration-200 
                ${isSidebarCollapsed ? "justify-center" : "gap-4"}
                ${
                  isActive
                    ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }
              `}
              title={isSidebarCollapsed ? item.label : ""}
            >
              <span
                className={`text-xl ${
                  isActive
                    ? "text-blue-600"
                    : "group-hover:text-blue-600"
                }`}
              >
                {item.icon}
              </span>
              {!isSidebarCollapsed && (
                <span className="text-base font-medium">{item.label}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  </nav>

  {/* Footer */}
  {!isSidebarCollapsed && (
    <div className="p-4 border-t border-gray-200">
    </div>
  )}
</aside>

      {/* Main Content */}
      <main 
        className="transition-all duration-300"
        style={{
          paddingTop: '64px',
          paddingLeft: isSidebarCollapsed ? '64px' : '256px'
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default AssetManagementLayout; 