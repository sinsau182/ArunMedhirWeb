import React, { useState, useEffect } from "react";
import withAuth from "@/components/withAuth";
import HradminNavbar from "@/components/HradminNavbar";
import Sidebar from "@/components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchOneEmployeeAttendanceOneMonth } from "@/redux/slices/attendancesSlice";
import {
  applyLeave,
  applyCompOffLeave,
  fetchLeaveHistory,
} from "@/redux/slices/leaveSlice";
import { fetchLeaveBalance } from "@/redux/slices/leaveBalanceSlice";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Plane, PlusCircle } from "lucide-react";
import ApplyLeaveModal from "@/components/modals/ApplyLeaveModal";
import ApplyCompOffModal from "@/components/modals/ApplyCompOffModal";
import AttendanceTab from "@/components/employee/attendance/AttendanceTab";
import LeaveTab from "@/components/employee/attendance/LeaveTab";

// --- ENRICHED DUMMY DATA FOR DEVELOPMENT ---

const dummyLeaveBalance = {
  leaveCarriedForward: 5.0,
  earnedLeave: 12.0,
  compOffCarriedForward: 2.0,
  compOffEarned: 1.0,
  leavesTaken: 4.5,
  newLeaveBalance: 15.5 // Now a healthy positive balance
};

const dummyLeaveHistory = [
  { id: 1, leaveType: 'Casual Leave', startDate: '2024-07-15', endDate: '2024-07-15', reason: 'Personal work', status: 'Approved' },
  { id: 2, leaveType: 'Sick Leave', startDate: '2024-06-20', endDate: '2024-06-21', reason: 'Fever', status: 'Approved' },
  { id: 3, leaveType: 'Earned Leave', startDate: '2024-05-10', endDate: '2024-05-15', reason: 'Vacation', status: 'Pending' },
  { id: 4, leaveType: 'Casual Leave', startDate: '2024-04-01', endDate: '2024-04-01', reason: 'Bank work', status: 'Rejected' },
];

const dummyAttendance = {
    // Detailed daily log for July
    attendanceData: [
        { date: '2024-07-01', status: 'Present', checkIn: '09:30 AM', checkOut: '06:15 PM', totalHours: '8h 45m' },
        { date: '2024-07-02', status: 'Present', checkIn: '09:25 AM', checkOut: '06:05 PM', totalHours: '8h 40m' },
        { date: '2024-07-03', status: 'Late', checkIn: '10:15 AM', checkOut: '06:30 PM', totalHours: '8h 15m' },
        { date: '2024-07-04', status: 'Present', checkIn: '09:28 AM', checkOut: '06:00 PM', totalHours: '8h 32m' },
        { date: '2024-07-05', status: 'Half Day', checkIn: '09:30 AM', checkOut: '01:30 PM', totalHours: '4h 00m' },
        { date: '2024-07-06', status: 'Weekend' },
        { date: '2024-07-07', status: 'Weekend' },
        { date: '2024-07-08', status: 'Present', checkIn: '09:20 AM', checkOut: '06:10 PM', totalHours: '8h 50m' },
        { date: '2024-07-09', status: 'Present', checkIn: '09:35 AM', checkOut: '06:15 PM', totalHours: '8h 40m' },
        { date: '2024-07-10', status: 'Missed Punch', checkIn: '09:40 AM', checkOut: null, totalHours: 'N/A' },
        { date: '2024-07-11', status: 'Present', checkIn: '09:22 AM', checkOut: '06:02 PM', totalHours: '8h 40m' },
        { date: '2024-07-12', status: 'Present', checkIn: '09:31 AM', checkOut: '06:01 PM', totalHours: '8h 30m' },
        { date: '2024-07-13', status: 'Weekend' },
        { date: '2024-07-14', status: 'Weekend' },
        { date: '2024-07-15', status: 'On Leave' },
        { date: '2024-07-16', status: 'Present', checkIn: '09:29 AM', checkOut: '06:05 PM', totalHours: '8h 36m' },
        { date: '2024-07-17', status: 'Late', checkIn: '10:05 AM', checkOut: '06:20 PM', totalHours: '8h 15m' },
        { date: '2024-07-18', status: 'Present', checkIn: '09:30 AM', checkOut: '06:00 PM', totalHours: '8h 30m' },
        { date: '2024-07-19', status: 'Absent' },
    ],
    // The summary arrays can be derived from attendanceData, but we keep them for simplicity
    presentDates: ['2024-07-01', '2024-07-02', '2024-07-04', '2024-07-08', '2024-07-09', '2024-07-11', '2024-07-12', '2024-07-16', '2024-07-18'],
    absentDates: ['2024-07-19'],
    fullLeaveDates: ['2024-07-15'],
};

// ------------------------------------

const isSameDate = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const EmployeeAttendanceAndLeave = () => {
  const dispatch = useDispatch();
  
  // --- Data Selectors (Using Dummy Data) ---
  // To switch to live data, comment out these lines and uncomment the useSelector hooks below.
  const attendance = dummyAttendance;
  const attendanceLoading = false;
  const leaveBalance = dummyLeaveBalance;
  const leaveBalanceLoading = false;
  const leaveHistory = { leaveHistory: dummyLeaveHistory };
  const historyLoading = false;

  /*
  // --- LIVE DATA HOOKS ---
  const { attendance, loading: attendanceLoading } = useSelector((state) => state.attendances);
  const { balance: leaveBalance, loading: leaveBalanceLoading } = useSelector((state) => state.leaveBalance);
  const { history: leaveHistory, historyLoading } = useSelector((state) => state.leave);
  */
  
  const [holidays] = useState([
    { date: "2024-08-15", name: "Independence Day" },
    { date: "2024-10-02", name: "Gandhi Jayanti" },
  ]);

  // --- State Management ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("attendance");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('Jul'); // Set to July for dummy data
  
  const [multiSelectedDates, setMultiSelectedDates] = useState([]);
  
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);
  const [initialDatesForModal, setInitialDatesForModal] = useState([]);
  
  const employeeId =
    typeof window !== "undefined" ? sessionStorage.getItem("employeeId") : null;

  // Data fetching useEffect can be commented out when using dummy data
  /*
  useEffect(() => {
    if (employeeId) {
      dispatch(fetchOneEmployeeAttendanceOneMonth({ employeeId, month: selectedMonth, year: selectedYear }));
      dispatch(fetchLeaveBalance(employeeId));
      dispatch(fetchLeaveHistory());
    }
  }, [dispatch, employeeId, selectedMonth, selectedYear]);
  */

  // --- Handlers ---
  const handleDateClick = (dayData) => {
    const clickedDate = dayData.date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (clickedDate >= today && dayData.status !== "Weekend" && dayData.status !== "Holiday") {
      setMultiSelectedDates((currentSelected) => {
        const isAlreadySelected = currentSelected.some((d) => isSameDate(d, clickedDate));
        return isAlreadySelected
          ? currentSelected.filter((d) => !isSameDate(d, clickedDate))
          : [...currentSelected, clickedDate];
      });
    } else {
      toast.info("You can only select future working days to apply for leave.");
    }
  };

  const clearSelection = () => setMultiSelectedDates([]);

  const handleOpenLeaveModal = (dates) => {
    setInitialDatesForModal(dates);
    setIsLeaveModalOpen(true);
  };

  const handleOpenCompOffModal = (dates) => {
    setInitialDatesForModal(dates);
    setIsCompOffModalOpen(true);
  };

  const handleSubmitLeave = async (leaveForm) => {
    const leaveData = {
      leaveDates: leaveForm.dates.map((d) => ({ date: d.date.toISOString().split("T")[0], shiftType: d.shiftType })),
      reason: leaveForm.reason,
    };
    const result = await dispatch(applyLeave(leaveData));
    if (applyLeave.fulfilled.match(result)) {
      toast.success("Leave applied successfully!");
      setIsLeaveModalOpen(false);
      dispatch(fetchLeaveBalance(employeeId));
      dispatch(fetchLeaveHistory());
    } else {
      toast.error(result.error.message || "Failed to apply for leave.");
    }
  };

  const handleSubmitCompOff = async (compOffForm) => {
    const compOffData = {
      leaveDates: compOffForm.dates.map((d) => d.date.toISOString().split("T")[0]),
      shiftType: compOffForm.dates[0]?.timeSlot || compOffForm.dates[0]?.shiftType || "FULL_DAY",
      reason: compOffForm.description,
    };
    const result = await dispatch(applyCompOffLeave(compOffData));
    if (applyCompOffLeave.fulfilled.match(result)) {
      toast.success("Comp-off application submitted successfully");
      setIsCompOffModalOpen(false);
      dispatch(fetchLeaveBalance(employeeId));
      dispatch(fetchLeaveHistory());
    } else {
      toast.error(result.error.message || "Failed to apply for comp-off.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ApplyLeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmit={handleSubmitLeave}
        initialDates={initialDatesForModal}
        leaveBalance={leaveBalance?.newLeaveBalance}
      />
      <ApplyCompOffModal
        isOpen={isCompOffModalOpen}
        onClose={() => setIsCompOffModalOpen(false)}
        onSubmit={handleSubmitCompOff}
      />

      <Sidebar isSidebarCollapsed={isSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <HradminNavbar
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="p-6 pt-20">
          <div className="flex justify-between items-center mb-6">
                  <div>
              <h1 className="text-3xl font-bold">Time & Attendance</h1>
              <p className="text-gray-500">Manage your attendance and leave requests.</p>
                  </div>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attendance"><Calendar className="mr-2 h-4 w-4" /> Attendance</TabsTrigger>
              <TabsTrigger value="leave"><Plane className="mr-2 h-4 w-4" /> Leave Management</TabsTrigger>
            </TabsList>
            <TabsContent value="attendance">
              <AttendanceTab
                attendanceData={{ ...attendance, month: selectedMonth, year: parseInt(selectedYear) }}
                holidays={holidays}
                leaveBalance={leaveBalance}
                multiSelectedDates={multiSelectedDates}
                onDateClick={handleDateClick}
                onApplyLeaveClick={handleOpenLeaveModal}
                onApplyCompOffClick={handleOpenCompOffModal}
                onClearSelection={clearSelection}
              />
            </TabsContent>
            <TabsContent value="leave">
              <LeaveTab 
                leaveBalance={leaveBalance} 
                leaveHistory={leaveHistory?.leaveHistory} 
                holidays={holidays}
                isLoading={leaveBalanceLoading || historyLoading}
                projectedLeaveDays={multiSelectedDates.length}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default withAuth(EmployeeAttendanceAndLeave);
