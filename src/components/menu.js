import {
  FaUsers,
  FaMoneyCheckAlt,
  FaCog,
  FaBuilding,
  FaCalendarAlt,
  FaTasks,
  FaUserTie,
} from "react-icons/fa";
import {
  Briefcase,
  Calendar,
  ChartColumnIncreasing,
  Clock,
  CreditCard,
  ReceiptIcon,
  Users,
  Wallet,
} from "lucide-react";

// Define menu items based on the role
export const menuItems = [
  {
    label: "Dashboard",
    icon: <ChartColumnIncreasing />,
    link: "/hradmin/dashboard",
    roles: ["HRADMIN"],
  },
  {
    label: "Employees",
    icon: <Users />,
    link: "/hradmin/employees",
    roles: ["HRADMIN"],
  },
  {
    label: "Attendance",
    icon: <Clock />,
    link: "/hradmin/attendance",
    roles: ["HRADMIN"],
  },
  {
    label: "Payroll",
    icon: <ReceiptIcon />,
    link: "/hradmin/payroll",
    roles: ["HRADMIN"],
  },
  {
    label: "Settings",
    icon: <FaCog />,
    roles: ["HRADMIN"],
    hasSubmenu: true,
    menuKey: "settings",
    subItems: [
      {
        label: "Organization",
        icon: <FaBuilding />,
        link: "/hradmin/settings/organization",
      },
      {
        label: "Payroll",
        icon: <FaMoneyCheckAlt />,
        link: "/hradmin/settings/payrollsettings",
      },
      {
        label: "Leaves",
        icon: <FaCalendarAlt />,
        link: "/hradmin/settings/leave",
      },
      {
        label: "Admin Access",
        icon: <FaUsers />,
        link: "/hradmin/settings/admin-access",
      }
    ],
  },

  {
    label: "Dashboard",
    icon: <ChartColumnIncreasing />,
    link: "/manager/dashboard",
    roles: ["MANAGER"],
  },
  {
    label: "Team",
    icon: <Briefcase />,
    link: "/manager/team",
    roles: ["MANAGER"],
  },
  {
    label: "Attendance",
    icon: <Clock />,
    link: "/manager/attendance",
    roles: ["MANAGER"],
  },
  {
    label: "Lead Management",
    icon: <FaTasks />,
    link: "/manager/leads",
    roles: ["MANAGER"],
  },

  {
    label: "Dashboard",
    icon: <ChartColumnIncreasing />,
    link: "/employee/dashboard",
    roles: ["EMPLOYEE"],
  },
  {
    label: "Leave",
    icon: <Calendar />,
    link: "/employee/leaves",
    roles: ["EMPLOYEE"],
  },
  {
    label: "Attendance",
    icon: <Clock />,
    link: "/employee/attendances",
    roles: ["EMPLOYEE"],
  },
  {
    label: "My Payslips",
    icon: <ReceiptIcon />,
    link: "/employee/mypayslip",
    roles: ["EMPLOYEE"],
  },
  {
    label: "Lead Management",
    icon: <FaTasks />,
    link: "/employee/leads",
    roles: ["EMPLOYEE"],
  },

  {
    label: "Lead Management",
    icon: <FaTasks />,
    link: "/Sales/LeadManagement",
    roles: ["SALES"],
  },
  {
    label: "Manager",
    icon: <FaUsers />,
    link: "/Sales/Manager",
    roles: ["SALES"],
  },

  // Add Account Admin items
  {
    label: "Customers",
    icon: <FaUsers />,
    link: "/account/customers",
    roles: ["ACCOUNTANT"],
  },
  {
    label: "Vendor",
    icon: <FaBuilding />,
    link: "/account/vendor",
    roles: ["ACCOUNTANT"],
  },
  {
    label: "Employee",
    icon: <FaUserTie />,
    link: "/account/employee",
    roles: ["ACCOUNTANT"],
  },

  // Add Project Admin items
  {
    label: "Expenses",
    icon: <ReceiptIcon />,
    link: "/project_Manager/expense",
    roles: ["PROJECTMANAGER"],
  },
  {
    label: "Income",
    icon: <Wallet />,
    link: "/project_Manager/income",
    roles: ["PROJECTMANAGER"],
  },
];

// Add display mapping for roles
export const roleDisplayLabels = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  HRADMIN: "HR Admin",
  SALES: "Sales Employee",
  ACCOUNTADMIN: "Accountant",
  PROJECTADMIN: "Project Admin",
  ACCOUNTANT: "Accountant",
  PROJECTMANAGER: "Project Manager"
}; 