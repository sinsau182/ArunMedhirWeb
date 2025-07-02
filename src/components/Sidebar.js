import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FaChevronRight,
} from "react-icons/fa";
import Link from "next/link";
import { menuItems, roleDisplayLabels } from "./menu";

const Sidebar = ({ onHoverChange }) => {
  const [currentRole, setCurrentRole] = useState("");
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Sidebar is collapsed by default, expands on hover
  const isCollapsed = !isHovered;

  useEffect(() => {
    const role = sessionStorage.getItem("currentRole");
    setCurrentRole(role || "");

    // Initialize Settings menu as expanded
    setExpandedMenus((prev) => ({
      ...prev,
      settings: true,
    }));
  }, []);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Notify parent component about hover state change
    if (onHoverChange) {
      onHoverChange(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Notify parent component about hover state change
    if (onHoverChange) {
      onHoverChange(false);
    }
  };

  // Group menu items by category (YouTube-style organization)
  const groupedMenuItems = () => {
    const filtered = (menuItems || []).filter((item) => {
      return currentRole && item.roles && item.roles.includes(currentRole);
    });

    const groups = [];
    
    // Group 1: CORE - Dashboard & Lead Management
    const coreItems = filtered.filter(item => 
      item.label === "Dashboard" || 
      item.label === "Lead Management" ||
      item.label === "Team" ||
      item.label === "Manager"
    );
    if (coreItems.length > 0) {
      groups.push({ title: "CORE", items: coreItems });
    }

    // Group 2: PERSONAL - Attendance, Leave, My Payslips  
    const personalItems = filtered.filter(item => 
      item.label === "Attendance" ||
      item.label === "Leave" || 
      item.label === "My Payslips"
    );
    if (personalItems.length > 0) {
      groups.push({ title: "PERSONAL", items: personalItems });
    }

    // Group 3: WORKFORCE - Employees, Payroll
    const workforceItems = filtered.filter(item => 
      item.label === "Employees" || 
      item.label === "Payroll"
    );
    if (workforceItems.length > 0) {
      groups.push({ title: "WORKFORCE", items: workforceItems });
    }

    // Group 4: BUSINESS - Customers, Vendor, Employee, Expenses, Income
    const businessItems = filtered.filter(item => 
      item.label === "Customers" || 
      item.label === "Vendor" ||
      item.label === "Employee" ||
      item.label === "Expenses" ||
      item.label === "Income"
    );
    if (businessItems.length > 0) {
      groups.push({ title: "BUSINESS", items: businessItems });
    }

    // Group 5: CONFIGURATION - Settings (always last)
    const settingsItems = filtered.filter(item => item.label === "Settings");
    if (settingsItems.length > 0) {
      groups.push({ title: "CONFIGURATION", items: settingsItems });
    }

    return groups;
  };

  const isActiveLink = (link) => {
    if (!link) return false;
    return router.pathname === link || router.pathname.startsWith(link);
  };

  const isActiveParent = (item) => {
    if (!item.hasSubmenu) return false;
    return item.subItems.some((subItem) =>
      router.pathname.startsWith(subItem.link)
    );
  };

  // Don't render if currentRole is not set yet
  if (!currentRole) {
    return null;
  }

  const sidebarWidth = isCollapsed ? "w-16" : "w-60"; // 64px collapsed, 240px expanded
  const groups = groupedMenuItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsHovered(false)}
        />
      )}
      
      {/* Sidebar - Hover to Expand */}
      <aside
        className={`fixed left-0 bg-white border-r border-gray-200 transition-all duration-300 z-50 ${sidebarWidth} flex flex-col`}
        style={{
          top: '64px', // Start below the navbar
          height: 'calc(100vh - 64px)', // Fill remaining space
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col h-full">
          {/* Navigation Menu */}
          <nav className="flex-1 pt-4 overflow-y-auto overflow-x-hidden">
            {groups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-6">
                {!isCollapsed && (
                  <div className="px-6 mb-2">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {group.title}
                    </h3>
                  </div>
                )}
                
                <ul className="space-y-1">
                  {group.items.map((item, index) => {
                    const isActive = isActiveLink(item.link);
                    const isParentActive = isActiveParent(item);
                    const isExpanded = item.menuKey ? expandedMenus[item.menuKey] : false;

                    return (
                      <li key={index} className="relative">
                        {item.hasSubmenu ? (
                          <div>
                            <div
                              onClick={() => !isCollapsed && toggleMenu(item.menuKey)}
                              className={`group flex items-center px-6 py-3 cursor-pointer transition-all duration-150 ${
                                isCollapsed ? "justify-center" : "justify-between"
                              } ${
                                isParentActive
                                  ? "bg-gray-50 text-blue-600 font-semibold border-l-4 border-blue-600"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              <div className={`flex items-center ${isCollapsed ? '' : 'space-x-4'}`}>
                                <span
                                  className={`text-xl ${
                                    isParentActive ? "text-blue-600" : "text-gray-600"
                                  }`}
                                >
                                  {item.icon}
                                </span>
                                {!isCollapsed && (
                                  <span className="text-base whitespace-nowrap">
                                    {item.label}
                                  </span>
                                )}
                              </div>
                              {!isCollapsed && (
                                <FaChevronRight 
                                  className={`w-3 h-3 transition-transform ${
                                    isExpanded ? 'rotate-90' : ''
                                  } ${isParentActive ? 'text-blue-600' : 'text-gray-400'}`} 
                                />
                              )}
                            </div>

                            {/* Submenu items - only show when expanded and not collapsed */}
                            {isExpanded && !isCollapsed && (
                              <div className="ml-8 mt-1 space-y-1">
                                {item.subItems.map((subItem, subIndex) => {
                                  const isSubActive = isActiveLink(subItem.link);

                                  return (
                                    <Link
                                      key={subIndex}
                                      href={subItem.link}
                                      className={`flex items-center px-6 py-2 text-sm transition-all duration-150 space-x-4 ${
                                        isSubActive
                                          ? "bg-gray-50 text-blue-600 font-medium border-l-4 border-blue-600"
                                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                      }`}
                                    >
                                      <span className={`text-lg ${isSubActive ? "text-blue-600" : "text-gray-500"}`}>
                                        {subItem.icon}
                                      </span>
                                      <span className="whitespace-nowrap">{subItem.label}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={item.link}
                            className={`group flex items-center px-6 py-3 transition-all duration-150 relative ${
                              isCollapsed ? "justify-center" : "space-x-4"
                            } ${
                              isActive
                                ? "bg-gray-50 text-blue-600 font-semibold border-l-4 border-blue-600"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                            title={isCollapsed ? item.label : ""}
                          >
                            <span
                              className={`text-xl flex-shrink-0 ${
                                isActive ? "text-blue-600" : "text-gray-600"
                              }`}
                            >
                              {item.icon}
                            </span>
                            {!isCollapsed && (
                              <span className="text-base whitespace-nowrap">
                                {item.label}
                              </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {item.label}
                              </div>
                            )}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;