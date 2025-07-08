import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserCheck,
  UserX,
  Plane,
  ClipboardPaste,
  Slice,
  Award,
  Sun,
  Coffee,
  CircleOff,
  FaArrowRight,
  Clock,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Frown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

// --- Centralized Style & Icon Guide ---
const STATUS_STYLES = {
  'Present': { icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  'Late': { icon: UserCheck, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  'On Leave': { icon: Plane, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  'Half Day': { icon: Coffee, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  'Absent': { icon: UserX, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  'Missed Punch': { icon: Frown, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  'Holiday': { icon: ClipboardPaste, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  'Weekend': { icon: ClipboardPaste, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' },
  'Default': { icon: Calendar, color: 'text-gray-700', bg: 'bg-white', border: 'border-gray-200' },
};

const SummaryCard = ({ title, value, Icon, colorClass }) => (
  <Card className={`border-l-4 ${colorClass}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-gray-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const AttendanceTab = ({ 
    attendanceData, 
    holidays = [], 
    leaveBalance,
    multiSelectedDates,
    onDateClick: onParentDateClick,
    onApplyLeaveClick,
    onApplyCompOffClick,
    onClearSelection
}) => {
    const [currentDate, setCurrentDate] = useState(new Date(attendanceData.year, new Date(`${attendanceData.month} 1`).getMonth()));
    const [selectedPastDateDetails, setSelectedPastDateDetails] = useState(null);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handleDateClick = (dayData) => {
        const clickedDate = new Date(dayData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (clickedDate < today || isSameDate(clickedDate, today)) {
            // If a past or present date is clicked, show its details
            setSelectedPastDateDetails(dayData);
            onClearSelection(); // Clear any future date selections
        } else {
            // If a future date is clicked, handle multi-selection
            onParentDateClick({ date: clickedDate, status: dayData.status });
            setSelectedPastDateDetails(null); // Clear past date details
        }
    };

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const dailyDataMap = new Map(attendanceData.attendanceData.map(d => [new Date(d.date).getDate(), d]));

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push({ key: `empty-${i}`, empty: true });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayData = dailyDataMap.get(day) || { date: date.toISOString().split('T')[0], status: 'No Data' };
            days.push({ key: `day-${day}`, day, ...dayData });
        }
        return days;
    }, [currentDate, attendanceData.attendanceData]);

    const summaryCounts = useMemo(() => {
        const counts = { Present: 0, Late: 0, 'On Leave': 0, 'Half Day': 0, Absent: 0, 'Missed Punch': 0 };
        attendanceData.attendanceData.forEach(d => {
            if (counts.hasOwnProperty(d.status)) {
                counts[d.status]++;
            }
        });
        return counts;
    }, [attendanceData.attendanceData]);

    const projectedBalance = leaveBalance ? leaveBalance.newLeaveBalance - multiSelectedDates.length : 0;

    return (
        <Card>
            <CardContent className="p-6">
                {/* Monthly Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
                    <SummaryCard title="Present" value={summaryCounts.Present} Icon={UserCheck} colorClass="border-green-500" />
                    <SummaryCard title="Late" value={summaryCounts.Late} Icon={UserCheck} colorClass="border-yellow-500" />
                    <SummaryCard title="Half Day" value={summaryCounts['Half Day']} Icon={Coffee} colorClass="border-orange-500" />
                    <SummaryCard title="On Leave" value={summaryCounts['On Leave']} Icon={Plane} colorClass="border-blue-500" />
                    <SummaryCard title="Absent" value={summaryCounts.Absent} Icon={UserX} colorClass="border-red-500" />
                    <SummaryCard title="Missed Punch" value={summaryCounts['Missed Punch']} Icon={Frown} colorClass="border-purple-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Calendar View */}
                    <div className="md:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">{`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}</h3>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><ChevronLeft className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><ChevronRight className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-medium text-gray-500">{day}</div>)}
                                    {calendarDays.map((dayData) => {
                                        if (dayData.empty) return <div key={dayData.key} />;
                                        
                                        const isSelected = multiSelectedDates.some(d => isSameDate(new Date(dayData.date), d));
                                        const isPastDetailSelected = selectedPastDateDetails && isSameDate(new Date(dayData.date), new Date(selectedPastDateDetails.date));

                                        const style = STATUS_STYLES[dayData.status] || STATUS_STYLES['Default'];
                                        const dayStyle = isSelected || isPastDetailSelected 
                                            ? 'bg-blue-600 text-white ring-2 ring-blue-700'
                                            : `${style.bg} ${style.color} hover:bg-gray-200`;

                                        return (
                                            <button
                                                key={dayData.key}
                                                onClick={() => handleDateClick(dayData)}
                                                className={`p-1 rounded-lg text-center h-20 flex flex-col justify-center items-center transition-all ${dayStyle}`}
                                            >
                                                <div className="font-bold text-lg">{dayData.day}</div>
                                                {dayData.status !== 'No Data' && !isSelected && !isPastDetailSelected && <div className="text-xs">{dayData.status}</div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Details & Actions Card */}
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details & Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {multiSelectedDates.length > 0 && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h4 className="font-semibold text-blue-800">Leave Application</h4>
                                        <p className="text-sm text-blue-700">You have selected {multiSelectedDates.length} day(s) for leave.</p>
                                        <p className="text-sm text-blue-700 mt-2">Current Balance: <span className="font-bold">{leaveBalance?.newLeaveBalance || 'N/A'}</span></p>
                                        <p className="text-sm text-blue-700">Projected Balance: <span className="font-bold">{(leaveBalance?.newLeaveBalance - multiSelectedDates.length).toFixed(2)}</span></p>
                                        <div className="mt-4 flex flex-col space-y-2">
                                            <Button onClick={() => onApplyLeaveClick(multiSelectedDates)}>Apply for Leave</Button>
                                            <Button variant="secondary" onClick={() => onApplyCompOffClick(multiSelectedDates)}>Apply for Comp Off</Button>
                                            <Button variant="ghost" size="sm" onClick={onClearSelection}>Clear Selection</Button>
                                        </div>
                                    </div>
                                )}
                                
                                {selectedPastDateDetails && (
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <h4 className="font-semibold text-gray-800">Details for {new Date(selectedPastDateDetails.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</h4>
                                        <div className="mt-2 text-sm text-gray-600 space-y-1">
                                            <p><strong>Status:</strong> <span className={STATUS_STYLES[selectedPastDateDetails.status]?.color || ''}>{selectedPastDateDetails.status}</span></p>
                                            {selectedPastDateDetails.checkIn && <p><strong>Check-in:</strong> {selectedPastDateDetails.checkIn}</p>}
                                            {selectedPastDateDetails.checkOut && <p><strong>Check-out:</strong> {selectedPastDateDetails.checkOut}</p>}
                                            {selectedPastDateDetails.totalHours && <p><strong>Total Hours:</strong> {selectedPastDateDetails.totalHours}</p>}
                                        </div>
                                    </div>
                                )}

                                {multiSelectedDates.length === 0 && !selectedPastDateDetails && (
                                    <div className="text-center text-gray-500 py-10">
                                        <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                                        <p className="mt-2 text-sm">Select a future date to apply for leave or a past date to view its details.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const isSameDate = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

export default AttendanceTab;
