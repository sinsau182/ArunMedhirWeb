import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaPlus, FaRegClock, FaStickyNote, FaTrash } from 'react-icons/fa';

const LeadActions = ({ lead, onScheduleActivity, onAddNote, onMarkLost }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAction = (action) => {
        action(lead);
        setIsOpen(false);
    };

    return (
        <div className="relative lead-actions" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700"
            >
                <FaEllipsisV />
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border z-50">
                    <button
                        onClick={() => handleAction(onScheduleActivity)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <FaRegClock /> Schedule Activity
                    </button>
                    <button
                        // onClick={() => handleAction(onAddNote)} // Assuming onAddNote exists
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <FaStickyNote /> Add Note
                    </button>
                    <div className="border-t my-1"></div>
                    <button
                        onClick={() => handleAction(onMarkLost)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <FaTrash /> Mark as Lost
                    </button>
                </div>
            )}
        </div>
    );
};

export default LeadActions;