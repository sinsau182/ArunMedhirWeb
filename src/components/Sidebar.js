import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FaUsers,
  FaMoneyCheckAlt,
  FaCog,
  FaBuilding,
  FaCalendarAlt,
  FaAngleLeft,
  FaAngleRight,
  FaTasks,
  FaUserTie,
  FaHome,
  FaBoxOpen,
  FaChartPie,
} from "react-icons/fa";
import {
  Briefcase,
  Calendar,
  ChartColumnIncreasing,
  Clock,
  CreditCard,
  CreditCardIcon,
  ReceiptIcon,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

const Sidebar = ({ isSidebarCollapsed }) => {
  const [currentRole, setCurrentRole] = useState("");
  const [expandedMenus, setExpandedMenus] = useState({});
  const [department, setDepartment] = useState("");
  const router = useRouter();

  useEffect(() => {
    const role = sessionStorage.getItem("currentRole");
    const dept = sessionStorage.getItem("departmentName");
    setCurrentRole(role);
    setDepartment(dept);
    setExpandedMenus((prev) => ({ ...prev, settings: true }));
  }, []);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  const roleDisplayLabels = {
    EMPLOYEE: "Employee",
    MANAGER: "Manager",
    HRADMIN: "HR Admin",
    SALES: "Sales Employee",
    ACCOUNTANT: "Accountant",
    PROJECTADMIN: "Project Admin",
    PROJECTMANAGER: "Project Manager",
    SALESMANAGER: "Sales Manager",
  };

  const allMenuItems = {
    hr: [
      { label: "Dashboard", icon: <ChartColumnIncreasing />, link: "/hradmin/dashboard", roles: ["HRADMIN"] },
      { label: "Employees", icon: <Users />, link: "/hradmin/employees", roles: ["HRADMIN"] },
      { label: "Attendance", icon: <Clock />, link: "/hradmin/attendance", roles: ["HRADMIN"] },
      { label: "Payroll", icon: <ReceiptIcon />, link: "/hradmin/payroll", roles: ["HRADMIN"] },
      {
        label: "Settings", icon: <FaCog />, roles: ["HRADMIN"], hasSubmenu: true, menuKey: "settings",
        subItems: [
          { label: "Organization", icon: <FaBuilding />, link: "/hradmin/settings/organization" },
          { label: "Payroll", icon: <FaMoneyCheckAlt />, link: "/hradmin/settings/payrollsettings" },
          { label: "Leaves", icon: <FaCalendarAlt />, link: "/hradmin/settings/leave" },
        ],
      },
    ],
    sales: [
      { label: "Dashboard", icon: <ChartColumnIncreasing />, link: "/manager/dashboard", roles: ["SALESMANAGER"] },
      { label: "Lead Management", icon: <FaTasks />, link: "/SalesManager/Manager", roles: ["SALESMANAGER"] },
      { label: "Settings", icon: <FaCog />, link: "/SalesManager/Manager?view=settings", roles: ["SALESMANAGER"] },
    ],
    accountant: [
      { label: "Customers", icon: <FaUsers />, link: "/account/customers", roles: ["ACCOUNTANT"] },
      { label: "Vendor", icon: <FaBuilding />, link: "/account/vendor", roles: ["ACCOUNTANT"] },
      { label: "Employee", icon: <FaUserTie />, link: "/account/employee", roles: ["ACCOUNTANT"] },
      { label: "Settings", icon: <FaCog />, link: "/account/settings", roles: ["ACCOUNTANT"] },
    ],
    assets: [
      { label: "Home", icon: <FaHome />, link: "/asset-management", roles: ["HRADMIN", "MANAGER", "SALESMANAGER", "ACCOUNTANT", "SALES", "PROJECTADMIN", "PROJECTMANAGER"] },
      { label: "Setting", icon: <FaCog />, link: "/asset-management/settings", roles: ["HRADMIN", "MANAGER", "SALESMANAGER", "ACCOUNTANT", "SALES", "PROJECTADMIN", "PROJECTMANAGER"] },
    ],
    employee: [
        { label: "Dashboard", icon: <ChartColumnIncreasing />, link: "/employee/dashboard", roles: ["EMPLOYEE"] },
        { label: "Leave", icon: <Calendar />, link: "/employee/leaves", roles: ["EMPLOYEE"] },
        { label: "Attendance", icon: <Clock />, link: "/employee/attendances", roles: ["EMPLOYEE"] },
        { label: "My Payslips", icon: <ReceiptIcon />, link: "/employee/mypayslip", roles: ["EMPLOYEE"] },
        { label: "Lead Management", icon: <FaTasks />, link: "/employee/leads", roles: ["EMPLOYEE"] },
        { label: "Project Income", icon: <FaMoneyCheckAlt />, link: "/project_Manager/income", roles: ["PROJECTMANAGER"] },
    ]
  };
  
  // Create a role mapping to handle different role formats
  const roleMapping = {
    'HRADMIN': 'hr',
    'SALESMANAGER': 'sales', 
    'ACCOUNTANT': 'accountant',
    'EMPLOYEE': 'employee',
    'MANAGER': 'hr', // or whatever default you want for manager
    'SALES': 'employee',
    'PROJECTADMIN': 'employee',
    'PROJECTMANAGER': 'employee'
  };
  
  let menuItems = [];
  if (module && allMenuItems[module]) {
      // If module is explicitly provided (like for Asset Management)
      menuItems = allMenuItems[module];
  } else if (currentRole && roleMapping[currentRole]) {
      // Use role mapping to get the correct menu items
      menuItems = allMenuItems[roleMapping[currentRole]];
  } else if (currentRole && allMenuItems[currentRole.toLowerCase()]) {
      // Fallback to the old logic
      menuItems = allMenuItems[currentRole.toLowerCase()];
  }

  // Filter menu items based on currentRole and department
  const filteredMenuItems = menuItems.filter((item) => {
    return item.roles && item.roles.includes(currentRole);
  });

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

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-white shadow-md transition-all duration-300 ${
        isSidebarCollapsed ? "w-16" : "w-56"
      }`}
    >
      <nav className="flex-1 pt-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item, index) => {
            const isActive = isActiveLink(item.link);
            const isParentActive = isActiveParent(item);
            const isExpanded = item.menuKey
              ? expandedMenus[item.menuKey]
              : false;

            return (
              <li key={index} className="relative">
                {item.hasSubmenu ? (
                  <div>
                    <div
                      onClick={() => toggleMenu(item.menuKey)}
                      className={`group flex items-center px-4 py-3 cursor-pointer transition-all duration-200 ${
                        isSidebarCollapsed ? "justify-center" : "gap-4"
                      } ${
                        isParentActive
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`text-xl ${
                          isParentActive
                            ? "text-blue-600"
                            : "group-hover:text-blue-600"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {!isSidebarCollapsed && (
                        <>
                          <span className="text-lg flex-1">
                            {item.label}
                          </span>
                          <span className="transform transition-transform duration-200">
                            {isExpanded ? (
                              <FaAngleLeft className="w-4 h-4" />
                            ) : (
                              <FaAngleRight className="w-4 h-4" />
                            )}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Submenu items */}
                    {isExpanded && !isSidebarCollapsed && (
                      <div
                        className={`
                          pl-4 
                          mt-1 
                          transition-all duration-200 
                          overflow-hidden
                        `}
                      >
                        {item.subItems.map((subItem, subIndex) => {
                          const isSubActive = isActiveLink(subItem.link);

                          return (
                            <Link
                              key={subIndex}
                              href={subItem.link}
                              prefetch={true}
                              className={`
                                flex items-center px-4 py-2 
                                transition-all duration-200 
                                gap-3
                                ${
                                  isSubActive
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                                }
                              `}
                            >
                              <span
                                className={`text-lg ${
                                  isSubActive ? "text-blue-600" : ""
                                }`}
                              >
                                {subItem.icon}
                              </span>
                              {!isSidebarCollapsed && (
                                <span className="text-sm">
                                  {subItem.label}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.link}
                    prefetch={true}
                    className={`group flex items-center px-4 py-3 transition-all duration-200 ${
                      isSidebarCollapsed ? "justify-center" : "gap-4"
                    } ${
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`text-xl ${
                        isActive ? "text-blue-600" : "group-hover:text-blue-600"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && (
                      <span className="text-lg">{item.label}</span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;