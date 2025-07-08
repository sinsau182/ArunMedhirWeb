import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const ApplyCompOffModal = ({ isOpen, onClose, onSubmit, initialDates = [] }) => {
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setDescription(""); // Reset description when modal opens
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Assuming comp-off is always full day for simplicity.
    // The dates are now passed from the parent.
    const compOffData = {
      dates: initialDates.map(d => ({ date: d, shiftType: 'FULL_DAY' })),
      description: description,
    };
    onSubmit(compOffData);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Apply for Comp Off</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X/></Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Dates</label>
              {initialDates.length > 0 ? (
                <ul className="list-disc pl-5 text-gray-800">
                  {initialDates.map((date, index) => (
                    <li key={index}>{new Date(date).toLocaleDateString('en-GB', { weekday: 'short', month: 'long', day: 'numeric' })}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No dates selected.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded-md" required />
            </div>
            <Button type="submit" className="w-full" disabled={!description.trim() || initialDates.length === 0}>Submit Request</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyCompOffModal;
