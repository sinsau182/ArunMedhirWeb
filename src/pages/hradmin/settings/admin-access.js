import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import withAuth from "@/components/withAuth";
import HradminNavbar from "@/components/HradminNavbar";
import Sidebar from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { UserMinus, UserPlus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";
import getConfig from "next/config";

function AdminAccess() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedAccessType, setSelectedAccessType] = useState(null);
  const [userToUnassign, setUserToUnassign] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAssignConfirmModalOpen, setIsAssignConfirmModalOpen] =
    useState(false);
  const [usersToAssignInfo, setUsersToAssignInfo] = useState([]);
  const {publicRuntimeConfig} = getConfig();

  // Define available access types
  const ACCESS_TYPES = [
    { id: "hr_admin", label: "HR Admin Access" },
    // Add other access types here if needed in the future
  ];

    // Fetch users for selected company
    const fetchUsers = useCallback( async (companyId) => {
      try {
        setLoading(true);
        const token = getItemFromSessionStorage("token", null);
        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/hradmin/companies/${companyId}/employees`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data); // Store the full user objects
          setError("");
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (error) {
        toast.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
      }
    }, [publicRuntimeConfig.apiURL]);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = getItemFromSessionStorage("token", null);
        const employeeId = sessionStorage.getItem("employeeId");
        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/hradmin/companies/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          setCompanies(response.data);
          // Set the first company as default
          setSelectedCompany(response.data[0]);
          fetchUsers(response.data[0].companyId);
        }
      } catch (error) {
        toast.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, [fetchUsers, publicRuntimeConfig.apiURL]);

  // Handle company selection
  const handleCompanyChange = (companyId) => {
    const selected = companies.find(
      (company) => company.companyId === companyId
    );
    if (selected) {
      setSelectedCompany(selected);
      setSelectedUsers([]);
      fetchUsers(companyId);
    }
  };

  // Handle user selection (for ASSIGNING)
  const handleUserSelectForAssign = (user) => {
    if (user.roles.includes("HRADMIN")) return; // Prevent assigning role to an already admin user

    setUsersToAssignInfo([user]); // Set the user to assign
    setIsAssignConfirmModalOpen(true); // Open the confirmation modal
  };

  // Handle clicking an existing admin (for UNASSIGNING)
  const handleUserClickForUnassign = (user) => {
    if (!user.roles.includes("HRADMIN")) return; // Prevent removing role from a non-admin user

    setUserToUnassign(user); // Set the user to unassign
    setIsConfirmModalOpen(true); // Open the confirmation modal
  };

  // Handle the actual assignment after confirmation
  const confirmAssignAdmin = async () => {
    if (usersToAssignInfo.length === 0) return;

    const user = usersToAssignInfo[0];
    try {
      const token = getItemFromSessionStorage("token", null);
      // Use the selected company from local state instead of sessionStorage
      const companyId = sessionStorage.getItem("currentCompanyId");

      const response = await axios.put(
        `${publicRuntimeConfig.apiURL}/hradmin/employees/${user.employeeId}/roles`,
        {
          roles: ["HRADMIN"],
          operation: "Add",
          companyId: companyId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.employeeId === user.employeeId
              ? { ...u, roles: [...u.roles, "HRADMIN"] }
              : u
          )
        );
        setSuccessMessage("HR Admin role assigned successfully!");
      }
    } catch (error) {
      toast.error("Error assigning HR Admin role:", error);
      setError("Failed to assign HR Admin role. Please try again.");
    } finally {
      setIsAssignConfirmModalOpen(false);
    }
  };

  // Handle unassign admin
  const confirmUnassignAdmin = async () => {
    if (!userToUnassign) return;

    try {
      const token = getItemFromSessionStorage("token", null);
      // Use the selected company from local state instead of sessionStorage
      const companyId = sessionStorage.getItem("currentCompanyId");

      const response = await axios.put(
        `${publicRuntimeConfig.apiURL}/hradmin/employees/${userToUnassign.employeeId}/roles`,
        {
          roles: ["HRADMIN"],
          operation: "Remove",
          companyId: companyId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.employeeId === userToUnassign.employeeId
              ? { ...u, roles: u.roles.filter((role) => role !== "HRADMIN") }
              : u
          )
        );
        setSuccessMessage("HR Admin role removed successfully!");
      }
    } catch (error) {
      toast.error("Error removing HR Admin role:", error);
      setError("Failed to remove HR Admin role. Please try again.");
    } finally {
      setIsConfirmModalOpen(false);
      setUserToUnassign(null);
    }
  };

  // Filter users based on search input
  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase() || '').includes(searchInput.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchInput.toLowerCase())
  );

  const usersWithAdminFlag = users.map((user) => ({
    ...user,
    isAdmin: user.roles?.includes("HRADMIN") || false,
  }));

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        }`}
      >
        <HradminNavbar />
        <main className="flex-1 px-6 pt-24 pb-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  Grant Admin Access
                </h1>
                <div className="flex items-center gap-2">
                  {/* <label className="text-sm font-medium text-gray-700">
                    Select Company
                  </label> */}
                  <Select onValueChange={handleCompanyChange} className="w-[200px]">
                    <SelectTrigger>
                      {selectedCompany
                        ? selectedCompany.companyName
                        : "Select a company"}
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem
                          key={company.companyId}
                          value={company.companyId}
                        >
                          {company.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* User Search and Selection List */}
              {selectedCompany && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>

                  {/* Table Container with Fixed Height and Sticky Header */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[calc(100vh-400px)] overflow-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                              Name & Email
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {loading ? (
                            <tr>
                              <td colSpan="2" className="px-4 py-4 text-center text-gray-500">
                                Loading users...
                              </td>
                            </tr>
                          ) : filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan="2" className="px-4 py-4 text-center text-gray-500">
                                No users found
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((user) => (
                              <tr
                                key={user.employeeId}
                                className={`hover:bg-gray-50 cursor-pointer ${
                                  selectedUsers.includes(user.employeeId) &&
                                  !user.roles.includes("HRADMIN")
                                    ? "bg-blue-50"
                                    : ""
                                }`}
                                onClick={() =>
                                  user.roles.includes("HRADMIN")
                                    ? handleUserClickForUnassign(user)
                                    : handleUserSelectForAssign(user)
                                }
                              >
                                <td className="px-4 py-4">
                                  <p className="font-medium text-gray-900">
                                    {user.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {user.emailPersonal}
                                  </p>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  {user.roles.includes("HRADMIN") ? (
                                    <Badge variant="destructive">HR Admin</Badge>
                                  ) : selectedUsers.includes(user.employeeId) ? (
                                    <div className="w-4 h-4 bg-blue-500 rounded-full ml-auto" />
                                  ) : null}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCompany(null);
                        setSelectedUsers([]);
                        setSearchInput("");
                        setSelectedAccessType(null);
                      }}
                    >
                      Cancel
                    </Button>
                    {selectedUsers.length > 0 && (
                      <Button
                        onClick={() => {
                          setSelectedAccessType(ACCESS_TYPES[0].id);
                        }}
                        disabled={!selectedCompany || !selectedAccessType}
                      >
                        Assign Admin Access
                      </Button>
                    )}
                  </div>

                  {/* Messages */}
                  {error && (
                    <div className="text-red-500 text-sm mt-2">{error}</div>
                  )}
                  {successMessage && (
                    <div className="text-green-500 text-sm mt-2">
                      {successMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal for Unassign */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      >
        <div className="p-6 bg-white text-black rounded-lg shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <UserMinus className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">
            Confirm Unassign
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Are you sure you want to revoke HR Admin access for{" "}
            {userToUnassign?.name}?
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmUnassignAdmin}>
              Yes, Unassign
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Assign */}
      <Modal
        isOpen={isAssignConfirmModalOpen}
        onClose={() => setIsAssignConfirmModalOpen(false)}
      >
        <div className="p-6 bg-white text-black rounded-lg shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <UserPlus className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">
            Confirm Assignment
          </h2>
          <p className="text-center text-gray-600 mb-2">
            Are you sure you want to grant HR Admin access to the following user(s)?
          </p>
          <ul className="list-disc list-inside text-center text-gray-700 mb-6 max-h-40 overflow-y-auto">
            {usersToAssignInfo.map((user) => (
              <li key={user.employeeId}>{user.name}</li>
            ))}
          </ul>
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsAssignConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmAssignAdmin}>Yes, Assign</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(AdminAccess);
