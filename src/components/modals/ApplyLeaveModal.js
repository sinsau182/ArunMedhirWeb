import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

// Helper function
function calculateRequestedDays(dates) {
  return dates.reduce((total, date) => {
    return total + (date.shiftType === "HALF_DAY" ? 0.5 : 1);
  }, 0);
}

const ApplyLeaveModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialDates = [],
  leaveBalance 
}) => {
  const [leaveDates, setLeaveDates] = React.useState(initialDates);
  const [reason, setReason] = React.useState("");
  const [showLOPWarning, setShowLOPWarning] = React.useState(false);

  React.useEffect(() => {
    // This is the fix. We check if the incoming item 'd' is already a Date object
    // or if it's inside an object with a .date property.
    const initialLeaveDates = initialDates.map(d => ({ 
      date: d.date instanceof Date ? d.date : new Date(d), 
      shiftType: 'FULL_DAY' 
    }));
    setLeaveDates(initialLeaveDates);
    setReason("");
  }, [initialDates, isOpen]);
  
  React.useEffect(() => {
    // Recalculate warning whenever dates or their shifts change
    const totalDays = calculateRequestedDays(leaveDates);
    if (leaveBalance && totalDays > leaveBalance) {
      setShowLOPWarning(true);
    } else {
      setShowLOPWarning(false);
    }
  }, [leaveDates, leaveBalance]);

  const handleShiftChange = (indexToUpdate, newShiftType) => {
    const updatedDates = leaveDates.map((item, index) => 
      index === indexToUpdate ? { ...item, shiftType: newShiftType } : item
    );
    setLeaveDates(updatedDates);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ dates: leaveDates, reason });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Apply for Leave</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X/></Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Dates</label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {leaveDates.map((item, index) => {
                  // This check remains for safety
                  const dateText = item.date instanceof Date && !isNaN(item.date)
                    ? item.date.toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Invalid Date';

                  return (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                      <span className="font-medium">{dateText}</span>
                      <Select value={item.shiftType} onValueChange={(value) => handleShiftChange(index, value)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FULL_DAY">Full Day</SelectItem>
                          <SelectItem value="HALF_DAY">Half Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
              {showLOPWarning && <p className="text-red-500 text-xs mt-2">Requested days exceed available balance (LOP).</p>}
              <p className="text-sm font-semibold text-gray-700 mt-2">Total Requested Days: {calculateRequestedDays(leaveDates)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason</label>
              <textarea name="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2 border rounded-md" required />
            </div>
            <Button type="submit" className="w-full" disabled={!reason.trim() || leaveDates.length === 0}>Submit Request</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyLeaveModal;
