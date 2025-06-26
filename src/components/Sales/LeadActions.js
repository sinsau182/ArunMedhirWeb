import React, { useState } from 'react';
import { FaEllipsisV, FaEdit, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

const LeadActions = ({ lead, onEdit, onConvert, onMarkLost, onMarkJunk }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action, e) => {
    e.stopPropagation(); // Prevent card click event
    action(lead);
    setIsOpen(false);
  };

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent card click event
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="text-gray-500 hover:text-gray-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FaEllipsisV />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
          <ul className="py-1">
            <li>
              <button
                onClick={(e) => handleAction(onEdit, e)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaEdit className="mr-2" /> Edit
              </button>
            </li>
            <li>
              <button
                onClick={(e) => handleAction(onConvert, e)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaCheck className="mr-2" /> Convert
              </button>
            </li>
            <li>
              <button
                onClick={(e) => handleAction(onMarkLost, e)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaTimes className="mr-2" /> Mark as Lost
              </button>
            </li>
            <li>
              <button
                onClick={(e) => handleAction(onMarkJunk, e)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaTrash className="mr-2" /> Mark as Junk
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LeadActions;