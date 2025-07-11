import React from "react";
import { FaThLarge, FaListUl } from "react-icons/fa";

const ViewToggleButtonGroup = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-md">
      <button
        className={`p-2 rounded-md transition-colors ${
          viewMode === "kanban"
            ? "bg-blue-600 shadow text-white"
            : "hover:bg-blue-100 text-blue-600"
        }`}
        onClick={() => setViewMode("kanban")}
        title="Kanban Board View"
      >
        <FaThLarge size={18} />
      </button>
      <button
        className={`p-2 rounded-md transition-colors ${
          viewMode === "table"
            ? "bg-white shadow text-blue-600"
            : "hover:bg-blue-100 text-blue-600"
        }`}
        onClick={() => setViewMode("table")}
        title="Table View"
      >
        <FaListUl size={18} />
      </button>
    </div>
  );
};

export default ViewToggleButtonGroup;
