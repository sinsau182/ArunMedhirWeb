import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Search, Calendar } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { useRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import withAuth from "@/components/withAuth";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "@/redux/slices/employeeSlice";
import { fetchAllEmployeeAttendanceOneMonth } from "@/redux/slices/attendancesSlice";

function Attendance() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { employees = [], loading: employeesLoading } = useSelector(
    (state) => state.employees || {}
  );
  const { attendance, loading, err } = useSelector(
    (state) => state.attendances
  );

  // State variables
  const [searchInput, setSearchInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [activeTab, setActiveTab] = useState("Attendance Tracker");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const statusFilterRef = useRef(null);
  const calendarRef = useRef(null);
  const departmentFilterRef = useRef(null);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [isDepartmentFilterOpen, setIsDepartmentFilterOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Constants/Options
  const statusOptions = [
    { value: "P", label: "Present", color: "#CCFFCC" },
    { value: "PL", label: "Present with Leave", color: "#E5E5CC" },
    { value: "PH", label: "Present on Holiday", color: "#5cbf85" },
    { value: "P/A", label: "Half Day", color: "#FFFFCC" },
    { value: "PH/A", label: "Half Day on Holiday", color: "#ffcc80" },
    { value: "A", label: "Absent", color: "#FFCCCC" },
    { value: "LOP", label: "Loss of Pay", color: "#e57373" },
    { value: "H", label: "Holiday", color: "#E0E0E0" },
    {
      value: "P/LOP",
      label: "Present Half Day on Loss of Pay",
      color: "#A89EF6",
    },
  ];

  // Effects
  useEffect(() => {
    dispatch(fetchEmployees()).catch((err) => {
      setError("Failed to fetch employees");
      console.error("Error fetching employees:", err);
    });
  }, [dispatch]);

  useEffect(() => {
    const { query } = router;

    if (query.selectedDate && query.selectedMonth && query.selectedYear) {
      // If date params are in the query, set the state
      setSelectedDate(parseInt(query.selectedDate, 10));
      setSelectedMonth(query.selectedMonth);
      setSelectedYear(query.selectedYear);
    }

    if (query.selectedStatuses) {
      // If status param is in the query, set the selected statuses
      // Assuming selectedStatuses is expected as a comma-separated string or an array in the query
      const statuses = Array.isArray(query.selectedStatuses)
        ? query.selectedStatuses
        : [query.selectedStatuses];
      setSelectedStatuses(statuses);
    }
  }, [router.query, router]); // Dependency on router.query

  useEffect(() => {
    // Convert month name to numeric month (1-12)
    const monthIndex = new Date(
      `${selectedMonth} 1, ${selectedYear}`
    ).getMonth();
    const numericMonth = monthIndex + 1; // getMonth() returns 0-11, so add 1
    const year = selectedYear;

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonthShort = today.toLocaleString("default", {
      month: "short",
    });
    const currentYearFull = today.getFullYear().toString();

    // Prepare API parameters
    let apiParams = { month: numericMonth, year };

    // If no date is selected, use current date
    let dateToUse = selectedDate;
    if (dateToUse === null) {
      dateToUse = currentDay;
    }

    // Add date parameter
    apiParams.date = dateToUse;

    // Add status filter if any statuses are selected
    if (selectedStatuses.length > 0) {
      apiParams.status = selectedStatuses.join(",");
    }

    // console.log("Fetching attendance data with params:", apiParams);
    dispatch(fetchAllEmployeeAttendanceOneMonth(apiParams));
  }, [dispatch, selectedMonth, selectedYear, selectedDate, selectedStatuses]);

  useEffect(() => {
    try {
      const role = sessionStorage.getItem("currentRole");
      if (!role || role !== "HRADMIN") {
        router.push("/login");
        return;
      }
      setIsLoading(false);
    } catch (err) {
      setError("Authentication error");
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    try {
      const generateDates = () => {
        const dates = [];
        const monthIndex = new Date(
          `${selectedMonth} 1, ${selectedYear}`
        ).getMonth();
        const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          const date = new Date(selectedYear, monthIndex, i);
          dates.push({
            day: i,
            weekday: date.toLocaleString("default", { weekday: "short" }),
          });
        }
        return dates;
      };
      setDates(generateDates());
    } catch (err) {
      setError("Error generating dates");
    }
  }, [selectedMonth, selectedYear]);

  // Add useEffect for click outside handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target)
      ) {
        setIsStatusFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Add useEffect for calendar click outside handling
  useEffect(() => {
    const handleCalendarClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleCalendarClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleCalendarClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleDepartmentClickOutside = (event) => {
      if (
        departmentFilterRef.current &&
        !departmentFilterRef.current.contains(event.target)
      ) {
        setIsDepartmentFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDepartmentClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleDepartmentClickOutside);
    };
  }, []);

  // Callbacks
  const generateAttendanceData = useCallback(
    (employee) => {
      const attendanceRecord = Array.isArray(attendance)
        ? attendance.find((record) => record.employeeId === employee.employeeId)
        : null;

      if (!attendanceRecord) {
        return {
          id: employee.employeeId,
          name: employee.name,
          department: employee.departmentName,
          p_twd: "0/0",
          attendance: Array(dates.length).fill({ value: null, label: "" }),
        };
      }

      // Helper function to determine attendance status for a given date
      const getAttendanceStatusForDate = (dateString) => {
        const attendanceData = attendanceRecord.attendance;
        if (!attendanceData) return null;

        // Check present dates
        if (attendanceData.presentDates?.includes(dateString)) {
          return "P";
        }

        // Check full leave dates
        if (attendanceData.fullLeaveDates?.includes(dateString)) {
          return "PL";
        }

        // Check half day leave dates
        if (attendanceData.halfDayLeaveDates?.includes(dateString)) {
          return "P/A";
        }

        // Check full comp-off dates
        if (attendanceData.fullCompoffDates?.includes(dateString)) {
          return "P";
        }

        // Check half comp-off dates
        if (attendanceData.halfCompoffDates?.includes(dateString)) {
          return "P/A";
        }

        // Check weekly off dates
        if (attendanceData.weeklyOffDates?.includes(dateString)) {
          return "H";
        }

        // Check absent dates
        if (attendanceData.absentDates?.includes(dateString)) {
          return "A";
        }

        return null;
      };

      const attendanceArray = Array(dates.length)
        .fill(null)
        .map((_, index) => {
          const day = index + 1;
          const monthIndex = new Date(
            `${selectedMonth} 1, ${selectedYear}`
          ).getMonth();
          const dateString = `${selectedYear}-${String(monthIndex + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;

          const status = getAttendanceStatusForDate(dateString);

          if (!status) {
            return { value: null, label: "" };
          }

          let value;
          switch (status.toUpperCase()) {
            case "P":
              value = true;
              break;
            case "PL":
              value = true;
              break;
            case "A":
              value = false;
              break;
            case "P/A":
              value = "half";
              break;
            case "H":
              value = "holiday";
              break;
            case "PH":
              value = "holiday";
              break;
            case "PH/A":
              value = "half";
              break;
            case "LOP":
              value = "absent";
              break;
            case "P/LOP":
              value = "present";
              break;
            default:
              value = null;
          }
          return { value, label: status };
        });

      return {
        id: employee.employeeId,
        name: employee.name,
        department: employee.departmentName,
        p_twd: `${attendanceRecord.payableDays || 0}/${
          attendanceRecord.workingDays || 0
        }`,
        attendance: attendanceArray,
      };
    },
    [dates.length, attendance, selectedMonth, selectedYear]
  );

  const generateLeaveData = useCallback(
    (employee) => {
      const attendanceRecord = attendance?.find(
        (record) => record.employeeId === employee.employeeId
      );

      if (!attendanceRecord) {
        return {
          id: employee.employeeId,
          name: employee.name,
          department: employee.departmentName || "", // Add fallback empty string
          noOfPayableDays: "0",
          leavesTaken: "0",
          leavesEarned: "0",
          leavesFromPreviousYear: "0",
          compOffEarned: "0",
          compOffCarriedForward: "0",
          netLeaves: "0",
        };
      }

      return {
        id: employee.employeeId,
        name: employee.name,
        department:
          attendanceRecord.departmentName || employee.departmentName || "", // Try both sources with fallback
        // noOfPayableDays: attendanceRecord.payableDays.toString(),
        // leavesTaken: attendanceRecord.leavesTaken.toString(),
        // leavesEarned: attendanceRecord.leavesEarned.toString(),
        // leavesFromPreviousYear: attendanceRecord.lastMonthBalance.toString(),
        // compOffEarned: attendanceRecord.compOffEarned.toString(),
        // compOffCarriedForward: "0", // Not provided in API response
        // netLeaves: attendanceRecord.netLeaveBalance.toString(),
      };
    },
    [attendance]
  ); // Added attendance as dependency

  const getAttendanceColor = useCallback((status) => {
    if (status === null) return "bg-gray-100"; // No Data
    const upperStatus = status.toUpperCase();
    if (upperStatus === "P") return "bg-[#CCFFCC]"; // Present (Light green)
    if (upperStatus === "PL") return "bg-[#E5E5CC]"; // Present with Leave (Light red)
    if (upperStatus === "P/A") return "bg-[#FFFFCC]"; // Half day (Light yellow)
    if (upperStatus === "A") return "bg-[#FFCCCC]"; // Absent (Light red)
    if (upperStatus === "H") return "bg-[#E0E0E0]"; // Holiday (Gray)
    if (upperStatus === "PH") return "bg-[#5cbf85]"; // Present on Holiday (Light blue)
    if (upperStatus === "PH/A") return "bg-[#ffcc80]"; // Half Day on Holiday (Lighter blue)
    if (upperStatus === "LOP") return "bg-[#e57373]"; // Loss of Pay (Pink)
    if (upperStatus === "P/LOP") return "bg-[#A89EF6]"; // Present on Loss of Pay (Light gray)
    if (upperStatus === "WEEKEND") return "bg-gray-300"; // Weekend
    return "";
  }, []);

  const toggleStatus = useCallback((status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []); // Added empty dependency array

  const handleDateClick = useCallback((day) => {
    setSelectedDate((prevDate) => (prevDate === day ? null : day)); // Toggle selection
    setSelectedEmployeeId(null); // Clear employee selection when date is clicked
  }, []);

  const toggleDepartment = useCallback((department) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  }, []); // Added empty dependency array

  const toggleCalendar = useCallback(
    () => setIsCalendarOpen(!isCalendarOpen),
    [isCalendarOpen]
  ); // Added isCalendarOpen as dependency

  const handleMonthSelection = useCallback((month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsCalendarOpen(false);
    setSelectedDate(null);
    setSelectedEmployeeId(null);
  }, []); // Added empty dependency array

  // Handler for clicking an employee row (not a date cell)
  const handleEmployeeRowClick = useCallback((employeeId) => {
    setSelectedEmployeeId((prevId) =>
      prevId === employeeId ? null : employeeId
    ); // Toggle selection
    setSelectedDate(null); // Clear date selection when employee is clicked
  }, []);

  // Memoized values
  const filteredEmployees = useMemo(
    () =>
      employees
        .filter(
          (employee) =>
            employee.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            employee.employeeId
              .toLowerCase()
              .includes(searchInput.toLowerCase()) ||
            (employee.departmentName &&
              employee.departmentName
                .toLowerCase()
                .includes(searchInput.toLowerCase())) // Added check for departmentName
        )
        .map(generateAttendanceData), // Map after filtering
    [searchInput, employees, generateAttendanceData] // Added generateAttendanceData dependency
  );

  // Extract unique departments for filter options (moved from renderLeaveTable)
  const departmentOptions = useMemo(() => {
    const departments = new Set();
    employees.forEach((employee) => {
      if (employee.departmentName) {
        departments.add(employee.departmentName);
      }
    });
    return Array.from(departments).map((dept) => ({
      value: dept,
      label: dept,
    }));
  }, [employees]);

  // Filter leave data based on search input and selected departments (moved from renderLeaveTable)
  const filteredAndSearchedLeaveData = useMemo(() => {
    let data = employees.map(generateLeaveData); // Start with all leave data mapped

    // Apply department filter
    if (selectedDepartments.length > 0) {
      data = data.filter((leave) =>
        selectedDepartments.includes(leave.department)
      );
    }

    // // console.log(data);

    // Apply search filter
    if (searchInput) {
      data = data.filter(
        (leave) =>
          leave.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          leave.id.toLowerCase().includes(searchInput.toLowerCase()) ||
          (leave.department &&
            leave.department.toLowerCase().includes(searchInput.toLowerCase())) // Added check for leave.department
      );
    }

    return data;
  }, [searchInput, selectedDepartments, employees, generateLeaveData]);

  // Calculate attendance summary statistics
  const calculateAttendanceSummary = useCallback(
    (employeesData, dateToSummarize = null) => {
      let totalPresent = 0;
      let totalAbsent = 0;
      let totalHalfDay = 0;
      let totalHoliday = 0;
      let totalPresentOnHoliday = 0;
      let totalHalfDayOnHoliday = 0;
      let totalLOP = 0;
      let totalPresentOnLOP = 0;
      let totalPresentWithLeave = 0;
      // Determine which data to use for summary based on dateToSummarize
      const dataForSummary =
        dateToSummarize !== null
          ? employeesData.filter((employee) => {
              const dayIndex = dateToSummarize - 1;
              // Check if employee has attendance data for the specific date and it's not null
              return (
                employee.attendance &&
                employee.attendance.length > dayIndex &&
                employee.attendance[dayIndex].label !== null
              );
            })
          : employeesData; // Use full list if no specific date for summary

      dataForSummary.forEach((employee) => {
        if (dateToSummarize !== null) {
          const dayIndex = dateToSummarize - 1;
          // Check if attendance data exists for the specific day before accessing
          if (employee.attendance && employee.attendance.length > dayIndex) {
            const att = employee.attendance[dayIndex];
            switch (att.label.toUpperCase()) {
              case "P":
                totalPresent++;
                break;
              case "PL":
                totalPresentWithLeave++;
                break;
              case "A":
                totalAbsent++;
                break;
              case "P/A":
                totalHalfDay++;
                break;
              case "H":
                totalHoliday++;
                break;
              case "PH":
                totalPresentOnHoliday++;
                break;
              case "PH/A":
                totalHalfDayOnHoliday++;
                break;
              case "LOP":
                totalLOP++;
                break;
              case "P/LOP":
                totalPresentOnLOP++;
                break;
            }
          }
        } else {
          // If no specific date, summarize all attendance days
          employee.attendance.forEach((att) => {
            // Only count valid statuses for summary
            if (att.label !== null && att.label !== "") {
              switch (att.label.toUpperCase()) {
                case "P":
                  totalPresent++;
                  break;
                case "PL":
                  totalPresentWithLeave++;
                  break;
                case "A":
                  totalAbsent++;
                  break;
                case "P/A":
                  totalHalfDay++;
                  break;
                case "H":
                  totalHoliday++;
                  break;
                case "PH":
                  totalPresentOnHoliday++;
                  break;
                case "PH/A":
                  totalHalfDayOnHoliday++;
                  break;
                case "LOP":
                  totalLOP++;
                  break;
                case "P/LOP":
                  totalPresentOnLOP++;
                  break;
              }
            }
          });
        }
      });

      return {
        totalPresent,
        totalAbsent,
        totalHalfDay,
        totalHoliday,
        totalPresentOnHoliday,
        totalHalfDayOnHoliday,
        totalLOP,
        totalPresentOnLOP,
        totalPresentWithLeave,
      };
    },
    []
  ); // Removed filteredEmployees dependency, now depends on employeesData passed in

  // Calculate leave summary statistics
  const calculateLeaveSummary = useCallback(() => {
    let totalLeavesTaken = 0;
    let totalLeavesEarned = 0;
    let totalNetLeaveBalance = 0;

    filteredAndSearchedLeaveData.forEach((leave) => {
      totalLeavesTaken += parseFloat(leave.leavesTaken);
      totalLeavesEarned += parseFloat(leave.leavesEarned);
      totalNetLeaveBalance += parseFloat(leave.netLeaves);
    });

    return {
      totalLeavesTaken: totalLeavesTaken.toFixed(1),
      totalLeavesEarned: totalLeavesEarned.toFixed(1),
      totalNetLeaveBalance: totalNetLeaveBalance.toFixed(1),
    };
  }, [filteredAndSearchedLeaveData]);

  // Determine the date to use for the summary

  const currentDay = today.getDate();
  const currentMonthShort = today.toLocaleString("default", { month: "short" });
  const currentYearFull = today.getFullYear().toString();

  // summaryDate should be selectedDate if not null, otherwise today's date if viewing current month/year
  const summaryDate =
    selectedDate !== null
      ? selectedDate
      : selectedMonth.slice(0, 3) === currentMonthShort &&
        selectedYear === currentYearFull
      ? currentDay
      : null;

  // Calculate summary based on selected employee or date
  const summary = useMemo(() => {
    if (selectedEmployeeId) {
      // Find the selected employee's data
      const emp = filteredEmployees.find((e) => e.id === selectedEmployeeId);
      if (!emp) return calculateAttendanceSummary([], null);
      // Calculate summary for this employee across all dates
      return calculateAttendanceSummary([emp], null);
    } else {
      // Calculate summary for all employees for the selected date
      return calculateAttendanceSummary(filteredEmployees, summaryDate);
    }
  }, [filteredEmployees, calculateAttendanceSummary, summaryDate, selectedEmployeeId]);

  // Render functions
  const renderAttendanceTable = (props) => {
    const {
      dates,
      statusOptions,
      selectedStatuses,
      isStatusFilterOpen,
      toggleStatus,
      searchInput,
      setSearchInput,
      isCalendarOpen,
      toggleCalendar,
      selectedYear,
      selectedMonth,
      handleMonthSelection,
      selectedDate,
      handleDateClick,
      filteredEmployees: originalFilteredEmployees,
      getAttendanceColor,
      calculateAttendanceSummary,
      attendance,
      summaryDate,
      summary, // Add summary as a prop
    } = props;

    // Determine which data to use for rendering
    let dataToRender = originalFilteredEmployees;

    // Helper function to get attendance status for a specific date from the new API format
    const getAttendanceStatusForDate = (attendanceRecord, dateString) => {
      const attendanceData = attendanceRecord?.attendance;
      if (!attendanceData) return null;

      // Check present dates
      if (attendanceData.presentDates?.includes(dateString)) {
        return "P";
      }

      // Check full leave dates
      if (attendanceData.fullLeaveDates?.includes(dateString)) {
        return "PL";
      }

      // Check half day leave dates
      if (attendanceData.halfDayLeaveDates?.includes(dateString)) {
        return "P/A";
      }

      // Check full comp-off dates
      if (attendanceData.fullCompoffDates?.includes(dateString)) {
        return "P";
      }

      // Check half comp-off dates
      if (attendanceData.halfCompoffDates?.includes(dateString)) {
        return "P/A";
      }

      // Check weekly off dates
      if (attendanceData.weeklyOffDates?.includes(dateString)) {
        return "H";
      }

      // Check absent dates
      if (attendanceData.absentDates?.includes(dateString)) {
        return "A";
      }

      return null;
    };

    // If we have attendance data from the API and status filters are applied
    if (attendance && attendance.length > 0 && selectedStatuses.length > 0) {
      // Filter originalFilteredEmployees based on the attendance status on the summaryDate
      dataToRender = originalFilteredEmployees
        .filter((employee) => {
          // Find the employee's attendance record from the fetched data
          const empAttendanceRecord = attendance.find(
            (attRec) => attRec.employeeId === employee.id
          );
          if (!empAttendanceRecord) return false; // Employee not in fetched attendance data

          // Get the attendance status for the summaryDate (current date or selected date)
          let statusForSummaryDate = null;
          if (summaryDate) {
            const monthIndex = new Date(
              `${selectedMonth} 1, ${selectedYear}`
            ).getMonth();
            const dateString = `${selectedYear}-${String(
              monthIndex + 1
            ).padStart(2, "0")}-${String(summaryDate).padStart(2, "0")}`;
            statusForSummaryDate = getAttendanceStatusForDate(
              empAttendanceRecord,
              dateString
            );
          }

          // Check if the status for the summaryDate is included in the selected statuses
          return selectedStatuses
            .map((s) => s.toUpperCase())
            .includes(statusForSummaryDate?.toUpperCase());
        })
        .map((employee) => {
          // Map the employee data, ensuring attendance array uses fetched data
          const empAttendanceRecord = attendance.find(
            (attRec) => attRec.employeeId === employee.id
          );

          // Create attendance array for the employee using fetched data
          const attendanceArray = Array(dates.length)
            .fill({ value: null, label: "" })
            .map((_, index) => {
              const day = index + 1;
              const monthIndex = new Date(
                `${selectedMonth} 1, ${selectedYear}`
              ).getMonth();
              const dateString = `${selectedYear}-${String(
                monthIndex + 1
              ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

              const status = getAttendanceStatusForDate(
                empAttendanceRecord,
                dateString
              );

              if (!status) {
                return { value: null, label: "" };
              }

              // Map the status to the correct format
              let value;
              switch (status.toUpperCase()) {
                case "P":
                  value = true;
                  break;
                case "PL":
                  value = true;
                  break;
                case "A":
                  value = false;
                  break;
                case "P/A":
                  value = "half";
                  break;
                case "H":
                  value = "holiday";
                  break;
                case "PH":
                  value = "holiday";
                  break;
                case "PH/A":
                  value = "half";
                  break;
                case "LOP":
                  value = "absent";
                  break;
                case "P/LOP":
                  value = "present";
                  break;
                default:
                  value = null;
              }
              return { value, label: status };
            });

          return {
            ...employee,
            attendance: attendanceArray,
          };
        });
    } else if (
      selectedStatuses.length === 0 &&
      attendance &&
      attendance.length > 0
    ) {
      // If no status filters are applied, but we have fetched attendance data (e.g., due to date selection)
      // We still need to use the data from the 'attendance' state, but without filtering by status
      dataToRender = originalFilteredEmployees
        .filter((employee) =>
          attendance.some((attRec) => attRec.employeeId === employee.id)
        )
        .map((employee) => {
          const empAttendanceRecord = attendance.find(
            (attRec) => attRec.employeeId === employee.id
          );

          const attendanceArray = Array(dates.length)
            .fill({ value: null, label: "" })
            .map((_, index) => {
              const day = index + 1;
              const monthIndex = new Date(
                `${selectedMonth} 1, ${selectedYear}`
              ).getMonth();
              const dateString = `${selectedYear}-${String(
                monthIndex + 1
              ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

              const status = getAttendanceStatusForDate(
                empAttendanceRecord,
                dateString
              );

              if (!status) {
                return { value: null, label: "" };
              }

              let value;
              switch (status.toUpperCase()) {
                case "P":
                  value = true;
                  break;
                case "PL":
                  value = true;
                  break;
                case "A":
                  value = false;
                  break;
                case "P/A":
                  value = "half";
                  break;
                case "H":
                  value = "holiday";
                  break;
                case "PH":
                  value = "holiday";
                  break;
                case "PH/A":
                  value = "half";
                  break;
                case "LOP":
                  value = "absent";
                  break;
                case "P/LOP":
                  value = "present";
                  break;
                default:
                  value = null;
              }
              return { value, label: status };
            });

          return {
            ...employee,
            attendance: attendanceArray,
          };
        });
    } else if (
      selectedStatuses.length > 0 &&
      (!attendance || attendance.length === 0)
    ) {
      // If status filters are applied, but no attendance data was returned from the API for the selected date
      // This means no employee had the selected status on that date, so show empty table
      dataToRender = [];
    } else {
      // Default case: no date selected, no status filters, use the original data mapped with full month attendance
      // originalFilteredEmployees already contains this via generateAttendanceData
      dataToRender = originalFilteredEmployees;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-4 space-y-6">
        {/* Dynamic selection message */}
        {selectedEmployeeId && !selectedDate && (
          <div className="mb-2 text-gray-700 font-medium text-base">
            Showing attendance of an employee with EMP ID{" "}
            <span className="font-semibold">{selectedEmployeeId}</span> on{" "}
            {selectedMonth} {selectedYear}
          </div>
        )}
        {!selectedEmployeeId && selectedDate && (
          <div className="mb-2 text-gray-700 font-medium text-base">
            Showing attendance of the employees on{" "}
            <span className="font-semibold">
              {selectedDate} {selectedMonth} {selectedYear}
            </span>
          </div>
        )}
        {/* Summary Cards in Single Row */}
        <div className="flex gap-4 overflow-x-auto pb-4 border-b border-gray-200">
          {statusOptions.map((status) => {
            // Map the status value to the correct summary key
            let summaryKey;
            switch (status.value) {
              case "P":
                summaryKey = "totalPresent";
                break;
              case "PL":
                summaryKey = "totalPresentWithLeave";
                break;
              case "A":
                summaryKey = "totalAbsent";
                break;
              case "P/A":
                summaryKey = "totalHalfDay";
                break;
              case "H":
                summaryKey = "totalHoliday";
                break;
              case "PH":
                summaryKey = "totalPresentOnHoliday";
                break;
              case "PH/A":
                summaryKey = "totalHalfDayOnHoliday";
                break;
              case "LOP":
                summaryKey = "totalLOP";
                break;
              case "P/LOP":
                summaryKey = "totalPresentOnLOP";
                break;
              default:
                summaryKey = "";
            }
            const showNoData = selectedDate === null && !selectedEmployeeId;
            const count = showNoData ? "--" : summary[summaryKey] || 0;
            return (
              <div
                key={status.value}
                className={`rounded-lg p-4 min-w-[120px] flex flex-col justify-between items-center group ${
                  showNoData
                    ? "bg-gray-100"
                    : status.value === "P/A"
                    ? "bg-yellow-100 text-yellow-800"
                    : ""
                }`}
                style={{
                  background: showNoData
                    ? undefined
                    : status.value === "P/A"
                    ? undefined
                    : status.color,
                  cursor: showNoData ? "not-allowed" : "default",
                }}
                title={
                  showNoData
                    ? "Please select a date or employee to show data"
                    : ""
                }
              >
                <p className="text-sm text-gray-700 mb-1 font-medium min-h-[20px]">
                  {status.label}
                </p>
                <h3
                  className={`text-xl font-bold mt-auto ${
                    showNoData
                      ? "text-gray-400"
                      : status.value === "P/A"
                      ? "text-yellow-800"
                      : "text-gray-800"
                  }`}
                >
                  {count}
                </h3>
                {showNoData && (
                  <span
                    className="absolute opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 mt-2 z-50 transition-opacity duration-200"
                    style={{ top: "100%" }}
                  >
                    Please select a date or employee to show data
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Filters, Search, and Calendar Section */}
        <div className="flex items-center gap-4">
          {/* Status Filter */}
          <div className="relative" ref={statusFilterRef}>
            <button
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
            >
              <span className="text-sm text-gray-700">Filter by Status</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {selectedStatuses.length}
              </span>
              {/* Show selected status labels outside */}
              {selectedStatuses.length > 0 && (
                <span className="flex flex-wrap gap-1 ml-2">
                  {selectedStatuses.map((status) => {
                    const found = statusOptions.find(
                      (opt) => opt.value === status
                    );
                    const isActive = selectedStatuses.includes(status);
                    return (
                      <span
                        key={status}
                        className={`flex items-center px-2 py-0.5 rounded text-xs cursor-pointer`}
                        style={{
                          backgroundColor: found ? found.color : "#eee",
                          color: "#333",
                          border: "1px solid #ddd",
                        }}
                        onClick={() => toggleStatus(status)}
                      >
                        {found ? found.label : status}
                        {isActive && (
                          <button
                            type="button"
                            className="ml-1 text-gray-500 hover:text-red-600 focus:outline-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStatuses((prev) =>
                                prev.filter((s) => s !== status)
                              );
                            }}
                            aria-label={`Remove ${
                              found ? found.label : status
                            }`}
                          >
                            &times;
                          </button>
                        )}
                      </span>
                    );
                  })}
                </span>
              )}
            </button>

            {isStatusFilterOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-md shadow-lg">
                <div className="p-2 max-h-48 overflow-y-auto">
                  {statusOptions.map((status) => (
                    <label
                      key={status.value}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status.value)}
                        onChange={() => toggleStatus(status.value)}
                        className="rounded border-gray-300"
                      />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span className="text-sm">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Legend */}
          <div className="p-4 border-b flex flex-wrap gap-4 text-xs items-center">
            {statusOptions.map((status) => {
              const isActive = selectedStatuses.includes(status.value);
              return (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => toggleStatus(status.value)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded transition focus:outline-none select-none border text-xs
                    ${
                      isActive
                        ? "shadow-sm -translate-y-0.5 border-2"
                        : "border border-gray-200"
                    }
                    ${isActive ? "" : "hover:bg-gray-200"}
                  `}
                  style={{
                    background: isActive
                      ? status.value === "P/A"
                        ? "linear-gradient(90deg, #CCFFCC 50%, #FFCCCC 50%)"
                        : status.color
                      : "#f3f4f6",
                    borderColor: isActive
                      ? status.value === "P/A"
                        ? "transparent"
                        : status.color
                      : "#e5e7eb",
                    fontWeight: 400,
                    boxShadow: isActive
                      ? "0 2px 8px 0 rgba(0,0,0,0.04)"
                      : "none",
                    transition: "all 0.15s cubic-bezier(.4,0,.2,1)",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      background:
                        status.value === "P/A"
                          ? "linear-gradient(90deg, #CCFFCC 50%, #FFCCCC 50%)"
                          : status.color,
                    }}
                  ></div>
                  <span>
                    {status.label} ({status.value})
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setSelectedStatuses([])}
              className="ml-2 px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs border border-gray-300"
            >
              Clear
            </button>
          </div>

          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="border-b border-black">
                {/* Fixed Columns */}
                <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[8%] border-r border-black left-0 bg-white shadow-sm">
                  Emp ID
                </th>
                <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[10%] border-r border-black left-[8%] bg-white shadow-sm">
                  Name
                </th>
                <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[8%] border-r border-black left-[18%] bg-white shadow-sm">
                  Dept
                </th>

                {/* Scrollable Date Columns */}
                {dates.map((date) => {
                  const isToday =
                    date.day === new Date().getDate() &&
                    selectedMonth ===
                      new Date().toLocaleString("default", { month: "long" }) &&
                    selectedYear === new Date().getFullYear().toString();
                  const isSelected = selectedDate === date.day;

                  return (
                    <th
                      key={date.day}
                      className={`py-1 px-0 text-center text-xs font-semibold text-gray-700 border-r border-black cursor-pointer hover:bg-gray-100
                        ${isToday ? "bg-blue-100" : ""}
                        ${isSelected ? "bg-blue-300 text-blue-900" : ""}
                      `}
                      onClick={() => handleDateClick(date.day)}
                    >
                      <div className="leading-none">
                        {String(date.day).padStart(2, "0")}
                      </div>
                      <div className="text-gray-500 text-[10px] leading-tight">
                        {date.weekday}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {/* Use dataToRender which contains either full month data or backend-filtered data */}
              {dataToRender.map((employee, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    // Only trigger row click if not clicking a date cell
                    if (!e.target.closest("td[data-date-cell]")) {
                      handleEmployeeRowClick(employee.id);
                    }
                  }}
                >
                  {/* Fixed Cells */}
                  <td
                    className={`py-1 px-1 text-sm border-r border-black left-0 ${
                      selectedEmployeeId === employee.id
                        ? "bg-blue-100 font-semibold text-gray-800"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    {employee.id}
                  </td>
                  <td className="py-1 px-1 text-sm text-gray-800 border-r border-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] left-[8%] bg-white">
                    {employee.name}
                  </td>
                  <td className="py-1 px-1 text-sm text-gray-800 border-r border-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] left-[18%] bg-white">
                    {employee.department}
                  </td>

                  {/* Scrollable Attendance Cells */}
                  {dates.map((date, index) => {
                    const day = date.day;
                    const employeeAttendanceForMonth =
                      originalFilteredEmployees.find(
                        (emp) => emp.id === employee.id
                      )?.attendance; // Get full month attendance from original data

                    let attendanceForDay = { value: null, label: "" }; // Default to no data

                    // Determine the attendance data to display based on selectedDate and fetched attendance
                    if (selectedDate !== null) {
                      // If a specific date is selected, find the matching attendance record for that day in the fetched attendance
                      const fetchedAttendanceForEmployee = Array.isArray(attendance)
                        ? attendance?.find(
                            (attRec) => attRec.employeeId === employee.id
                          )
                        : attendance;
                      if (fetchedAttendanceForEmployee?.attendance) {
                        // Create date string in YYYY-MM-DD format for the current day
                        const monthIndex = new Date(
                          `${selectedMonth} 1, ${selectedYear}`
                        ).getMonth();
                        const currentDateString = `${selectedYear}-${String(
                          monthIndex + 1
                        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                        // Use the helper function to get status for this date
                        const status = getAttendanceStatusForDate(
                          fetchedAttendanceForEmployee,
                          currentDateString
                        );

                        if (status) {
                          let value;
                          switch (status.toUpperCase()) {
                            case "P":
                              value = true;
                              break;
                            case "PL":
                              value = true;
                              break;
                            case "A":
                              value = false;
                              break;
                            case "P/A":
                              value = "half";
                              break;
                            case "H":
                              value = "holiday";
                              break;
                            case "PH":
                              value = "holiday";
                              break;
                            case "PH/A":
                              value = "half";
                              break;
                            case "LOP":
                              value = "absent";
                              break;
                            case "P/LOP":
                              value = "present";
                              break;
                            default:
                              value = null;
                          }
                          attendanceForDay = { value, label: status };
                        }
                      }
                    } else if (
                      employeeAttendanceForMonth &&
                      employeeAttendanceForMonth.length > index
                    ) {
                      // If no specific date is selected, use the full month attendance from originalFilteredEmployees
                      attendanceForDay = employeeAttendanceForMonth[index];
                    }

                    return (
                      <td
                        key={index}
                        data-date-cell
                        className={`py-0.5 px-0 text-center text-[10px] border-r border-black ${getAttendanceColor(
                          attendanceForDay.label
                        )}`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleDateClick(day);
                        }}
                      >
                        {attendanceForDay.label?.toUpperCase()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderLeaveTable = (props) => {
    const {
      searchInput,
      setSearchInput,
      departmentOptions,
      selectedDepartments,
      isDepartmentFilterOpen,
      toggleDepartment,
      filteredAndSearchedLeaveData, // This already contains mapped data
      calculateLeaveSummary,
      selectedEmployeeId,
      setSelectedEmployeeId,
    } = props;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Leave Summary Cards - Removed */}
        {/* Filters and Search Section */}
        <div className="flex items-center gap-4 mb-4">
          {/* Department Filter */}
          <div className="relative z-10" ref={departmentFilterRef}>
            <button
              onClick={() => setIsDepartmentFilterOpen(!isDepartmentFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
            >
              <span className="text-sm text-gray-700">
                Filter by Department
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {selectedDepartments.length}
              </span>
              {/* Show selected department labels outside */}
              {selectedDepartments.length > 0 && (
                <span className="flex flex-wrap gap-1 ml-2">
                  {selectedDepartments.map((dept) => (
                    <span
                      key={dept}
                      className="flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      {dept}
                      <button
                        type="button"
                        className="ml-1 text-gray-500 hover:text-red-600 focus:outline-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDepartments((prev) =>
                            prev.filter((d) => d !== dept)
                          );
                        }}
                        aria-label={`Remove ${dept}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </span>
              )}
            </button>

            {isDepartmentFilterOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-md shadow-lg z-20">
                <div className="p-2 max-h-48 overflow-y-auto">
                  {departmentOptions.map((dept) => (
                    <label
                      key={dept.value}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(dept.value)}
                        onChange={() => toggleDepartment(dept.value)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{dept.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Leave Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Emp ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Dept
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Pay Days
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Leaves Taken
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Leaves Earned
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Leaves CF Prev Year
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  Comp Off
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                  CF Comp Off
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSearchedLeaveData.map((leave) => {
                const leaveBalance =
                  parseFloat(leave.leavesEarned) +
                  parseFloat(leave.leavesFromPreviousYear) +
                  parseFloat(leave.compOffEarned) +
                  parseFloat(leave.compOffCarriedForward) -
                  parseFloat(leave.leavesTaken);

                return (
                  <tr
                    key={leave.id}
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => setSelectedEmployeeId(leave.id)}
                  >
                    <td
                      className={`py-3 px-4 whitespace-nowrap text-sm border-r border-gray-200 ${
                        selectedEmployeeId === leave.id
                          ? "bg-blue-100 font-semibold text-gray-800"
                          : "text-gray-800"
                      }`}
                    >
                      {leave.id}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                      {leave.name}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                      {leave.department}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                      {leave.noOfPayableDays}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                      {leave.leavesTaken}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                      {leave.leavesEarned}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                      {leave.leavesFromPreviousYear}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                      {leave.compOffEarned}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                      {leave.compOffCarriedForward}
                    </td>
                    <td
                      className={`py-3 px-4 whitespace-nowrap text-sm ${
                        leaveBalance < 0
                          ? "text-red-600 font-semibold"
                          : "text-gray-800"
                      }`}
                    >
                      {0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }
  // console.log(attendance);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        <HradminNavbar />

        <div className="p-6 mt-16">
          {/* Header with Search and Title */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-gray-800">
              Attendance Management
            </h1>
            {/* Calendar */}
            <div className="relative ml-auto" ref={calendarRef}>
              <Badge
                variant="outline"
                className="px-4 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 text-white"
                onClick={toggleCalendar}
              >
                <Calendar className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {selectedYear}-{selectedMonth}
                </span>
              </Badge>
              {isCalendarOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                  {/* Existing calendar content */}
                  <div className="p-3 border-b flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-700">
                      {selectedYear}
                    </div>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        if (e.target.value === "2024") {
                          setSelectedMonth("Aug");
                        } else {
                          setSelectedMonth("Jan");
                        }
                      }}
                      className="ml-2 border rounded px-2 py-1 text-sm"
                    >
                      {[2024, 2025].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-3">
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const currentMonthIdx = new Date().getMonth(); // 0-based
                      let months = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ];
                      let startIdx = 0;
                      let endIdx = 11;
                      if (parseInt(selectedYear) === 2024) {
                        startIdx = 7; // August (0-based)
                        endIdx = 11;
                      } else if (parseInt(selectedYear) === 2025) {
                        startIdx = 0;
                        endIdx = currentYear === 2025 ? currentMonthIdx : 11;
                      }
                      return months.slice(startIdx, endIdx + 1).map((month) => (
                        <button
                          key={month}
                          className={`p-3 text-sm rounded-md transition-colors duration-200 ${
                            month === selectedMonth.slice(0, 3)
                              ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-100"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                          onClick={() =>
                            handleMonthSelection(month, selectedYear)
                          }
                        >
                          {month}
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mb-6">
            {["Attendance Tracker", "Leave Tracker"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Conditionally render based on active tab, passing props */}
          {activeTab === "Attendance Tracker"
            ? renderAttendanceTable({
                dates,
                statusOptions,
                selectedStatuses,
                isStatusFilterOpen,
                toggleStatus,
                searchInput,
                setSearchInput,
                isCalendarOpen,
                toggleCalendar,
                selectedYear,
                selectedMonth,
                handleMonthSelection,
                selectedDate,
                handleDateClick,
                filteredEmployees,
                getAttendanceColor,
                calculateAttendanceSummary,
                attendance,
                summaryDate,
                summary,
              })
            : renderLeaveTable({
                searchInput,
                setSearchInput,
                departmentOptions,
                selectedDepartments,
                isDepartmentFilterOpen,
                toggleDepartment,
                filteredAndSearchedLeaveData,
                calculateLeaveSummary,
                selectedEmployeeId,
                setSelectedEmployeeId,
              })}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Attendance);
