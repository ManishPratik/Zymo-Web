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
    let currMinutes = now.getMinutes(); // Round minutes to 0 or 30

    // Convert currHours to 12-hour format
    const get12HourFormat = (hours) => {
        return hours % 12 || 12; // Converts 0 to 12
    };

    const getInitialAmpm = () => {
        let isPM = currHours >= 12;
        return isPM ? "PM" : "AM"; // Corrected logic
    };

    const [hour, setHour] = useState(get12HourFormat(currHours)); // Initialize with 12-hour format
    const [minute, setMinute] = useState(currMinutes);
    const [ampm, setAmpm] = useState(getInitialAmpm());

    const adjustTime = (type, value) => {
        if (type === "hour") {
            setHour((prev) => {
                let newHour = (prev + value) % 12;
                return newHour > 0 ? newHour : newHour + 12; // Ensures hour is always between 1-12
            });
        }
        if (type === "minute") {
            setMinute((prev) => (prev === 30 ? 0 : 30)); // Corrected logic
        }
        if (type === "ampm") setAmpm((prev) => (prev === "AM" ? "PM" : "AM"));
    };

    const handleSave = () => {
        const newDate = new Date(selectedDate);

        let adjustedHour = hour % 12;
        if (ampm === "PM") adjustedHour += 12;

        newDate.setHours(adjustedHour, minute, 0, 0); // Use setHours (LOCAL time)

        onSave(newDate);
        onClose();
    };

    return (
        <div className="absolute top-full mt-2 bg-[#212121] shadow-lg border border-gray-500 p-4 rounded-md z-50 w-80 sm:w-96 md:w-auto">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                {/* Date Picker */}
                <div className="flex flex-col w-full sm:w-auto">
                    <label className="text-gray-300 text-sm mb-1">
                        Select Date
                    </label>
                    {/* <input
                        type="date"
                        className=" p-2 rounded bg-[#404040]  text-white w-full sm:w-auto"
                        value={selectedDate.toLocaleDateString("en-CA")}
                        onChange={(e) =>
                            setSelectedDate(new Date(e.target.value))
                        }
                        min={selectedDate.toISOString().split("T")[0]} 
                    /> */}
                    <input
                        type="date"
                        className="p-2 rounded bg-[#404040] text-white w-full sm:w-auto"
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
                        } />
                </div>

                {/* Time Picker */}
                <div className="flex flex-col w-full sm:w-auto md:border-l-2 border-gray-500 ">
                    <label className="text-gray-300 text-sm mb-1">
                        Select Time
                    </label>
                    <div className="flex items-center justify-between bg-[#212121] p-2 rounded text-white w-full md:ml-2 sm:w-auto">
                        {/* Hour */}
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => adjustTime("hour", 1)}
                                aria-label="Increase Hour"
                            >
                                <ChevronUp />
                            </button>
                            <span className="text-lg font-semibold">
                                {hour}
                            </span>
                            <button
                                onClick={() => adjustTime("hour", -1)}
                                aria-label="Decrease Hour"
                            >
                                <ChevronDown />
                            </button>
                        </div>

                        <span className="text-lg font-semibold px-2">:</span>

                        {/* Minute */}
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => adjustTime("minute", 1)}
                                aria-label="Increase Minute"
                            >
                                <ChevronUp />
                            </button>
                            <span className="text-lg font-semibold">
                                {minute.toString().padStart(2, "0")}
                            </span>
                            <button
                                onClick={() => adjustTime("minute", -1)}
                                aria-label="Decrease Minute"
                            >
                                <ChevronDown />
                            </button>
                        </div>

                        <span className="text-lg font-semibold px-2">:</span>

                        {/* AM/PM */}
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => adjustTime("ampm", 1)}
                                aria-label="Toggle AM/PM"
                            >
                                <ChevronUp />
                            </button>
                            <span className="text-lg font-semibold">
                                {ampm}
                            </span>
                            <button
                                onClick={() => adjustTime("ampm", -1)}
                                aria-label="Toggle AM/PM"
                            >
                                <ChevronDown />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    className="bg-[#faffa4] text-black px-4 py-2 rounded-md w-full sm:w-auto font-semibold mt-4 sm:mt-0"
                    onClick={handleSave}
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default DateTimeOverlay;
