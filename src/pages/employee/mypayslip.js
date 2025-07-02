import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { Download, CalendarIcon } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import withAuth from "@/components/withAuth";
import { toast } from "sonner";
import { fetchPayslipDetails, fetchEmployeeDetails, resetPayslipState } from "@/redux/slices/payslipSlice";
import { fetchOneEmployeeAttendanceOneMonth } from "@/redux/slices/attendancesSlice";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/HradminNavbar";

const downloadPDF = () => {
  const content = document.getElementById("pdf-content");

  if (!content) return;

  html2canvas(content, { scale: 2 }).then((canvas) => {
    const pdf = new jsPDF("p", "mm", [210, 210]); // A5 size (width: 148mm, height: 210mm)

    const pageWidth = 210; // A5 width in mm
    const pageHeight = 210; // A5 height in mm
    const margin = 10; // Margin from all sides

    const imgWidth = pageWidth - 2 * margin; // Adjust width to fit within margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

    let yPosition = margin;

    // Ensure image fits within A5 height, otherwise split into multiple pages
    if (imgHeight > pageHeight - 2 * margin) {
      let position = margin;
      while (position < imgHeight) {
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          margin,
          position,
          imgWidth,
          imgHeight
        );
        position += pageHeight - 2 * margin; // Move to next page
        if (position < imgHeight) pdf.addPage();
      }
    } else {
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin,
        yPosition,
        imgWidth,
        imgHeight
      );
    }

    pdf.save("Payslip_Medhir.pdf");
  });
};

const currentYear = new Date().getFullYear();
const currentMonthIndex = new Date().getMonth(); // 0-based index (0 = Jan, 11 = Dec)
const currentDate = new Date().getDate();
const latestMonthIndex = currentDate > 10 
  ? Math.max(0, currentMonthIndex - 1) 
  : Math.max(0, currentMonthIndex - 2); // Adjust based on current date
const monthsList = Array.from({ length: latestMonthIndex + 1 }, (_, i) =>
  new Date(currentYear, i).toLocaleString("default", { month: "long" })
);

const groupedPayrolls = { [currentYear]: monthsList };

const PayrollPage = () => {
  const dispatch = useDispatch();
  const { payslipData, employeeData, loading, error } = useSelector((state) => state.payslip);
  const { attendance } = useSelector((state) => state.attendances);

  console.log(attendance);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(monthsList[latestMonthIndex]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dateOfJoining, setDateOfJoining] = useState(null);

  const employeeId = sessionStorage.getItem("employeeId"); // Retrieve the employee ID from sessionStorage

  useEffect(() => {
    // Fetch employee details to get date of joining
    dispatch(fetchEmployeeDetails(employeeId));

    dispatch(fetchOneEmployeeAttendanceOneMonth({ month: selectedMonth.slice(0, 3), year: selectedYear, employeeId }));
    // Fetch payslip details for the latest month
    dispatch(fetchPayslipDetails({ 
      employeeId, 
      month: selectedMonth, 
      year: selectedYear 
    }));
    
    // Cleanup function to reset state when component unmounts
    return () => {
      dispatch(resetPayslipState());
    };
  }, [dispatch, employeeId, selectedMonth, selectedYear]);

  // Update date of joining when employee data is fetched
  useEffect(() => {
    if (employeeData) {
      setDateOfJoining(employeeData.joiningDate);
    }
  }, [employeeData]);

  // Update payslip data when month or year changes
  useEffect(() => {
    dispatch(fetchPayslipDetails({ 
      employeeId, 
      month: selectedMonth, 
      year: selectedYear 
    }));
  }, [dispatch, employeeId, selectedMonth, selectedYear]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  const handleMonthSelection = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsCalendarOpen(false);
  };

  const formattedDateOfJoining = (date) => {
    if (!date) return "N/A";
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0"); // Ensures two-digit day
    const month = d.toLocaleString("en-GB", { month: "short" }); // Short month name
    const year = d.getFullYear().toString().slice(-2); // Last two digits of year

    return `${day}-${month}-${year}`;
  };

  // Update groupedPayrolls based on date of joining
  if (dateOfJoining) {
    const joiningDate = new Date(dateOfJoining);
    const joiningYear = joiningDate.getFullYear();
    const joiningMonthIndex = joiningDate.getMonth(); // 0-based index (0 = Jan, 11 = Dec)

    // Update groupedPayrolls to start from the joining month
    if (joiningYear === currentYear) {
      groupedPayrolls[currentYear] = monthsList.slice(joiningMonthIndex);
    } else if (joiningYear < currentYear) {
      groupedPayrolls[joiningYear] = Array.from(
        { length: 12 - joiningMonthIndex },
        (_, i) =>
          new Date(joiningYear, joiningMonthIndex + i).toLocaleString(
            "default",
            {
              month: "long",
            }
          )
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        } transition-all duration-300`}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">My Payslips</h1>
          <div className="flex items-center gap-4">
              <div className="relative">
                <Badge
                  variant="outline"
                  className="w-[160px] h-[40px] px-4 py-3 cursor-pointer bg-white border border-gray-600 rounded-md flex items-center justify-center bg-gray-100"
                  onClick={toggleCalendar}
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {selectedYear}-{selectedMonth}
                </Badge>

                {isCalendarOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {Object.entries(groupedPayrolls)
                      .sort(([b], [a]) => b - a)
                      .map(([year, months]) => (
                        <div key={year} className="border-b-2">
                          <div className="px-4 py-2 bg-gray-400 font-medium">
                            {year}
                          </div>
                          <ul className="py-2">
                            {months.map((month) => (
                              <li
                                key={month}
                                className={`px-4 py-2 cursor-pointer ${
                                  month === selectedMonth &&
                                  parseInt(year) === selectedYear
                                    ? "bg-gray-300 font-semibold"
                                    : "hover:bg-gray-200"
                                }`}
                                onClick={() => {
                                  handleMonthSelection(month, parseInt(year));
                                }}
                              >
                                {month}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <Button
                variant="default"
                className="flex items-center"
                onClick={downloadPDF}
                disabled={!payslipData}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
          </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            ) : payslipData ? (
              <div className="max-w-7xl mx-auto bg-white shadow-lg overflow-y-auto h-[calc(86vh-62px)] custom-scrollbar">
                <div id="pdf-content">
              {/* Payslip Content */}
              <div className="p-0">
                  {/* Header */}
                <div className="bg-gray-600 text-white text-center py-4">
                  <h1 className="text-xl font-bold">
                    PAYSLIP for the Month of {selectedMonth}-{selectedYear}
                    </h1>
                  </div>

                {/* Employee Details Table */}
                <table className="w-full border-collapse border border-gray-400">
                          <tbody>
                    <tr>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100 w-1/4">Name</td>
                      <td className="border border-gray-400 p-3 w-1/4">{employeeData?.employeeName || 'N/A'}</td>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100 w-1/4">EMP ID</td>
                      <td className="border border-gray-400 p-3 w-1/4">{employeeData?.employeeId || 'N/A'}</td>
                            </tr>
                    <tr>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100">Date of Joining</td>
                      <td className="border border-gray-400 p-3">{formattedDateOfJoining(dateOfJoining)}</td>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100">Designation</td>
                      <td className="border border-gray-400 p-3">{employeeData?.designation || 'N/A'}</td>
                            </tr>
                    <tr>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100">PAN</td>
                      <td className="border border-gray-400 p-3">{employeeData?.pan || 'NA'}</td>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100">UAN Number</td>
                      <td className="border border-gray-400 p-3">{employeeData?.uanNumber || 'N/A'}</td>
                            </tr>
                  </tbody>
                </table>

                {/* Spacer */}
                <div className="h-4"></div>

                {/* Attendance Details Table */}
                <table className="w-full border-collapse border border-gray-400">
                  <tbody>
                    <tr>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100 w-1/4">Days in Month</td>
                      <td className="border border-gray-400 p-3 w-1/4">{payslipData?.daysInMonth || 30}</td>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100 w-1/4">Salary Paid for Days</td>
                      <td className="border border-gray-400 p-3 w-1/4">{payslipData?.salaryPaidDays || attendance?.presentDays || 0}</td>
                            </tr>
                    <tr>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100">Leaves Taken</td>
                      <td className="border border-gray-400 p-3">{payslipData?.leavesTaken || attendance?.leavesTaken || 0}</td>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100">Loss of Pay Days</td>
                      <td className="border border-gray-400 p-3">{payslipData?.lossOfPayDays || 0}</td>
                            </tr>
                    <tr>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100">Annual Leaves Earned</td>
                      <td className="border border-gray-400 p-3">{payslipData?.annualLeavesEarned || 1.5}</td>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100">Comp-off Leaves Earned</td>
                      <td className="border border-gray-400 p-3">{payslipData?.compOffLeavesEarned || 0}</td>
                            </tr>
                    <tr>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100">Old Leaves Balance</td>
                      <td className="border border-gray-400 p-3">{payslipData?.oldLeavesBalance || ''}</td>
                      <td className="border border-gray-400 p-3 font-semibold bg-gray-100">New Leaves Balance</td>
                      <td className="border border-gray-400 p-3">{payslipData?.newLeavesBalance || ''}</td>
                            </tr>
                          </tbody>
                        </table>

                {/* Spacer */}
                <div className="h-4"></div>

                {/* Earnings and Deductions Table */}
                <table className="w-full border-collapse border border-gray-400">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-400 p-3 text-left font-semibold">Earnings</th>
                      <th className="border border-gray-400 p-3 text-center font-semibold">Per Month</th>
                      <th className="border border-gray-400 p-3 text-center font-semibold">This Month</th>
                      <th className="border border-gray-400 p-3 text-left font-semibold">Deductions</th>
                      <th className="border border-gray-400 p-3 text-center font-semibold">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                    {/* Dynamically generate rows based on the larger of earnings or deductions */}
                    {Array.from({ 
                      length: Math.max(
                        (payslipData.earnings || []).length, 
                        (payslipData.deductions || []).length,
                        6 // Minimum 6 rows to match the design
                      ) 
                    }).map((_, index) => {
                      const earning = (payslipData.earnings || [])[index];
                      const deduction = (payslipData.deductions || [])[index];
                      
                      return (
                        <tr key={index}>
                          <td className="border border-gray-400 p-3">
                            {earning ? earning.description : ''}
                              </td>
                          <td className="border border-gray-400 p-3 text-right">
                            {earning ? (earning.perMonth || earning.amount || 0).toFixed(0) : ''}
                              </td>
                          <td className="border border-gray-400 p-3 text-right">
                            {earning ? (earning.amount || 0).toFixed(0) : ''}
                              </td>
                          <td className="border border-gray-400 p-3">
                            {deduction ? deduction.description : ''}
                              </td>
                          <td className="border border-gray-400 p-3 text-right">
                            {deduction ? (deduction.amount || 0).toFixed(0) : ''}
                              </td>
                            </tr>
                      );
                    })}
                    
                    {/* Total Row */}
                    <tr className="bg-gray-100 font-semibold">
                      <td className="border border-gray-400 p-3">Total</td>
                      <td className="border border-gray-400 p-3 text-right">{(payslipData?.totalEarnings || 0).toFixed(0)}</td>
                      <td className="border border-gray-400 p-3 text-right">{(payslipData?.totalEarnings || 0).toFixed(0)}</td>
                      <td className="border border-gray-400 p-3">Total</td>
                      <td className="border border-gray-400 p-3 text-right">{(payslipData?.totalDeductions || 0).toFixed(0)}</td>
                            </tr>
                    
                    {/* Net Salary Row */}
                    <tr className="bg-gray-200 font-bold">
                      <td className="border border-gray-400 p-3" colSpan="3">Net Salary</td>
                      <td className="border border-gray-400 p-3 text-right" colSpan="2">
                        {(payslipData?.netSalary || 0).toFixed(0)}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                {/* Footer */}
                <div className="mt-6 text-xs text-gray-500 text-center">
                  <p>This is a computer-generated payslip and does not require a signature.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No payslip data available for the selected period.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default withAuth(PayrollPage);
