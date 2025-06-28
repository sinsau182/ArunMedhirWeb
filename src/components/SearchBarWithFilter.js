import { useState, useRef, useEffect } from "react";
import { FaSearch, FaFilter, FaChevronDown, FaTimes, FaStar, FaCheck, FaLayerGroup } from "react-icons/fa";

const FILTERS = [
  "Sales",
  "Purchases",
  "Liquidity",
  "Miscellaneous",
];

const ARCHIVED_FILTER = "Archived";

const GROUP_BY_OPTIONS = [
  "Add Custom Group",
  "Date",
  "Category",
  "Vendor",
  "Project",
];

export default function SearchBarWithFilter({ onSearch, onFilterChange, onGroupByChange }) {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [groupBy, setGroupBy] = useState("Add Custom Group");
  const [customFilters, setCustomFilters] = useState([]);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleFilterToggle = (filter) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };
  
  const handleRemoveFilter = (filterToRemove) => {
    setSelectedFilters(prev => prev.filter(f => f !== filterToRemove));
  };
  
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(selectedFilters);
    }
  }, [selectedFilters, onFilterChange]);
  
  useEffect(() => {
    if (onGroupByChange) {
      onGroupByChange(groupBy);
    }
  }, [groupBy, onGroupByChange]);


  const handleAddCustomFilter = () => {
    const name = prompt("Enter custom filter name:");
    if (name && !customFilters.includes(name)) {
      setCustomFilters((prev) => [...prev, name]);
      handleFilterToggle(name);
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-center border border-gray-300 rounded-lg bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
        <FaSearch className="text-gray-400 text-lg mx-2" />
        
        <div className="flex items-center gap-1 overflow-x-auto">
            {selectedFilters.map((filter) => (
              <span key={filter} className="flex-shrink-0 flex items-center bg-purple-100 text-purple-800 rounded-md px-2 py-0.5">
                <FaFilter className="mr-1.5 text-purple-700" size={10} />
                <span className="font-medium text-sm">{filter}</span>
                <button
                  type="button"
                  className="ml-1.5 focus:outline-none"
                  onClick={() => handleRemoveFilter(filter)}
                  aria-label={`Remove ${filter} filter`}
                >
                  <FaTimes className="text-purple-600 hover:text-purple-900" size={12} />
                </button>
              </span>
            ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search..."
          className="flex-1 border-none outline-none bg-transparent px-2 py-1 text-gray-700 placeholder-gray-400 min-w-[100px]"
        />
        
        <button
          type="button"
          className="ml-2 px-2 py-1 focus:outline-none border-l border-gray-200"
          onClick={() => setShowDropdown((v) => !v)}
        >
          <FaChevronDown className="text-gray-500" />
        </button>
      </div>
      
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-14 w-[650px] bg-white border border-gray-200 rounded-lg shadow-xl flex z-30"
        >
          {/* Filters Column */}
          <div className="w-1/3 border-r border-gray-200 p-4">
            <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FaFilter className="text-purple-700" /> Filters
            </div>
            <ul>
                <li
                  className="flex items-center px-2 py-1.5 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => handleFilterToggle("Favorites")}
                >
                  <span className="w-6 mr-1">{selectedFilters.includes("Favorites") && <FaCheck className="text-blue-600" size={14}/>}</span>
                  <span>Favorites</span>
                </li>
            </ul>
            <hr className="my-2" />
            <ul>
              {FILTERS.map((filter) => (
                <li
                  key={filter}
                  className="flex items-center px-2 py-1.5 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => handleFilterToggle(filter)}
                >
                  <span className="w-6 mr-1">{selectedFilters.includes(filter) && <FaCheck className="text-blue-600" size={14}/>}</span>
                  <span>{filter}</span>
                </li>
              ))}
            </ul>
            <hr className="my-2" />
            <ul>
                <li
                  className="flex items-center px-2 py-1.5 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => handleFilterToggle(ARCHIVED_FILTER)}
                >
                  <span className="w-6 mr-1">{selectedFilters.includes(ARCHIVED_FILTER) && <FaCheck className="text-blue-600" size={14}/>}</span>
                  <span>{ARCHIVED_FILTER}</span>
                </li>
            </ul>
            <hr className="my-2" />
            <button
              className="mt-2 text-blue-600 hover:underline text-sm px-2"
              onClick={handleAddCustomFilter}
              type="button"
            >
              + Add Custom Filter
            </button>
          </div>
          
          {/* Group By & Favorites Columns */}
          <div className="w-2/3 flex">
            {/* Group By Column */}
            <div className="w-1/2 border-r border-gray-200 p-4">
              <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FaLayerGroup className="text-green-600" /> Group By
              </div>
              <select
                className="w-full border border-gray-300 rounded px-2 py-2"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              >
                {GROUP_BY_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            
            {/* Favorites Column */}
            <div className="w-1/2 p-4">
              <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FaStar className="text-yellow-400" /> Favorites
              </div>
              <button
                className="w-full bg-gray-100 hover:bg-yellow-100 text-gray-800 font-medium px-3 py-2 rounded transition-colors flex items-center justify-between"
                type="button"
              >
                <span>Save current search</span>
                <FaChevronDown className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 