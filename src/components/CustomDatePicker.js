import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isWeekend, isSameDay, getDay, isSameMonth } from 'date-fns';
import { toast } from 'sonner';

const CustomDatePicker = ({
  selectedDates = [],
  onChange,
  disabledDates = [],
  isCompOff = false,
  maxDays,
  minDate = new Date(),
  shiftType = 'FULL_DAY',
  onShiftTypeChange,
  departmentInfo = null,
  leavePolicy = null,
  weeklyOffs = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState(shiftType);
  const [selectedDateObjects, setSelectedDateObjects] = useState([]);
  const [hoverDate, setHoverDate] = useState(null);
  const [frozenDates, setFrozenDates] = useState([]);
  const calendarRef = useRef(null);
  const inputRef = useRef(null);
  const calendarPopupRef = useRef(null);

  const timeSlotOptions = [
    { value: 'FULL_DAY', label: 'Full Day' },
    { value: 'FIRST_HALF', label: 'First Half (Morning)' },
    { value: 'SECOND_HALF', label: 'Second Half (Evening)' }
  ];

  // Handle shift type change
  const handleShiftTypeChange = (e) => {
    const newShiftType = e.target.value;
    setTimeSlot(newShiftType);
    // Do NOT update all selected dates' shiftType here
    // Only new selections will use the current dropdown value
    if (onShiftTypeChange) {
      onShiftTypeChange({
        ...e,
        target: {
          ...e.target,
          value: newShiftType
        }
      });
    }
  };

  useEffect(() => {
    if (selectedDates.length > 0) {
      setSelectedDateObjects(selectedDates.map(date => ({
        date: date.date instanceof Date ? date.date : new Date(date.date),
        shiftType: date.shiftType || timeSlot,
        timeSlot: date.timeSlot || timeSlot
      })));
    } else {
      setSelectedDateObjects([]);
    }
  }, [selectedDates, timeSlot]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarPopupRef.current && 
        !calendarPopupRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Debug logs for leave policy and restrictions
  useEffect(() => {
    const restrictions = leavePolicy?.leaveAllocations?.[0]?.restrictions?.[0];
    const restrictedDays = restrictions?.restrictedDays || [];
    const allowedValue = restrictions?.allowedValue;
    console.log('[CustomDatePicker] leavePolicy:', leavePolicy);
    console.log('[CustomDatePicker] restrictedDays:', restrictedDays);
    console.log('[CustomDatePicker] allowedValue:', allowedValue);
    console.log('[CustomDatePicker] selectedDateObjects:', selectedDateObjects);
    console.log('[CustomDatePicker] frozenDates:', frozenDates);
    if (restrictedDays.length) {
      const selectedRestricted = selectedDateObjects.filter(selected =>
        restrictedDays.includes(format(selected.date, 'EEE'))
      );
      console.log('[CustomDatePicker] selected restricted days:', selectedRestricted.map(d => d.date));
    }
    // Debug log for weeklyOffs
    console.log('[CustomDatePicker] weeklyOffs:', weeklyOffs, isCompOff ? '(ignored for comp-off)' : '');
  }, [leavePolicy, selectedDateObjects, frozenDates, weeklyOffs, isCompOff]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
    if (disabledDates.some(disabledDate => isSameDay(new Date(disabledDate), date))) return true;
    if (frozenDates.some(frozenDate => isSameDay(frozenDate, date))) return true;

    // Freeze weekly offs - but skip this for comp-off requests
    if (!isCompOff && weeklyOffs && weeklyOffs.length > 0) {
      const dayName = format(date, 'EEEE'); // 'Sunday', 'Monday', etc.
      if (weeklyOffs.includes(dayName)) return true;
    }

    // Weekly holidays
    if (departmentInfo?.weeklyHolidays) {
      const weekDays = departmentInfo.weeklyHolidays.split(',').map(day => day.trim());
      const dayName = format(date, 'EEEE');
      if (weekDays.includes(dayName)) return true;
    }

    // Dynamic restricted days from leave policy
    const restrictions = leavePolicy?.leaveAllocations?.[0]?.restrictions?.[0];
    if (restrictions?.restrictedDays && restrictions?.allowedValue !== undefined) {
      const dayName = format(date, 'EEE');
      if (restrictions.restrictedDays.includes(dayName)) {
        // Count how many restricted days are already selected
        const restrictedSelected = selectedDateObjects.filter(selected => 
          restrictions.restrictedDays.includes(format(selected.date, 'EEE'))
        );
        if (restrictedSelected.length >= restrictions.allowedValue &&
            !restrictedSelected.some(selected => isSameDay(selected.date, date))) {
          return true;
        }
      }
    }

    return false;
  };

  const isDateSelected = (date) => {
    return selectedDateObjects.some(selected => isSameDay(selected.date, date));
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    let newSelectedDates;
    const restrictions = leavePolicy?.leaveAllocations?.[0]?.restrictions?.[0];
    const restrictedDays = restrictions?.restrictedDays || [];
    const allowedValue = restrictions?.allowedValue;
    const dayName = format(date, 'EEE');

    // Debug log for click
    console.log('[CustomDatePicker] handleDateClick:', {
      date,
      dayName,
      restrictedDays,
      allowedValue,
      selectedDateObjects,
      frozenDates
    });

    // Check if date is already selected
    const isAlreadySelected = selectedDateObjects.some(selected => 
      isSameDay(selected.date, date)
    );

    if (isAlreadySelected) {
      // Allow removing any selected date (not just start or end)
      newSelectedDates = selectedDateObjects.filter(selected => !isSameDay(selected.date, date));

      // If a restricted day is being unselected, unfreeze all restricted days for that month
      if (restrictedDays.includes(dayName)) {
        const month = date.getMonth();
        const year = date.getFullYear();
        setFrozenDates(prev => prev.filter(d => d.getMonth() !== month || d.getFullYear() !== year));
      }
    } else {
      // Check max days limit
      if (maxDays && selectedDateObjects.length >= maxDays) {
        toast.error(`You can only select up to ${maxDays} days`);
        return;
      }

      // For comp-off, replace all selected dates with the new one
      if (isCompOff) {
        const newDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        newSelectedDates = [{ 
          date: newDate,
          shiftType: timeSlot,
          timeSlot: timeSlot
        }];
      } else {
        // Dynamic restricted days from leave policy
        if (restrictedDays.length && allowedValue !== undefined) {
          if (restrictedDays.includes(dayName)) {
            // Count how many restricted days are already selected
            const restrictedSelected = selectedDateObjects.filter(selected => 
              restrictions.restrictedDays.includes(format(selected.date, 'EEE'))
            );
            if (restrictedSelected.length >= allowedValue) {
              toast.error(`You can only select up to ${allowedValue} restricted day(s)`);
              return;
            }
            // Freeze all other restricted days in the same month
            const month = date.getMonth();
            const year = date.getFullYear();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const newFrozen = [];
            for (let d = 1; d <= daysInMonth; d++) {
              const dObj = new Date(year, month, d);
              const dName = format(dObj, 'EEE');
              if (restrictedDays.includes(dName) && !isSameDay(dObj, date)) {
                newFrozen.push(dObj);
              }
            }
            setFrozenDates(prev => ([...prev, ...newFrozen]));
          }
        }

        // Allow adding any date (no adjacency requirement)
        const newDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        newSelectedDates = [...selectedDateObjects, { 
          date: newDate,
          shiftType: timeSlot,
          timeSlot: timeSlot
        }];
      }
    }

    // Sort dates chronologically for display
    newSelectedDates.sort((a, b) => a.date - b.date);
    setSelectedDateObjects(newSelectedDates);
    onChange(newSelectedDates);
  };

  const removeDate = (dateToRemove) => {
    const newDates = selectedDateObjects.filter(selected => 
      !isSameDay(selected.date, dateToRemove)
    );
    setSelectedDateObjects(newDates);
    onChange(newDates);
  };

  return (
    <div className="relative" ref={calendarRef}>
      <div className="w-full space-y-2">
        {/* Time Slot Selector - Always visible */}
        <select
          value={timeSlot || "Full Day"}
          onChange={handleShiftTypeChange}
          className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
        >
          {timeSlotOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Date Picker Trigger */}
        <div
          ref={inputRef}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg flex items-center justify-between cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all duration-200 bg-white"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <span className="text-gray-700 font-medium">
            {selectedDateObjects.length > 0 ? 'Selected Days' : 'Select Day'}
          </span>
          <CalendarIcon className="h-5 w-5 text-blue-500" />
        </div>

        {/* Selected Dates Display */}
        {selectedDateObjects.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {selectedDateObjects.map((selected) => {
                const dateObj = selected.date instanceof Date ? selected.date : new Date(selected.date);
                
                const shiftTypeLabel = timeSlotOptions.find(option => option.value === selected.shiftType)?.label || selected.shiftType;
                return (
                  <div
                    key={dateObj.toISOString()}
                    className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <span className="font-medium">{format(dateObj, 'dd MMM yyyy')}</span>
                    <span className="text-xs text-blue-600 ml-1">
                      {shiftTypeLabel}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDate(dateObj);
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Calendar Popup */}
        {isOpen && (
          <div 
            ref={calendarPopupRef}
            className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg transform transition-all duration-200 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <span className="font-semibold text-gray-800">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 p-1.5">
                    {day}
                  </div>
                ))}
                {getDaysInMonth(currentMonth).map((date, index) => (
                  <div
                    key={index}
                    className={`
                      relative p-1.5 text-center cursor-pointer rounded-md transition-all duration-200
                      ${!date ? 'invisible' : ''}
                      ${isDateDisabled(date) ? 'text-gray-300 cursor-not-allowed' : 
                        isDateSelected(date) ? 'bg-blue-500 text-white hover:bg-blue-600' :
                        'hover:bg-blue-50 text-gray-700'
                      }
                      ${frozenDates.some(frozenDate => isSameDay(frozenDate, date)) ? 'bg-gray-100' : ''}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      date && handleDateClick(date);
                    }}
                    onMouseEnter={() => setHoverDate(date)}
                    onMouseLeave={() => setHoverDate(null)}
                  >
                    {date ? (
                      <>
                        <span className={`
                          relative z-10 font-medium
                          ${isDateSelected(date) ? 'text-white' : ''}
                        `}>
                          {format(date, 'd')}
                        </span>
                        {isDateSelected(date) && (
                          <span className="absolute inset-0 rounded-md bg-blue-500 shadow-sm"></span>
                        )}
                      </>
                    ) : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDatePicker; 