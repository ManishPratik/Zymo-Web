import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { getCurrentTime } from "../utils/DateFunction";

const DateTimeOverlay = ({
    selectedDate,
    setSelectedDate,
    onSave,
    onClose,
    minDate,
}) => {
    const now = new Date(getCurrentTime());
    let currHours = now.getHours();
    let currMinutes = now.getMinutes();
   
    // Convert currHours to 12-hour format
    const get12HourFormat = (hours) => {
        return hours % 12 || 12; // Converts 0 to 12
    };

    const getInitialAmpm = () => {
        let isPM = currHours >= 12;
        return isPM ? "PM" : "AM";
    };

    const [hour, setHour] = useState(get12HourFormat(currHours));
    const [minute, setMinute] = useState(currMinutes);
    const [ampm, setAmpm] = useState(getInitialAmpm());

    const adjustTime = (type, value) => {
        if (type === "hour") {
            setHour((prev) => {
                let newHour = (prev + value) % 12;
                return newHour > 0 ? newHour : newHour + 12;
            });
        }
        if (type === "minute") {
            setMinute((prev) => (prev === 30 ? 0 : 30));
        }
        if (type === "ampm") setAmpm((prev) => (prev === "AM" ? "PM" : "AM"));
    };

    const handleSave = () => {
        const newDate = new Date(selectedDate);

        let adjustedHour = hour % 12;
        if (ampm === "PM") adjustedHour += 12;

        newDate.setHours(adjustedHour, minute, 0, 0);

        onSave(newDate);
        onClose();
    };

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#3a3a3a] shadow-xl rounded-lg p-5 z-50 w-full max-w-md">
            <div className="flex flex-col space-y-5">
                {/* Date Picker */}
                <div>
                    <label className="block text-gray-300 text-sm mb-2">
                        Select Date
                    </label>
                    <input
                        type="date"
                        className="w-full p-3 rounded-lg bg-[#2d2d2d] text-white border border-gray-600 focus:border-[#faffa4] focus:outline-none"
                        value={
                            selectedDate instanceof Date && !isNaN(selectedDate)
                                ? selectedDate.toISOString().split("T")[0]
                                : ""
                        }
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                                const newDate = new Date(value);
                                if (!isNaN(newDate)) {
                                    setSelectedDate(newDate);
                                }
                            } else {
                                setSelectedDate(null);
                            }
                        }}
                        min={
                            minDate instanceof Date && !isNaN(minDate)
                                ? minDate.toISOString().split("T")[0]
                                : undefined
                        }
                    />
                </div>

                {/* Time Picker */}
                <div>
                    <label className="block text-gray-300 text-sm mb-2">
                        Select Time
                    </label>
                    <div className="flex items-center justify-center bg-[#2d2d2d] p-3 rounded-lg text-white border border-gray-600">
                        {/* Hour */}
                        <div className="flex flex-col items-center mx-2">
                            <button
                                className="hover:text-[#faffa4] p-1"
                                onClick={() => adjustTime("hour", 1)}
                                aria-label="Increase Hour"
                            >
                                <ChevronUp size={18} />
                            </button>
                            <span className="text-lg font-semibold my-1">
                                {hour.toString().padStart(2, "0")}
                            </span>
                            <button
                                className="hover:text-[#faffa4] p-1"
                                onClick={() => adjustTime("hour", -1)}
                                aria-label="Decrease Hour"
                            >
                                <ChevronDown size={18} />
                            </button>
                        </div>

                        <span className="text-lg font-semibold">:</span>

                        {/* Minute */}
                        <div className="flex flex-col items-center mx-2">
                            <button
                                className="hover:text-[#faffa4] p-1"
                                onClick={() => adjustTime("minute", 1)}
                                aria-label="Increase Minute"
                            >
                                <ChevronUp size={18} />
                            </button>
                            <span className="text-lg font-semibold my-1">
                                {minute.toString().padStart(2, "0")}
                            </span>
                            <button
                                className="hover:text-[#faffa4] p-1"
                                onClick={() => adjustTime("minute", -1)}
                                aria-label="Decrease Minute"
                            >
                                <ChevronDown size={18} />
                            </button>
                        </div>

                        {/* AM/PM */}
                        <div className="flex flex-col items-center mx-2 ml-4">
                            <button
                                className="hover:text-[#faffa4] p-1"
                                onClick={() => adjustTime("ampm", 1)}
                                aria-label="Toggle AM/PM"
                            >
                                <ChevronUp size={18} />
                            </button>
                            <span className="text-lg font-semibold my-1">
                                {ampm}
                            </span>
                            <button
                                className="hover:text-[#faffa4] p-1"
                                onClick={() => adjustTime("ampm", -1)}
                                aria-label="Toggle AM/PM"
                            >
                                <ChevronDown size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                    <button
                        className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-500 transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="flex-1 bg-[#faffa4] text-black px-4 py-3 rounded-lg hover:bg-[#e7e794] transition-colors font-medium"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateTimeOverlay;