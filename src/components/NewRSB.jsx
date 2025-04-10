import { useEffect, useMemo, useState } from "react";
import { MapPinIcon, CalendarIcon, SparklesIcon, LocateFixed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadScriptNext, Autocomplete } from "@react-google-maps/api";
import { toast } from "react-toastify";
import DateTimeOverlay from "./DateTimeOverlay"; // Import the custom DateTimeOverlay
import { getCurrentTime } from "../utils/DateFunction";
import { constructNow } from "date-fns";
// import RectGA from "react-ga4";
import useTrackEvent from "../hooks/useTrackEvent";

const NewRSB = ({urlcity}) => {
    const [activeTab, setActiveTab] = useState("rent");
    const [placeInput, setPlaceInput] = useState(urlcity || "");
    const [place, setPlace] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [startDate, setStartDate] = useState(new Date(getCurrentTime()));
    const [endDate, setEndDate] = useState(null);
    const [tripDuration, setTripDuration] = useState("Select both dates");
    const [tripDurationHours, setTripDurationHours] = useState("");
    const [fade, setFade] = useState(false);
    const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
    const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);
    const [disableBtn, setDisableBtn] = useState(false);

    const navigate = useNavigate();
    const trackEvent = useTrackEvent();


    // Header text rotation
    const headerTexts = [
        "Smart rentals, easy driving",
        "Affordable rides for less",
        "Great deals, Smooth drives",
        "Drive more, Spend less",
        "Compare and save on rental",
    ];
    const [headerIndex, setHeaderIndex] = useState(0);


     

    const fetchAutocompleteDetails = (inputCity) => {
        if (!inputCity || !window.google) return;
        
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
            { input: inputCity, componentRestrictions: { country: "IN" } },
            (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions?.length > 0) {
                    const placeId = predictions[0].place_id;
                    const placesService = new window.google.maps.places.PlacesService(
                        document.createElement("div")
                    );
                    
                    placesService.getDetails({ placeId }, (placeDetails, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK && placeDetails?.geometry) {
                            setAutocomplete(placeDetails);
                            setPlace({
                                name: placeDetails.name,
                                lat: placeDetails.geometry.location.lat(),
                                lng: placeDetails.geometry.location.lng(),
                            });
                            setPlaceInput(placeDetails.formatted_address);
                            
                            const address = placeDetails.formatted_address.split(",");
                            setAddress(
                                address.length > 2
                                    ? `${address[0]}, ${address[1]}, ${address.at(-2)}`
                                    : address
                            );
                            
                            const city = extractCityFromComponents(placeDetails.address_components);
                            setCity(city);
                            
                        
                        } else {
                            console.error("Failed to fetch place details.");
                        }
                    });
                } else {
                    console.error("No place predictions found.");
                }
            }
        );
    };
    
    // Effect to trigger autocomplete on page load when `urlcity` changes
    useEffect(() => {
        if (!urlcity) return;

        // Ensure we have a short delay before calling autocomplete (after city is set)
        const timer = setTimeout(() => {
            fetchAutocompleteDetails(urlcity);
        }, 1000); // 1-second delay to ensure the input field is populated

        return () => clearTimeout(timer); // Clean up timeout
    }, [urlcity]); // Re-run the effect when the `urlcity` changes
  



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
    }, [headerTexts.length]);


    //Google analytics for RSB section
    const handleRSBClicks = (label) => {
        trackEvent("RSB Section", "RSB User Choice", label);
    }
    const handleRSBFunctionClicks = (label) => {
        trackEvent("RSB Functions Section", "RSB Function Action Chosen", `${label} - ${activeTab}`);
    }


    // Places API
    const placesAPILibraries = useMemo(() => ["places"], []);
    const placesAPIKey = import.meta.env.VITE_PLACES_API_KEY;

    const extractCityFromComponents = (components) => {
        const cityTypesPriority = [
            "locality",                                       
            "sublocality_level_1",             
            "sublocality",                    
            "neighborhood",                   
            "administrative_area_level_3",  
            "administrative_area_level_2",     
            "administrative_area_level_1"   
        ];
        
    
        for (let type of cityTypesPriority) {
            const match = components.find((c) => c.types.includes(type));
            if (match) {
                console.log("Matched city type:", type, "→", match.long_name);
                return match.long_name;
            }
        }
    
        console.warn("No suitable city component found.");
        return "";
    };
    

    const handlePlaceSelect = () => {
        if (autocomplete) {
            const placeDetails = autocomplete.getPlace();
            if (placeDetails.geometry) {
                const lat = placeDetails.geometry.location.lat();
                const lng = placeDetails.geometry.location.lng();
                setPlace({ name: placeDetails.name, lat, lng });

                const address = placeDetails.formatted_address.split(",");
                setAddress(
                    address.length > 2
                        ? `${address[0]}, ${address[1]}, ${address.at(-2)}`
                        : address
                );
                const city = extractCityFromComponents(placeDetails.address_components);
setCity(city);

            

                // Update placeInput with the selected place's formatted address
                setPlaceInput(placeDetails.formatted_address);
            }
        }
    };
    

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    // Use Google Maps Geocoding API to get the address
                    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${placesAPIKey}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === "OK") {
                                const placeDetails = data.results[0];
                                const lat = latitude;
                                const lng = longitude;
                                setPlace({ name: placeDetails.formatted_address, lat, lng });

                                const address = placeDetails.formatted_address.split(",");
                                setAddress(
                                    address.length > 2
                                        ? `${address[0]}, ${address[1]}, ${address.at(-2)}`
                                        : address
                                );

                                const city = extractCityFromComponents(placeDetails.address_components);
                                setCity(city);
                                
                            

                                // Update the input field with the current location
                                setPlaceInput(placeDetails.formatted_address);
                                console.log("city", cityComponent);
                                console.log("placeInput", placeInput);
                                console.log("placeDetails.formatted_address", placeDetails.formatted_address);
                            } else {
                                toast.error("Unable to fetch location details", {
                                    position: "top-center",
                                    autoClose: 1000 * 5,
                                });
                            }
                        })
                        .catch(error => {
                            toast.error("Error fetching location details", {
                                position: "top-center",
                                autoClose: 1000 * 5,
                            });
                        });
                },
                (error) => {
                    toast.error("Unable to retrieve your location", {
                        position: "top-center",
                        autoClose: 1000 * 5,
                    });
                }
            );
        } else {
            toast.error("Geolocation is not supported by this browser", {
                position: "top-center",
                autoClose: 1000 * 5,
            });
        }
    };

 
    // Calculate Trip Duration
    const calculateDuration = (currentStartDate, currentEndDate) => {
        const start = new Date(currentStartDate);
        let end;
        if (activeTab === "subscribe") {
            end = new Date(start);
            end.setDate(end.getDate() + 30); // Set end date to 30 days from start date
            setEndDate(end); // Automatically set the end date
        } else {
            end = new Date(currentEndDate);
        }

        if (isNaN(start) || isNaN(end)) {
            setTripDuration("Invalid Date");
            return;
        }

        const timeDifference = end - start;
        // if (timeDifference < 0) {
        //     setTripDuration("0 Day(s) 0 Hour(s)");
        //     toast.error("Should greater than  0 Hour(s) !")
        //     return;
        // }

        if (timeDifference < 8 * 60 * 60 * 1000) { // 8 hours in milliseconds
            console.log("Time difference is less than 8 hours", timeDifference); // Debugging log
            setTripDuration("Time should greater than 8+ hrs !");
            setDisableBtn(true);
            toast.error("End time should be greater than start time by at least 8 hours!", {
                position: "top-center",
                autoClose: 5000, // 5 seconds
            });
            return;
        } else {
            setDisableBtn(false); // Enable the button if the condition is met
        }

        const totalHours = Math.floor(timeDifference / (1000 * 60 * 60));
        setTripDurationHours(totalHours);
        const days = Math.floor(totalHours / 24);
        const hours = totalHours % 24;

        setTripDuration(`${days} Day(s) ${hours} Hour(s)`);
    };


    const handleSearch = () => {
        if (city && startDate && endDate) {
            if (!place || !place.lat || !place.lng) {
                toast.error("Please select a valid location", {
                    position: "top-center",
                    autoClose: 5000,
                });
                return;
            }
    
            const formattedCity = city === "Bengaluru" ? "bangalore" : city.toLowerCase();
            const stateData = {
                address: address || place.name,  // Ensure the address is included
                lat: place.lat,
                lng: place.lng,
                startDate,
                endDate,
                tripDuration,
                tripDurationHours,
                activeTab,
            };
            console.log(formattedCity);
    
            console.log("Navigating with:", stateData); // Debugging
    
            handleRSBFunctionClicks("Search");
            sessionStorage.setItem("fromSearch", true);
    
            navigate(`/self-drive-car-rentals/${formattedCity}/cars`, {
                state: stateData,
            });
        } else {
            toast.error("Required fields are empty", {
                position: "top-center",
                autoClose: 5000,
            });
        }
    };
    


    const handleTabClick = (tab) => {
        handleRSBClicks(tab); // RSB clicked
        setActiveTab(tab);
        if (tab === "buy") {
            navigate("/buy"); // Navigate to the buy page
        }

        if (tab === "subscribe") {
            //calculate current date + 30 days
            const newEndDate = new Date(startDate);
            newEndDate.setDate(newEndDate.getDate() + 30);
            setEndDate(newEndDate);
            calculateDuration(startDate, newEndDate);
        }

    };

    return (
        <>
            {/* Header */}
            <div className="bg-[#303030] rounded-full p-3 mx-auto mb-6 w-full max-w-md sm:w-[60%] md:max-w-xl lg:max-w-2xl">
                <h1
                    className={`text-white text-center text-md transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"
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
                    <div className="w-24 h-[1px] bg-gray-500"></div>
                    <h2 className="text-gray-400 font-normal">BOOK NOW</h2>
                    <div className="w-24 h-[1px] bg-gray-500"></div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-8 mb-6">
                    {["rent", "subscribe", "buy"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            className={`text-lg ${activeTab === tab
                                ? "text-white border-b-2 border-gray-200"
                                : "text-gray-400"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 mx-auto w-full max-w-[90%] md:max-w-[80%]">
                    {/* Location Input */}
                    <LoadScriptNext googleMapsApiKey={placesAPIKey} libraries={placesAPILibraries}>
                        <div className="flex items-center border border-gray-500 bg-[#212121] rounded-md px-4 py-2 w-full overflow-hidden">
                            {/* Icon */}
                            <MapPinIcon className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />

                            {/* Input Field */}
                            <Autocomplete
                               onLoad={(autocompleteInstance) => setAutocomplete(autocompleteInstance)}
                               onPlaceChanged={handlePlaceSelect}
                                
                                options={{ componentRestrictions: { country: "IN" } }}
                            >
                                <input
                                    type="text"
                                    placeholder="Enter a location"
                                    className="bg-transparent text-white outline-none w-full placeholder-gray-400 flex-grow truncate"
                                    value={placeInput}
                                    onChange={(e) => setPlaceInput(e.target.value)}
                                    // onFocus={(e) => e.target.select()} // Ensures re-selection
                                />
                            </Autocomplete>

                            {/* Current Location Button */}
                            <button
                                className="flex items-center text-gray-300 hover:text-[#faffa4] ml-2 flex-shrink-0"
                                onClick={() => getCurrentLocation()}
                            >
                                <img
                                    src="/images/Benefits/Group_1-removebg-preview.png"
                                    alt="Current Location"
                                    className="w-5 h-5 mr-1"
                                />
                                <span className="text-xs hidden sm:inline">Get Location</span>
                            </button>
                        </div>
                    </LoadScriptNext>

                    {/* Start Date Picker */}
                    <div className="relative w-full">
                        <div
                            className="rounded-lg p-1 py-2 flex items-center relative cursor-pointer text-sm border border-gray-500 w-full h-10"
                            onClick={() => {
                                setIsStartPickerOpen(true);
                                setIsEndPickerOpen(false);
                                handleRSBFunctionClicks("Start Date Selected");
                            }}
                        >
                            <CalendarIcon className="w-6 h-4 text-gray-400 absolute left-4" />
                            <span className="text-gray-200 pl-10">
                                {startDate
                                    ? new Intl.DateTimeFormat("en-US", {
                                        month: "short",
                                        day: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    }).format(new Date(startDate))
                                    : "Select Start Date"}
                            </span>
                        </div>
                        {isStartPickerOpen && (
                            <DateTimeOverlay
                                selectedDate={startDate}
                                setSelectedDate={setStartDate}
                                onSave={(value) => {
                                    setStartDate(value);
                                    if (endDate)
                                        calculateDuration(value, endDate);
                                    setIsStartPickerOpen(false);
                                }}
                                onClose={() => setIsStartPickerOpen(false)}
                            />
                        )}
                    </div>

                    {/* End Date Picker */}
                    { }
                    <div className={` ${(activeTab == "subscribe") ? "hidden" : "relative w-full"}`}>
                        <div
                            className={`rounded-lg p-1 flex items-center relative cursor-pointer text-sm border border-gray-500 w-full h-10  ${activeTab === "subscribe" ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => {
                                if (activeTab !== "subscribe") {
                                    setIsEndPickerOpen(true);
                                    setIsStartPickerOpen(false);
                                    handleRSBFunctionClicks("End Date Selected")
                                }
                            }}
                            disabled={activeTab === "subscribe"}
                        >
                            <CalendarIcon className="w-6 h-4 text-gray-400 absolute left-4" />
                            <span className="text-gray-200 pl-10">
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
                        {isEndPickerOpen && (
                            <DateTimeOverlay
                                selectedDate={endDate || new Date()}
                                setSelectedDate={setEndDate}
                                onSave={(value) => {
                                    setEndDate(value);
                                    if (startDate)
                                        calculateDuration(startDate, value);
                                    setIsEndPickerOpen(false);
                                }}
                                onClose={() => setIsEndPickerOpen(false)}
                            />
                        )}
                    </div>
                </div>

                {/* Trip Duration */}
                <div className="bg-[#303030] rounded-lg p-2 mb-4 text-center mx-auto max-w-[90%] md:max-w-[50%]">
                    <div className="text-gray-400 text-sm">Trip Duration</div>
                    <div className="text-white text-lg">{tripDuration}</div>
                </div>

                {/* Search Button */}
                <div className="mx-auto max-w-[90%] md:max-w-[50%] mb-7">
                    {disableBtn
                        ? <button
                            disabled
                            onClick={handleSearch}
                            className="w-full bg-[#faffa4] opacity-50 cursor-not-allowed
 text-black font-medium py-3 rounded-lg transition-colors"
                        >
                            Search
                        </button>
                        :
                        <button

                            onClick={handleSearch}
                            className="w-full bg-[#faffa4] hover:bg-[#faffa8] text-black font-medium py-3 rounded-lg transition-colors"
                        >
                            Search
                        </button>
                    }

                </div>
            </div>
        </>
    );
};

export default NewRSB;
