import { MapPinIcon, CalendarIcon, SparklesIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadScriptNext, Autocomplete } from "@react-google-maps/api";
import { toast } from "react-toastify";
import { getCurrentTime } from "../../utils/DateFunction.js";

const RSB = () => {
    const [activeTab, setActiveTab] = useState("rent");
    const [place, setPlace] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [startDate, setStartDate] = useState(getCurrentTime());
    const [endDate, setEndDate] = useState("");
    const [tripDuration, setTripDuration] = useState("Select both dates");
    const [fade, setFade] = useState(false);

    const navigate = useNavigate();

    // Changing Header Text
    const headerTexts = [
        "Smart rentals, easy driving",
        "Affordable rides for less",
        "Great deals, Smooth drives",
        "Drive more, Spend less",
        "Compare and save on rental",
    ];
    const [headerIndex, setHeaderIndex] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setFade(true);
            setTimeout(() => {
                setHeaderIndex(
                    (prevIndex) => (prevIndex + 1) % headerTexts.length
                );
                setFade(false);
            }, 500);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Places API
    const placesAPILibraries = useMemo(() => ["places"], []);
    const placesAPIKey = import.meta.env.VITE_PLACES_API_KEY;

    const handlePlaceSelect = () => {
        if (autocomplete) {
            const placeDetails = autocomplete.getPlace();
            if (placeDetails.geometry) {
                const lat = placeDetails.geometry.location.lat();
                const lng = placeDetails.geometry.location.lng();
                setPlace({ name: placeDetails.name, lat, lng });

                let address = placeDetails.formatted_address.split(",");
                address =
                    address.length > 2
                        ? `${address[0]}, ${address[1]}, ${address.at(-2)}`
                        : address;
                setAddress(address);

                // FIXME: Fix this
                const cityComponent = placeDetails.address_components.find(
                    (component) => component.types.includes("locality")
                );

                if (cityComponent) {
                    setCity(cityComponent.long_name);
                    console.log(city);
                } else {
                    console.error("No city found");
                    setCity("");
                }
            }
        }
    };

    // Calculate Trip duration
    const calculateDuration = (currentStartDate, currentEndDate) => {
        const start = new Date(currentStartDate);
        const end = new Date(currentEndDate);

        if (isNaN(start) || isNaN(end)) {
            setTripDuration("Invalid Date");
            return;
        }

        const timeDifference = end - start;
        if (timeDifference < 0) {
            setTripDuration("0 Day(s) 0 Hour(s)");
            return;
        }

        const totalHours = Math.floor(timeDifference / (1000 * 60 * 60));
        const days = Math.floor(totalHours / 24);
        const hours = totalHours % 24;

        setTripDuration(`${days} Day(s) ${hours} Hour(s)`);
    };

    const startInputRef = useRef(null);
    const endInputRef = useRef(null);

    const handleStartDateClick = () => {
        if (startInputRef.current) {
            startInputRef.current.showPicker();
        }
    };

    const handleEndDateClick = () => {
        if (endInputRef.current) {
            endInputRef.current.showPicker();
        }
    };

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        if (endDate) {
            calculateDuration(newStartDate, endDate);
        }
    };
    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
        if (startDate) {
            calculateDuration(startDate, newEndDate);
        }
    };

    const handleSearch = () => {
        if (city && startDate && endDate) {
            const lat = place.lat;
            const lng = place.lng;
            const formattedCity =
                city === "Bengaluru" ? "bangalore" : city.toLowerCase();

            const stateData = {
                address,
                lat,
                lng,
                startDate,
                endDate,
                tripDuration,
            };

            sessionStorage.setItem("fromSearch", true);

            navigate(`/self-drive-car-rentals/${formattedCity}/cars`, {
                state: stateData,
            });
        } else {
            toast.error("Required fields are empty", {
                position: "top-center",
                autoClose: 1000 * 5,
            });
        }
    };

    return (
        <div className=" bg-[#212121] p-4 flex items-center justify-center my-5 mt-7">
            <div className="w-full max-w-lg space-y-4 p-2 py-4 rounded-lg">
                {/* Header */}
                <div className="bg-[#303030] rounded-full p-3">
                    <h1
                        className={`text-white text-center text-md transition-opacity duration-500 ${
                            fade ? "opacity-0" : "opacity-100"
                        }`}
                    >
                        <SparklesIcon className="inline-block w-5 h-5 mr-2 text-[#faffa4]" />
                        {headerTexts[headerIndex]}
                        <SparklesIcon className="inline-block w-5 h-5 ml-2 text-[#faffa4]" />
                    </h1>
                </div>

                {/* Book Now Section */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <div className="w-20 h-[1px] bg-gray-500"></div>
                        <h2 className="text-gray-400  font-normal">BOOK NOW</h2>
                        <div className="w-20 h-[1px] bg-gray-500"></div>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center gap-8 mb-6">
                        <button
                            onClick={() => setActiveTab("rent")}
                            className={`text-lg px-4 py-1 rounded-lg transition-colors duration-200 ${
                                activeTab === "rent"
                                    ? "bg-yellow-300 text-black"
                                    : "text-gray-400 hover:bg-yellow-300 hover:text-black"
                            }`}
                        >
                            Rent
                        </button>
                        <button
                            onClick={() => setActiveTab("subscribe")}
                            className={`text-sm px-4 py-1 rounded-lg transition-colors duration-200 ${
                                activeTab === "subscribe"
                                    ? "bg-yellow-300 text-black"
                                    : "text-gray-400 hover:bg-yellow-300 hover:text-black"
                            }`}
                        >
                            Subscribe
                        </button>
                        <button
                            onClick={() => setActiveTab("buy")}
                            className={`text-sm px-4 py-1 rounded-lg transition-colors duration-200 ${
                                activeTab === "buy"
                                    ? "bg-yellow-300 text-black"
                                    : "text-gray-400 hover:bg-yellow-300 hover:text-black"
                            }`}
                        >
                            Buy
                        </button>
                    </div>

                    {/* Location Input */}
                    <LoadScriptNext googleMapsApiKey={placesAPIKey} libraries={placesAPILibraries}>
  <div className="bg-[#303030] rounded-full py-3 px-6 flex justify-between items-center mb-4">
    <div className="flex items-center flex-grow">
      <MapPinIcon className="w-6 h-5 text-gray-400 mr-2" />
      <Autocomplete
        onLoad={setAutocomplete}
        onPlaceChanged={handlePlaceSelect}
        options={{ componentRestrictions: { country: "IN" } }}
      >
        <input
          type="text"
          placeholder="Enter a location"
          className="bg-[#303030] text-white outline-none w-full pl-2"
        />
      </Autocomplete>
    </div>
    <button className="flex flex-col items-center text-white text-xs hover:text-[#faffa4]">
    <img src="../public/images/Benefits/Group_1-removebg-preview.png" alt="Current Location" className="w-5 h-5" />
    <span>Current Location</span>
</button>
  </div>
</LoadScriptNext>

                    {/* Date Inputs */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Start Date Picker */}
                        <div
                            className="bg-[#303030] rounded-full p-2 flex items-center relative cursor-pointer text-sm"
                            
                        >
                            <CalendarIcon className="w-6 h-5 text-gray-400 absolute left-3 " />

                            <input
                                    type="datetime-local"
                                    step="3600"
                                     ref={startInputRef}
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    className="bg-[#303030] text-white outline-none pl-8 pr-2 w-full h-full rounded-full cursor-text"
/>

                            <span className="text-white pl-8">
                                {startDate
                                    ? new Intl.DateTimeFormat("en-US", {
                                          month: "short",
                                          day: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                      }).format(new Date(startDate))
                                    : "Select Date"}
                            </span>
                        </div>

                        {/* End Date Picker */}
                        <div
                            className="bg-[#303030] rounded-full p-2 flex items-center relative cursor-pointer text-sm"
                            
                        >
                            <CalendarIcon className="w-6 h-5 text-gray-400 absolute left-3" />
                            <input
    type="datetime-local"
    step="3600"
    ref={endInputRef}
    value={endDate}
    onChange={handleEndDateChange}
    className="bg-[#303030] text-white outline-none pl-8 pr-2 w-full h-full rounded-full cursor-text"
/>


                            <span className="text-white pl-8">
                                {endDate
                                    ? new Intl.DateTimeFormat("en-US", {
                                          month: "short",
                                          day: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                      }).format(new Date(endDate))
                                    : "Select End Date"}
                            </span>
                        </div>
                    </div>

                    {/* Trip Duration */}
                    <div className="bg-[#303030] rounded-full p-2 mb-4">
                        <div className="text-gray-400 text-sm">
                            Trip Duration
                        </div>
                        <div className="text-white text-lg">{tripDuration}</div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="w-full bg-[#eeff87] hover:bg-[#e2ff5d] text-black font-medium py-3 rounded-full transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RSB;
