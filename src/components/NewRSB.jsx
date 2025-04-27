import { useEffect, useMemo, useState } from "react";
import {
  MapPinIcon,
  CalendarIcon,
  SparklesIcon,
  LocateFixed,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadScriptNext, Autocomplete } from "@react-google-maps/api";
import { toast } from "react-toastify";
import DateTimeOverlay from "./DateTimeOverlay"; // Import the custom DateTimeOverlay
import { getCurrentTime } from "../utils/DateFunction";
import { constructNow } from "date-fns";
// import RectGA from "react-ga4";
import useTrackEvent from "../hooks/useTrackEvent";

const NewRSB = ({ urlcity }) => {
  const [activeTab, setActiveTab] = useState("rent");
  const [placeInput, setPlaceInput] = useState(urlcity || "");
  const [place, setPlace] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
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

  // Places API
  const placesAPILibraries = useMemo(() => ["places"], []);
  const placesAPIKey = import.meta.env.VITE_PLACES_API_KEY;

  useEffect(() => {
    if (!placeInput) {
      setSuggestions([]); // Clear suggestions if input is empty
      return;
    }

    const fetchSuggestions = async () => {
      try {
        if (window.google?.maps?.places?.AutocompleteSuggestion) {
          const sessionToken =
            new window.google.maps.places.AutocompleteSessionToken();

          const response =
            await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
              {
                input: placeInput,
                includedRegionCodes: ["IN"], // Limit to India
                language: "en",
                sessionToken: sessionToken,
              }
            );

          // Map the new nested structure
          const formatted =
            response?.suggestions?.map((item) => {
              const prediction = item?.placePrediction;
              const placeId = prediction?.placeId || "";
              const fullText = prediction?.text?.text || "";
              const mainText = prediction?.mainText?.text || "";
              const secondaryText = prediction?.secondaryText?.text || "";

              // Extract city if available
              let cityName = secondaryText; // Assuming secondaryText contains the city or region

              return {
                placeId,
                fullAddress: fullText,
                displayName: `${mainText}${
                  secondaryText ? ", " + secondaryText : ""
                }`,
                city: cityName, // Add the city to the formatted data
              };
            }) || [];
          /*
        console.log("Raw suggestions:", response); // Optional for <debugging></debugging>
        console.log("Formatted suggestions:", formatted);*/

          setSuggestions(formatted);
        }
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300); // Debounce API calls
    return () => clearTimeout(debounce); // Cleanup
  }, [placeInput]);

  const handleSuggestionClick = async (sugg) => {
    setPlaceInput(sugg.fullAddress);
    setSuggestions([]);

    const placeDetails = await getPlaceDetails(sugg.placeId);
    if (placeDetails) {
      const cityName = extractCityFromDetails(placeDetails);

      setCity(cityName);

      const location = placeDetails.Eg.location || {};
      const lat = location.lat ?? "";
      const lng = location.lng ?? "";

      // Attach relevant data to a single object (assuming `setPlace`)
      setPlace({
        name: placeDetails.displayName || sugg.fullAddress,
        lat,
        lng,
        addressComponents: placeDetails.addressComponents || [],
      });
      /*
    console.log("City:", cityName);
    console.log("Lat:", lat, "Lng:", lng);*/
    }
  };

  const getPlaceDetails = async (placeId) => {
    try {
      const { Place } = await window.google.maps.importLibrary("places");

      const place = new Place({
        id: placeId,
        requestedLanguage: "en", // optional
      });

      await place.fetchFields({
        fields: [
          "addressComponents",
          "displayName",
          "formattedAddress",
          "location",
        ],
      });
      //console.log("Fetched place details:", place); // Debugging log

      return place; // `place` now contains the fetched fields
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  };

  // Function to extract the city from the place details
  const extractCityFromDetails = (place) => {
    const components = place?.addressComponents || [];

    const cityTypesPriority = [
      "locality",
      "sublocality_level_1",
      "sublocality",
      "neighborhood",
      "administrative_area_level_3",
      "administrative_area_level_2",
      "administrative_area_level_1",
    ];

    for (let type of cityTypesPriority) {
      const match = components.find((c) => {
        const types = c.types || c.Eg || [];
        return types.includes(type);
      });

      if (match) {
        const name = match.long_name || match.Fg || match.Gg || "";
        //console.log("Matched city type:", type, "→", name);
        return name;
      }
    }

    console.warn("No suitable city component found.");
    return "";
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setHeaderIndex((prevIndex) => (prevIndex + 1) % headerTexts.length);
        setFade(false);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, [headerTexts.length]);

  //Google analytics for RSB section
  const handleRSBClicks = (label) => {
    trackEvent("RSB Section", "RSB User Choice", label);
  };
  const handleRSBFunctionClicks = (label) => {
    trackEvent(
      "RSB Functions Section",
      "RSB Function Action Chosen",
      `${label} - ${activeTab}`
    );
  };
  const extractCityFromGeocodingResult = (place) => {
    const components = place?.address_components || [];

    const cityTypesPriority = [
      "locality",
      "sublocality_level_1",
      "sublocality",
      "neighborhood",
      "administrative_area_level_3",
      "administrative_area_level_2",
      "administrative_area_level_1",
    ];

    for (let type of cityTypesPriority) {
      const match = components.find((component) => {
        return component.types?.includes(type);
      });

      if (match) {
        return match.long_name || "";
      }
    }

    console.warn("No suitable city found in Geocoding API response");
    return "";
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Use Google Maps Geocoding API to get the address
          fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${placesAPIKey}`
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.status === "OK" && data.results && data.results[0]) {
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

                const cityName = extractCityFromGeocodingResult(placeDetails);
                setCity(cityName);
                console.log(city);

                // Update the input field with the current location
                setPlaceInput(placeDetails.formatted_address);
              } else {
                toast.error("Unable to fetch location details", {
                  position: "top-center",
                  autoClose: 1000 * 5,
                });
              }
            })
            .catch((error) => {
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

    if (timeDifference < 8 * 60 * 60 * 1000) {
      // 8 hours in milliseconds
      console.log("Time difference is less than 8 hours", timeDifference); // Debugging log
      setTripDuration("Time should greater than 8+ hrs !");
      setDisableBtn(true);
      toast.error(
        "End time should be greater than start time by at least 8 hours!",
        {
          position: "top-center",
          autoClose: 5000, // 5 seconds
        }
      );
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

      const formattedCity =
        city === "Bengaluru"
          ? "bangalore"
          : ["New Delhi", "Delhi Division", "Delhi"].includes(city)
          ? "delhi"
          : city.toLowerCase();

      const stateData = {
        address: address || place.name, // Ensure the address is included
        lat: place.lat,
        lng: place.lng,
        startDate,
        endDate,
        tripDuration,
        tripDurationHours,
        activeTab,
      };
      //console.log(formattedCity);

      //console.log("Navigating with:", stateData); // Debugging

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
      {/* <div className="bg-[#303030] rounded-full p-3 mx-auto mb-6 w-full max-w-md sm:w-[60%] md:max-w-xl lg:max-w-2xl"> */}
      <div className="bg-black rounded-full p-3 mx-auto mb-6 w-full max-w-md sm:w-[60%] md:max-w-xl lg:max-w-2xl z-20">
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
      <div className="text-center z-20">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="w-24 h-[1px] bg-white"></div>
          <h2 className="text-white font-normal">BOOK NOW</h2>
          <div className="w-24 h-[1px] bg-white"></div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-8 mb-6">
          {["rent", "subscribe", "buy"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`text-lg ${
                activeTab === tab
                  ? "text-white border-b-2 border-gray-200"
                  : "text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 mx-auto w-full max-w-[90%] md:max-w-[80%]">
          {/* Location Input */}
          <LoadScriptNext
            googleMapsApiKey={placesAPIKey}
            libraries={placesAPILibraries}
            version="beta"
          >
            <div
              className={`flex items-center border border-gray-500 rounded-md px-4 py-2 w-full 
      ${placeInput ? "bg-[#faffa4] text-black" : "bg-[#000000] text-white"}`}
            >
              {/* Map Pin Icon */}
              <MapPinIcon className="w-5 h-5 mr-2 flex-shrink-0" />

              {/* Input Field */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Enter a location"
                  className={`bg-transparent outline-none w-full placeholder-white truncate ${
                    placeInput ? "text-black placeholder-black" : "text-white"
                  }`}
                  value={placeInput}
                  onChange={(e) => setPlaceInput(e.target.value)}
                />

                {/* Suggestions Dropdown */}

                <ul className="absolute left-0 top-full mt-1 z-50 bg-[#252525] text-gray-200 rounded-lg shadow-md max-h-60 overflow-y-auto w-full min-w-[300px] no-underline">
                  {suggestions.map((sugg, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSuggestionClick(sugg)}
                      className="flex items-center px-3 py-2 sm:px-4 sm:py-2.5 hover:bg-[#faffa4] hover:text-[#212121] cursor-pointer text-xs sm:text-sm break-words border border-[#303030] transition-all duration-200 ease-in-out"
                    >
                      <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0 text-red-400" />
                      {sugg.displayName || sugg.fullAddress}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Get Current Location Button */}
              <button
                className={`flex items-center ml-2 flex-shrink-0 ${
                  placeInput
                    ? "text-black"
                    : "text-gray-300 hover:text-[#faffa4]"
                }`}
                onClick={getCurrentLocation}
                type="button"
              >
                <LocateFixed className="w-5 h-5 mr-1" />
                <span className="text-xs hidden sm:inline">Get Location</span>
              </button>
            </div>
          </LoadScriptNext>

          {/* Start Date Picker */}
          <div className="relative w-full">
            <div
              className={`rounded-lg p-1 py-2 flex items-center relative cursor-pointer text-sm border border-gray-500 w-full h-10
                ${
                  startDate
                    ? "bg-[#faffa4] text-black"
                    : "bg-transparent text-gray-400"
                }`}
              onClick={() => {
                setIsStartPickerOpen(true);
                setIsEndPickerOpen(false);
                handleRSBFunctionClicks("Start Date Selected");
              }}
            >
              <CalendarIcon className="w-6 h-4 absolute left-4" />
              <span className="pl-10 z-10">
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
                  if (endDate) calculateDuration(value, endDate);
                  setIsStartPickerOpen(false);
                }}
                onClose={() => setIsStartPickerOpen(false)}
                minDate={new Date()}
              />
            )}
          </div>

          {/* End Date Picker */}
          {}
          <div
            className={` ${
              activeTab == "subscribe" ? "hidden" : "relative w-full"
            }`}
          >
            <div
              className={`rounded-lg p-1 flex items-center relative cursor-pointer text-sm border border-gray-500 w-full h-10  
                ${
                  activeTab === "subscribe"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
                ${
                  endDate
                    ? "bg-[#faffa4] text-black"
                    : "bg-transparent text-gray-400"
                }`}
              onClick={() => {
                if (activeTab !== "subscribe") {
                  setIsEndPickerOpen(true);
                  setIsStartPickerOpen(false);
                  handleRSBFunctionClicks("End Date Selected");
                }
              }}
              disabled={activeTab === "subscribe"}
            >
              <CalendarIcon className="w-6 h-4 absolute left-4" />
              <span className="pl-10">
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
                  if (startDate) calculateDuration(startDate, value);
                  setIsEndPickerOpen(false);
                }}
                onClose={() => setIsEndPickerOpen(false)}
                minDate={startDate}
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
          {disableBtn ? (
            <button
              disabled
              onClick={handleSearch}
              className="w-full bg-[#faffa4] opacity-50 cursor-not-allowed
 text-black font-medium py-3 rounded-lg transition-colors"
            >
              Search
            </button>
          ) : (
            <button
              onClick={handleSearch}
              className="w-full bg-[#faffa4] hover:bg-[#faffa8] text-black font-medium py-3 rounded-lg transition-colors"
            >
              Search
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default NewRSB;
