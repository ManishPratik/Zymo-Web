import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchSubscriptionCars,
  formatDateForMyChoize,
} from "../../utils/mychoize";
import { LoadScriptNext } from "@react-google-maps/api";
import { MapPinIcon, CalendarIcon, LocateFixed } from "lucide-react";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import DateTimeOverlay from "../../components/DateTimeOverlay";
import { getCurrentTime } from "../../utils/DateFunction";

const ExtendedTestDriveLocation = ({ title }) => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { car: originalCar } = routerLocation.state || {};

  // Location states
  const [placeInput, setPlaceInput] = useState("");
  const [place, setPlace] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  // Date states
  const [startDate, setStartDate] = useState(new Date(getCurrentTime()));
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isManuallySelected = useRef(false);
  const placesAPIKey = import.meta.env.VITE_PLACES_API_KEY;
  const placesAPILibraries = useMemo(() => ["places"], []);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (!originalCar) {
      navigate("/buy-car", { replace: true });
    }
  }, [originalCar, navigate]);

  // Google Places Autocomplete
  useEffect(() => {
    if (isManuallySelected.current) {
      isManuallySelected.current = false;
      return;
    }

    if (!placeInput) {
      setSuggestions([]);
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
                includedRegionCodes: ["IN"],
                language: "en",
                sessionToken: sessionToken,
              }
            );

          const formatted =
            response?.suggestions?.map((item) => {
              const prediction = item?.placePrediction;
              const placeId = prediction?.placeId || "";
              const fullText = prediction?.text?.text || "";
              const mainText = prediction?.mainText?.text || "";
              const secondaryText = prediction?.secondaryText?.text || "";

              return {
                placeId,
                fullAddress: fullText,
                displayName: `${mainText}${
                  secondaryText ? ", " + secondaryText : ""
                }`,
                city: secondaryText,
              };
            }) || [];

          setSuggestions(formatted);
        }
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
        setError("Failed to fetch location suggestions. Please try again.");
      }
    };

    const debounce = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(debounce);
  }, [placeInput]);

  // Get details of a place by placeId
  const getPlaceDetails = async (placeId) => {
    try {
      const { Place } = await window.google.maps.importLibrary("places");
      const place = new Place({
        id: placeId,
        requestedLanguage: "en",
      });

      await place.fetchFields({
        fields: [
          "addressComponents",
          "displayName",
          "formattedAddress",
          "location",
        ],
      });

      return place;
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  };

  // Extract city name from place details
  const extractCityFromDetails = (place) => {
    if (!place?.addressComponents) {
      console.warn("No address components found");
      return "";
    }

    const components = Array.isArray(place.addressComponents)
      ? place.addressComponents
      : [];

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
        // Handle the structure where types is an array
        const types = Array.isArray(component.types) ? component.types : [];
        return types.includes(type);
      });

      if (match) {
        // Use longText for the new structure
        const name = match.longText || match.shortText || "";
        console.log(`Found city: ${name} (type: ${type})`);

        if (name) {
          return name;
        }
      }
    }

    // Fallback: use first component if it exists
    if (components.length > 0 && components[0].longText) {
      const name = components[0].longText;
      console.log(`Using first component as city: ${name}`);
      return name;
    }

    console.warn("No suitable city component found");
    return "";
  };

  const handleSuggestionClick = async (sugg) => {
    isManuallySelected.current = true;
    setPlaceInput(sugg.fullAddress);
    setSuggestions([]);

    const placeDetails = await getPlaceDetails(sugg.placeId);
    if (placeDetails) {
      const cityName = extractCityFromDetails(placeDetails);
      // Get just the first part of the city name (e.g., "Mumbai" from "Mumbai, Maharashtra")
      const simpleCityName = cityName.split(",")[0].trim();
      setCity(simpleCityName);

      const location = placeDetails.Eg?.location || {};
      const lat = location.lat ?? "";
      const lng = location.lng ?? "";

      setPlace({
        name: placeDetails.displayName || sugg.fullAddress,
        lat,
        lng,
        addressComponents: placeDetails.addressComponents || [],
      });

      setAddress(placeDetails.formattedAddress || sugg.fullAddress);
    } else {
      // Fallback if place details fails
      setCity(sugg.city?.split(",")[0].trim() || "");
      setPlace(sugg);
      setAddress(sugg.fullAddress);
    }
  };

  const extractCityFromGeocodingResult = (result) => {
    const components = result.address_components || [];
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
        return match.long_name.split(",")[0].trim() || "";
      }
    }

    return "";
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const geocoder = new window.google.maps.Geocoder();
          const response = await geocoder.geocode({
            location: { lat: latitude, lng: longitude },
          });

          if (response.results[0]) {
            const result = response.results[0];
            const cityName = extractCityFromGeocodingResult(result);
            const fullAddress = result.formatted_address;

            setPlaceInput(fullAddress);
            setPlace({
              placeId: result.place_id,
              fullAddress,
              displayName: fullAddress,
              lat: latitude,
              lng: longitude,
              addressComponents: result.address_components,
            });

            setCity(cityName);
            setAddress(fullAddress);
          } else {
            toast.error("Could not find address for this location");
          }
        } catch (error) {
          console.error("Error getting current location:", error);
          toast.error("Failed to get your current location");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Failed to access your location");
      }
    );
  };

  const handleDateSelection = (value) => {
    setStartDate(value);
    setIsStartPickerOpen(false);
  };

  const handleContinue = async () => {
    if (!place || !startDate) {
      toast.error("Please select both location and date");
      return;
    }

    if (!city) {
      toast.error("Could not determine the city from your selection");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pickupDate = formatDateForMyChoize(startDate);
      const dropoffDate = formatDateForMyChoize(
        new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
      );

      // Get just the city name and handle special cases
      let formattedCity;
      if (city === "Bengaluru") {
        formattedCity = "bangalore";
      } else if (["New Delhi", "Delhi Division", "Delhi"].includes(city)) {
        formattedCity = "delhi";
      } else if (
        city.toLowerCase().includes("mumbai") ||
        city.toLowerCase().includes("maharashtra")
      ) {
        formattedCity = "mumbai";
      } else {
        formattedCity = city.toLowerCase().split(",")[0].trim();
      }

      console.log(`Requesting cars for city: ${formattedCity}`);

      // Call with all required parameters: city, pickup date, dropoff date
      const subscriptionCars = await fetchSubscriptionCars(
        formattedCity,
        pickupDate,
        dropoffDate
      );

      // Add null checks and validate car data
      if (!Array.isArray(subscriptionCars) || subscriptionCars.length === 0) {
        setError(`No cars available for extended test drive in ${city}`);
        setLoading(false);
        return;
      }

      // Safe comparison of car models with null checks
      console.log(originalCar);
      console.log(subscriptionCars);
      const selectedCar = subscriptionCars.find((car) => {
        if (!car || !originalCar || !originalCar.model) return false;
        // see originalCar contains the ev or not
        const isEV = originalCar.type === "Electric";
        const originalModelName = originalCar?.model.toLowerCase().trim();
        const subscriptionModelName = car?.name.toLowerCase().trim();

        return (
          (subscriptionModelName.includes(originalModelName) ||
            originalModelName.includes(subscriptionModelName)) &&
          (isEV ? car?.options[1] === "Electric" : true)
        );
      });

      if (!selectedCar) {
        setError(
          `This car is not available for extended test drive in ${city}`
        );
        setLoading(false);
        return;
      }

      navigate("/buy-car/extended-test-drive/summary", {
        state: { car: selectedCar, originalCar },
      });
    } catch (error) {
      console.error("Error fetching car data:", error);
      setError("Failed to fetch car availability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!originalCar) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>
          {title || "Select Location for Extended Test Drive - ZymoAuto"}
        </title>
      </Helmet>

      <LoadScriptNext
        googleMapsApiKey={placesAPIKey}
        libraries={placesAPILibraries}
        version="beta"
      >
        <div className="min-h-screen bg-[#252525] text-white p-4">
          <div className="max-w-2xl mx-auto pt-8">
            <h1 className="text-2xl font-medium mb-8 text-white">
              Select Location & Date for Extended Test Drive
            </h1>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="bg-[#3a3a3a] rounded-lg p-6 space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleContinue();
                }}
                className="space-y-6"
              >
                {/* Location Input */}
                <div className="space-y-2">
                  <label className="block text-sm text-gray-300">
                    Select Location
                  </label>
                  <div className="relative">
                    <div
                      className={`flex items-center border rounded-lg px-4 py-3 ${
                        placeInput
                          ? "bg-[#faffa4] text-black border-transparent"
                          : "bg-[#2d2d2d] text-white border-gray-600"
                      }`}
                    >
                      <MapPinIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                      <input
                        type="text"
                        value={placeInput}
                        onChange={(e) => setPlaceInput(e.target.value)}
                        placeholder="Enter your location"
                        className={`outline-none w-full ${
                          placeInput
                            ? "bg-[#faffa4] text-black placeholder-gray-700"
                            : "bg-[#2d2d2d] text-white placeholder-gray-400"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className={`flex items-center ml-2 flex-shrink-0 ${
                          placeInput
                            ? "text-black"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <LocateFixed className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Location Suggestions */}
                    {suggestions.length > 0 && (
                      <ul className="absolute left-0 top-full mt-1 z-50 bg-[#2d2d2d] text-white rounded-lg shadow-lg max-h-60 overflow-y-auto w-full">
                        {suggestions.map((sugg) => (
                          <li
                            key={sugg.placeId}
                            onClick={() => handleSuggestionClick(sugg)}
                            className="flex items-center px-4 py-3 hover:bg-[#faffa4] hover:text-black cursor-pointer text-sm border-b border-gray-700 last:border-0"
                          >
                            <MapPinIcon className="w-5 h-5 mr-2 shrink-0 text-red-400" />
                            {sugg.displayName}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Date Input */}
                <div className="space-y-2">
                  <label className="block text-sm text-gray-300">
                    Start Date
                  </label>
                  <div
                    onClick={() => setIsStartPickerOpen(true)}
                    className={`rounded-lg py-3 px-4 flex items-center cursor-pointer text-sm border 
                      ${
                        startDate
                          ? "bg-[#faffa4] text-black border-transparent"
                          : "bg-[#2d2d2d] text-white border-gray-600"
                      }`}
                  >
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    <span>
                      {startDate
                        ? new Intl.DateTimeFormat("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          }).format(startDate)
                        : "Select Date"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !place || !startDate}
                  className="w-full bg-[#faffa4] hover:bg-[#faffa8] disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium py-3 rounded-lg transition-colors mt-6"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Continue to Summary"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Date Picker Overlay */}
          {isStartPickerOpen && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <DateTimeOverlay
                selectedDate={startDate}
                setSelectedDate={setStartDate}
                onSave={handleDateSelection}
                onClose={() => setIsStartPickerOpen(false)}
                minDate={new Date()}
              />
            </div>
          )}
        </div>
      </LoadScriptNext>
    </>
  );
};

export default ExtendedTestDriveLocation;
