import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FaArrowRight } from 'react-icons/fa';

const MOCK_LEAVE_BALANCES = [
    { type: "Casual Leave", balance: 5, total: 12 },
    { type: "Sick Leave", balance: 8, total: 12 },
    { type: "Earned Leave", balance: 10, total: 20 },
];

const renderStatusBadge = (status) => {
    const styles = { 'Approved': 'bg-green-100 text-green-800', 'Pending': 'bg-yellow-100 text-yellow-800', 'Rejected': 'bg-red-100 text-red-800' };
    return <Badge className={styles[status] || 'bg-gray-100'}>{status}</Badge>;
};

// Helper to format numbers: show two decimals only if not whole, and handle negatives
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  const fixedNum = Number(num) % 1 === 0 ? Number(num) : Number(num).toFixed(2);
  return fixedNum;
}

// A new helper component for each row in the balance card
const BalanceRow = ({ label, value }) => {
    const isNegative = value < 0;
    return (
        <div className="flex justify-between items-center text-sm">
            <p className="text-gray-600">{label}</p>
            <p className={`font-bold ${isNegative ? 'text-red-500' : 'text-gray-800'}`}>
                {formatNumber(value)}
            </p>
        </div>
    );
};

const LeaveTab = ({ leaveBalance, leaveHistory = [], holidays = [], isLoading, projectedLeaveDays = 0 }) => {
  
  // Calculate the projected balance
  const projectedBalance = leaveBalance ? leaveBalance.newLeaveBalance - projectedLeaveDays : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader><CardTitle>Leave Balance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <p className="text-sm text-gray-500">Loading leave balances...</p>
            )}
            {!isLoading && leaveBalance ? (
              <>
                <BalanceRow label="Leave carried from previous year" value={leaveBalance.leaveCarriedForward} />
                <BalanceRow label="Leaves earned since January" value={leaveBalance.earnedLeave} />
                <BalanceRow label="Comp-off carried forward" value={leaveBalance.compOffCarriedForward} />
                <BalanceRow label="Comp-off earned this month" value={leaveBalance.compOffEarned} />
                <BalanceRow label="Leaves taken in this year" value={-Math.abs(leaveBalance.leavesTaken)} />
                
                <hr className="my-4" />

                <div className="flex justify-between items-center text-md">
                    <p className="font-bold text-gray-800">Total Balance</p>
                    <div className="flex items-center gap-2">
                        <p className={`font-extrabold ${leaveBalance.newLeaveBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatNumber(leaveBalance.newLeaveBalance)}
                        </p>
                        {projectedLeaveDays > 0 && (
                            <>
                                <FaArrowRight className="text-blue-500" />
                                <p className={`font-extrabold ${projectedBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                    {formatNumber(projectedBalance)}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <p className="text-xs text-gray-500 pt-2">
                    * Total = Previous year leaves + Earned leaves + Comp-off (carried & earned) - Taken leaves
                </p>
              </>
            ) : null}
            {!isLoading && !leaveBalance && (
                <p className="text-sm text-red-500">Could not load leave balances.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Upcoming Holidays</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {holidays.map(h => (
                <li key={h.name} className="flex items-center justify-between text-sm">
                  <span>{h.name}</span>
                  <span className="font-mono text-gray-500">{h.date}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader><CardTitle>Leave History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(leaveHistory || []).map(h => (
                  <TableRow key={h.id}>
                    <TableCell>{h.leaveType}</TableCell>
                    <TableCell>{h.startDate === h.endDate ? h.startDate : `${h.startDate} to ${h.endDate}`}</TableCell>
                    <TableCell className="max-w-xs truncate">{h.reason}</TableCell>
                    <TableCell className="text-right">{renderStatusBadge(h.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaveTab;
