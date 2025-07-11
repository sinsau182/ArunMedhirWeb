import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "@/redux/slices/companiesSlice";
import { Input } from "@/components/ui/input";
import {
  Table,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Search, UserPlus, Trash, Edit } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";
import SuperadminHeaders from "@/components/SuperadminHeaders";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";


function SuperadminCompanies() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Companies");
  const deleteButtonRef = useRef(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
    gst: "",
    regAdd: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const { companies, loading, err } = useSelector((state) => state.companies);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getItemFromSessionStorage("token");
    if (!token) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    dispatch(fetchCompanies())
      .unwrap()
      .then((response) => {
        console.log("Companies fetched:", response);
      })
      .catch((error) => {
        toast.error("Error fetching companies:", error);
        if (error.includes("Authentication")) {
          toast.error("Session expired. Please login again");
          router.push("/login");
        } else {
          toast.error(error || "Failed to fetch companies");
        }
      });
  }, [dispatch, router]);


  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });

  const handleOpenCompanyModal = (company = null) => {
    setSelectedCompany(company);
    if (company) {
      setIsEditing(true); // Set the state to editing if a company is selected for update
      setCompanyData({
        ...company,
        colorCode: company.colorCode || "", // Ensure colorCode is included
      });
    } else {
      setIsEditing(false); // Reset to adding mode
      setCompanyData({
        name: "",
        email: "",
        phone: "",
        gst: "",
        regAdd: "",
        colorCode: "", // Initialize colorCode for new companies
      });
    }
    setIsCompanyModalOpen(true);
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setCompanyData((prevData) => {
  //     const updatedData = { ...prevData, [name]: value };

  //     // Auto-generate prefix if the company name is being updated
  //     if (name === "name" && value.length >= 3) {
  //       updatedData.prefixForEmpID = value.substring(0, 3).toUpperCase();
  //     }
  //     // Ensure prefix is always uppercase
  //     if (name === "prefixForEmpID") {
  //       updatedData.prefixForEmpID = value.toUpperCase();
  //     }

  //     return updatedData;
  //   });
  // };

  // Email validation function
  
  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setCompanyData((prevData) => {
    const updatedData = { ...prevData, [name]: value };

    // Auto-generate prefix if the company name is being updated
    if (name === "name" && value.length >= 3) {
      updatedData.prefixForEmpID = value.substring(0, 3).toUpperCase();
    }

    // Ensure prefixForEmpID is always uppercase
    if (name === "prefixForEmpID") {
      updatedData.prefixForEmpID = value.toUpperCase();
    }

    // Ensure GST is always uppercase
    if (name === "gst") {
      updatedData.gst = value.toUpperCase();
    }

    return updatedData;
  });
};

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  };

  const validateGST = (gst) => {
    const regex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return regex.test(gst);
  };

  const handleSaveCompany = async () => {
    const { name, email, phone, gst, regAdd } = companyData;

    // Validate required fields
    if (!name || !email || !phone || !gst || !regAdd) {
      setError("All fields are required!");
      return;
    }
    setError("");

    // Validate phone number
    if (!validatePhone(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError("");

    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");

    // Validate GST
    if (!validateGST(gst)) {
      setError("Please enter a valid GST number.");
      return;
    }
    setError("");

    try {
      if (isEditing) {
        // Dispatch update action with Redux
        await dispatch(
          updateCompany({ 
            id: selectedCompany.companyId, // Handle both id formats
            updatedData: companyData 
          })
        );
        toast.success("Company updated successfully!");
      } else {
        const result = await dispatch(createCompany(companyData));

        if (createCompany.fulfilled.match(result)) {
          toast.success("Company created successfully!");
        } else {
          toast.error(result.payload || "Failed to create company.");
        }
      }

      // Refetch updated list
      dispatch(fetchCompanies());

      // Close modal and reset selection
      setIsCompanyModalOpen(false);
      setSelectedCompany(null);
    } catch (error) {
      toast.error("Failed to save company data.");
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;

    try {
      await dispatch(deleteCompany(selectedCompany.id)); // Delete from backend & Redux store
      dispatch(fetchCompanies()); // Refetch the updated list
      setIsDeleteConfirmationOpen(false);
      setSelectedCompany(null);
    } catch (error) {
      toast.error("Failed to delete company.");
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company?.name?.toLowerCase().includes(searchInput.toLowerCase())
  );


  const predefinedColors = [
    "#B0E0E6", "#FFE4E1", "#F0E68C", "#E6E6FA", "#D1D5DB"
  ];

  const handleColorChange = (color) => {
    setCompanyData((prevData) => ({ ...prevData, colorCode: color }));
  };

  return (
    <div className="bg-white text-[#4a4a4a] max-h-screen">
      <SuperadminHeaders />
      <div className="p-5">
        <div className="mt-6 p-4 rounded-lg bg-white">
          <div className="mt-4 p-4 rounded-lg flex justify-between items-center">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-1.5 text-gray-800 border border-gray-500 rounded-lg bg-white"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
              />
            </div>
            <div className="flex space-x-10 mr-16">
              <div className="flex flex-col items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105">
                <UserPlus
                  size={32}
                  className="text-[#4a4a4a] p-1 rounded-md"
                  onClick={() => handleOpenCompanyModal()}
                />
                <span className="text-xs text-[#4a4a4a]">Add</span>
              </div>
              <div
                ref={deleteButtonRef}
                className={`flex flex-col items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${
                  selectedCompany ? "" : "opacity-20 pointer-events-none"
                }`}
              >
                <Edit
                  size={32}
                  className="text-[#4a4a4a] p-1 rounded-md"
                  onClick={() => handleOpenCompanyModal(selectedCompany)}
                />
                <span className="text-xs text-[#4a4a4a]">Edit</span>
              </div>
              <div
                ref={deleteButtonRef}
                className={`flex flex-col items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${
                  selectedCompany ? "" : "opacity-20 pointer-events-none"
                }`}
              >
                <Trash
                  size={32}
                  className="text-[#4a4a4a] p-1 rounded-md"
                  onClick={() => setIsDeleteConfirmationOpen(true)}
                />
                <span className="text-xs text-[#4a4a4a]">Delete</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-2 rounded-lg">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : err ? (
              <div className="text-center text-red-500 py-4">{err}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#E2E8F0]">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider w-1/5">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider w-1/5">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider w-1/5">
                        Phone
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider w-1/5">
                        GST
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider w-1/5">
                        Register Add.
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider w-1/5">
                        Company Prefix
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCompanies.map((company) => (
                      <tr 
                        key={company._id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedCompany?._id === company._id ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => setSelectedCompany(company)}
                      >
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          {company.name}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          {company.email}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          {company.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          {company.gst}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          {company.regAdd}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          {company.prefixForEmpID}
                        </td>
                      </tr>
                    ))}
                    {filteredCompanies.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No companies found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCompanyModalOpen}
        onClose={() => {
          setIsCompanyModalOpen(false);
          setSelectedCompany(null);
        }}
      >
        <div className="p-6 bg-gray-200 text-[#4a4a4a] rounded-lg flex flex-col items-center justify-center">
          <div className="relative w-full flex justify-center -mt-4">
            <h2 className="text-2xl font-thin tracking-wide">
              {isEditing ? "Update" : "Add"} Company
            </h2>
            <button
              onClick={() => {
                setIsCompanyModalOpen(false);
                setSelectedCompany(null);
              }}
              className="absolute right-0 text-gray-500 hover:text-gray-800 mt-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="w-full space-y-4 mt-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={companyData.name}
                onChange={handleInputChange}
                placeholder="Enter company name"
                className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
              />
            </div>
            
             

            <div>
              <label htmlFor="prefixForEmpID" className="block text-sm font-medium text-gray-700 mb-1">
                Company Prefix <span className="text-red-500">*</span>
              </label>
              <Input
                id="preprefixForEmpIDfix"
                name="prefixForEmpID"
                value={companyData.prefixForEmpID || ""}
                onChange={handleInputChange}
                placeholder="Enter company prefix"
                className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose Company Color <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                      companyData.colorCode === color ? "border-black" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  ></div>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                value={companyData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="phone"
                name="phone"
                value={companyData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
              />
            </div>
            
            <div>
              <label htmlFor="gst" className="block text-sm font-medium text-gray-700 mb-1">
                GST Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="gst"
                name="gst"
                value={companyData.gst}
                onChange={handleInputChange}
                placeholder="Enter GST number"
                className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
              />
            </div>
            
            <div>
              <label htmlFor="regAdd" className="block text-sm font-medium text-gray-700 mb-1">
                Registered Address <span className="text-red-500">*</span>
              </label>
              <Input
                id="regAdd"
                name="regAdd"
                value={companyData.regAdd}
                onChange={handleInputChange}
                placeholder="Enter registered address"
                className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
              />
            </div>
          </div>
          
          {error && <p className="text-red-600 mt-2">{error}</p>}
          
          <Button
            onClick={() => {
              handleSaveCompany();
              setSelectedCompany(null);
            }}
            className="mt-6 bg-green-600 text-white"
          >
            {isEditing ? "Update" : "Add"} Company
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteConfirmationOpen}
        onClose={() => {
          setIsDeleteConfirmationOpen(false);
          setSelectedCompany(null);
        }}
      >
        <div className="p-6 bg-gray-200 text-[#4a4a4a] rounded-lg flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold">
            Are you sure you want to delete this company?
          </h3>
          <div className="mt-4">
            <Button
              onClick={handleDeleteCompany}
              className="bg-red-600 text-white"
            >
              Yes, Delete
            </Button>
            <Button
              onClick={() => {
                setIsDeleteConfirmationOpen(false);
                setSelectedCompany(null);
              }}
              className="ml-4 bg-gray-600 text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(SuperadminCompanies);