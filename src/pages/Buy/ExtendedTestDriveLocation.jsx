import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchSubscriptionCars,
  fetchMyChoizeCars,
  formatDateForMyChoize,
  calculateSelfDrivePrice,
  calculateDiscountPrice,
} from "../../utils/mychoize";
import { fetchFirebaseCars } from "../../utils/cars/firebasePartnerCarsFetcher";
import { getVendorDetails, retryFunction } from "../../utils/helperFunctions";
import { LoadScriptNext } from "@react-google-maps/api";
import { MapPinIcon, CalendarIcon, LocateFixed, Armchair } from "lucide-react";
import { BsFuelPump } from "react-icons/bs";
import { TbManualGearbox } from "react-icons/tb";  
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import DateTimeOverlay from "../../components/DateTimeOverlay";
import { getCurrentTime } from "../../utils/DateFunction";

const CarSpecBadges = ({ options }) => {
  const seatInfo = options.find((opt) => opt.includes("Seats")) || "N/A";
  const fuelInfo =
    options.find(
      (opt) =>
        opt.includes("Petrol") ||
        opt.includes("Diesel") ||
        opt.includes("Electric")
    ) || "N/A";
  // Extract transmission information (Manual, Automatic)
  const transmissionInfo =
    options.find(
      (opt) => opt.includes("Manual") || opt.includes("Automatic")
    ) || "N/A";

  return (
    <div className="flex flex-wrap gap-2 my-2">
      {/* Seats Badge */}
      <div className="flex items-center bg-gray-300 rounded-md px-3 py-1">
        <Armchair size={14} className="text-black" />
        <span className="text-black font-medium text-sm mr-1">
          {seatInfo.split(" ")[0]}
        </span>
      </div>

      {/* Fuel Type Badge */}
      <div className="flex items-center bg-gray-300 rounded-md px-3 py-1">
        <BsFuelPump size={14} className="text-black mr-1" />
        <span className="text-black font-medium text-sm">
          {fuelInfo.includes("Petrol")
            ? "Petrol"
            : fuelInfo.includes("Diesel")
            ? "Diesel"
            : fuelInfo.includes("Electric")
            ? "Electric"
            : "N/A"}
        </span>
      </div>

      {/* Transmission Badge */}
      <div className="flex items-center bg-gray-300 rounded-md px-3 py-1">
        <TbManualGearbox size={14} className="text-black mr-1" />
        <span className="text-black font-medium text-sm">
          {transmissionInfo.includes("Manual")
            ? "Manual"
            : transmissionInfo.includes("Automatic")
            ? "Automatic"
            : "N/A"}
        </span>
      </div>
    </div>
  );
};

// Helper function to filter cars matching the original car model with smart matching logic
const filterMatchingCars = (subscriptionCars, originalCar) => {
  // Safe comparison of car models with null checks
  console.log("Original Car:", originalCar);
  console.log("Subscription Cars:", subscriptionCars);

  if (!subscriptionCars || !originalCar || !originalCar.model) return [];

  // Check if originalCar is Electric type
  const isEV = originalCar.type === "Electric";
  const originalModelName = originalCar?.model.toLowerCase().trim();

  console.log("Filtering for:", {
    originalModelName,
    isEV,
    originalCarType: originalCar.type,
  });

  const matchingCars = subscriptionCars.filter((car) => {
    if (!car || !car.name) return false;

    const subscriptionModelName = car?.name.toLowerCase().trim();

    // Check model name matching (both ways)
    const isModelMatch =
      subscriptionModelName.includes(originalModelName) ||
      originalModelName.includes(subscriptionModelName);

    // Check Electric vehicle matching if original car is EV
    const isElectricMatch = isEV ? car?.options?.[1] === "Electric" : true;

    console.log(`Checking car: ${car.name}`, {
      subscriptionModelName,
      isModelMatch,
      isElectricMatch,
      carOptions: car.options,
      electricOption: car?.options?.[1],
    });

    return isModelMatch && isElectricMatch;
  });

  console.log("Matching Cars:", matchingCars);
  return matchingCars;
};

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
  const [endDate, setEndDate] = useState(
    new Date(getCurrentTime() + 30 * 24 * 60 * 60 * 1000)
  );
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableCars, setAvailableCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [filteredCars, setFilteredCars] = useState([]);

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
  // Function to fetch cars from all vendors (MyChoize, Zoomcar, Firebase partners)
  const fetchAvailableCars = useCallback(async () => {
    if (!city || !startDate || !endDate) return [];

    setLoadingCars(true);
    try {
      const url = import.meta.env.VITE_FUNCTIONS_API_URL;
      let allCarData = [];

      // Use the date objects directly
      const startDateTime = startDate;
      const endDateTime = endDate;

      // Check if dates are valid
      if (!startDateTime || !endDateTime) {
        console.error("Invalid date/time combination");
        setAvailableCars([]);
        setLoadingCars(false);
        return [];
      }

      const formattedPickDate = formatDateForMyChoize(
        startDateTime.toISOString()
      );
      const formattedDropDate = formatDateForMyChoize(
        endDateTime.toISOString()
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

      // Calculate trip duration in hours (needed for some APIs)
      const tripDurationHours = Math.ceil(
        (endDateTime - startDateTime) / (1000 * 60 * 60)
      );

      // Convert dates to epoch for Zoomcar API
      const startDateEpoc = Math.floor(startDateTime.getTime() / 1000);
      const endDateEpoc = Math.floor(endDateTime.getTime() / 1000);

      // Fetch from Zoomcar
      const fetchZoomcarData = async () => {
        const response = await fetch(`${url}/zoomcar/search`, {
          method: "POST",
          body: JSON.stringify({
            data: {
              city: formattedCity,
              lat: 0, // We don't have lat/lng in test drive context
              lng: 0,
              fromDate: startDateEpoc,
              toDate: endDateEpoc,
            },
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Zoomcar API Error");
        }

        return response.json();
      };

      // Fetch from MyChoize (both subscription and self-drive)
      const subscriptionPromise = fetchSubscriptionCars(
        formattedCity,
        formattedPickDate,
        formattedDropDate
      );

      const mychoizePromise = fetchMyChoizeCars(
        formattedCity,
        formattedPickDate,
        formattedDropDate,
        tripDurationHours
      );

      // Fetch from Firebase partners
      const firebasePromise = fetchFirebaseCars(
        formattedCity,
        tripDurationHours
      );

      // Fetch from Zoomcar with retry logic
      const zoomPromise = retryFunction(fetchZoomcarData);

      // Execute all API calls in parallel
      const [subscriptionData, mychoizeData, firebaseData, zoomData] =
        await Promise.allSettled([
          subscriptionPromise,
          mychoizePromise,
          firebasePromise,
          zoomPromise ? zoomPromise : Promise.resolve(null),
        ]);

      // Process MyChoize subscription cars
      if (subscriptionData.status === "fulfilled" && subscriptionData.value) {
        allCarData = [...allCarData, ...subscriptionData.value];
        console.log("MyChoize subscription cars:", subscriptionData.value);
      } else {
        console.error(
          "MyChoize subscription API failed:",
          subscriptionData.reason
        );
      }

      // Process MyChoize self-drive cars
      if (mychoizeData.status === "fulfilled" && mychoizeData.value) {
        allCarData = [...allCarData, ...mychoizeData.value];
        console.log("MyChoize self-drive cars:", mychoizeData.value);
      } else {
        console.error("MyChoize self-drive API failed:", mychoizeData.reason);
      }

      // Process Firebase partner cars
      if (firebaseData.status === "fulfilled" && firebaseData.value) {
        allCarData = [...allCarData, ...firebaseData.value];
        console.log("Firebase partner cars:", firebaseData.value);
      } else {
        console.error("Firebase API failed:", firebaseData.reason);
      }

      // Process Zoomcar data
      if (
        zoomData.status === "fulfilled" &&
        zoomData.value &&
        Array.isArray(zoomData.value.sections) &&
        zoomData.value.sections.length > 0
      ) {
        const vendorData = await getVendorDetails("zoomcar");

        const zoomCarData = zoomData.value.sections[
          zoomData.value.sections.length - 1
        ].cards.map((car) => ({
          id: car.car_data.car_id,
          cargroup_id: car.car_data.cargroup_id,
          brand: car.car_data.brand,
          name: car.car_data.name,
          options: car.car_data.accessories,
          address: car.car_data.location.address || "",
          location_id: car.car_data.location.location_id,
          location_est: car.car_data.location.text,
          lat: car.car_data.location.lat,
          lng: car.car_data.location.lng,
          fare: `₹${calculateSelfDrivePrice(
            car.car_data.pricing.revenue,
            vendorData,
            false
          )}`,
          inflated_fare: `₹${calculateDiscountPrice(
            car.car_data.pricing.revenue,
            vendorData,
            false
          )}`,
          actualPrice: car.car_data.pricing.revenue,
          pricing_id: car.car_data.pricing.id,
          hourly_amount: car.car_data.pricing.payable_amount,
          images: car.car_data.image_urls,
          ratingData: car.car_data.rating_v3,
          trips: car.car_data.trip_count,
          source: "zoomcar",
          sourceImg: "/images/ServiceProvider/zoomcar-logo-new.png",
          rateBasis: "DR",
        }));

        allCarData = [...allCarData, ...zoomCarData];
        console.log("Zoomcar cars:", zoomCarData);
      } else {
        console.error("Zoomcar API failed:", zoomData.reason);
      }
      console.log("All fetched cars:", allCarData);
      console.log("Selected address:", address); // Use address variable
      setAvailableCars(allCarData || []); // Filter cars that match the original car model using smart matching logic
      const matchingCars = filterMatchingCars(allCarData || [], originalCar);

      setFilteredCars(matchingCars);
      return allCarData || [];
    } catch (error) {
      console.error("Error fetching cars:", error);
      setAvailableCars([]);
      setFilteredCars([]);
      return [];
    } finally {
      setLoadingCars(false);
    }
  }, [city, startDate, endDate, originalCar, address]);

  const handleDateSelection = (value) => {
    setStartDate(value);
    setIsStartPickerOpen(false);
  };

  const handleEndDateSelection = (value) => {
    setEndDate(value);
    setIsEndPickerOpen(false);
  };
  const handleContinue = async () => {
    if (!place || !startDate || !endDate) {
      toast.error("Please select location, start date/time and end date/time");
      return;
    }

    if (!city) {
      toast.error("Could not determine the city from your selection");
      return;
    } // Validate that end date/time is after start date/time
    if (
      !startDate ||
      !endDate ||
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime())
    ) {
      toast.error("Invalid date/time combination");
      return;
    }

    if (endDate <= startDate) {
      toast.error("End date/time must be after start date/time");
      return;
    } // Check minimum duration (e.g., at least 1 hour)
    const durationHours =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    if (durationHours < 1) {
      toast.error("Test drive duration must be at least 1 hour");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch available cars first
      const fetchedCars = await fetchAvailableCars();
      console.log("Fetched Cars:", fetchedCars);
      // Check if we have available cars from mychoize
      if (!fetchedCars || fetchedCars.length === 0) {
        toast.error("No cars available for the selected dates and location");
        setLoading(false);
        return;
      }

      // Navigation will be handled by car card clicks, not here
      setLoading(false);
    } catch (error) {
      console.error("Error processing selection:", error);
      setError("Failed to process your selection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCarSelect = (car) => {
    navigate("/buy-car/extended-test-drive/summary", {
      state: {
        originalCar,
        selectedCar: car,
        location: {
          city,
          address: place?.formattedAddress || placeInput,
          lat: place?.location?.lat(),
          lng: place?.location?.lng(),
        },
        dates: {
          startDate,
          endDate,
        },
      },
    });
  };

  // Debug effect to log available cars
  useEffect(() => {
    console.log("Available cars updated:", availableCars.length);
  }, [availableCars]);

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
              Select Location & Date/Time for Extended Test Drive
            </h1>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Search Form Section - Moved to Top */}
            <div className="bg-[#3a3a3a] rounded-lg p-6 space-y-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  Search Details
                </h3>
              </div>
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

                {/* Date and Time Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date and Time */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-300">
                        Start Date & Time
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
                          {startDate && !isNaN(startDate.getTime())
                            ? new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }).format(startDate)
                            : "Select Start Date & Time"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* End Date and Time */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-300">
                        End Date & Time
                      </label>
                      <div
                        onClick={() => setIsEndPickerOpen(true)}
                        className={`rounded-lg py-3 px-4 flex items-center cursor-pointer text-sm border 
                          ${
                            endDate
                              ? "bg-[#faffa4] text-black border-transparent"
                              : "bg-[#2d2d2d] text-white border-gray-600"
                          }`}
                      >
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        <span>
                          {endDate && !isNaN(endDate.getTime())
                            ? new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }).format(endDate)
                            : "Select End Date & Time"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Duration Display */}
                {startDate && endDate && (
                  <div className="bg-[#2d2d2d] rounded-lg p-4 border border-gray-600">
                    <div className="text-center">
                      <span className="text-gray-300 text-sm">
                        Test Drive Duration
                      </span>
                      <div className="text-[#faffa4] font-medium text-lg">
                        {(() => {
                          try {
                            // Check if dates are valid
                            if (
                              !startDate ||
                              !endDate ||
                              isNaN(startDate.getTime()) ||
                              isNaN(endDate.getTime())
                            ) {
                              return "Invalid dates";
                            }

                            const diffMs =
                              endDate.getTime() - startDate.getTime();

                            if (diffMs <= 0) {
                              return "Invalid duration";
                            }

                            const diffDays = Math.floor(
                              diffMs / (1000 * 60 * 60 * 24)
                            );
                            const diffHours = Math.floor(
                              (diffMs % (1000 * 60 * 60 * 24)) /
                                (1000 * 60 * 60)
                            );

                            if (diffDays > 0) {
                              return diffHours > 0
                                ? `${diffDays} days, ${diffHours} hours`
                                : `${diffDays} days`;
                            } else {
                              return `${diffHours} hours`;
                            }
                          } catch (error) {
                            console.error("Duration calculation error:", error);
                            return "Duration calculation error";
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !place ||
                    !startDate ||
                    !endDate ||
                    filteredCars.length > 0
                  }
                  className="w-full bg-[#faffa4] hover:bg-[#faffa8] disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium py-3 rounded-lg transition-colors"
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
                  ) : filteredCars.length > 0 ? (
                    "Select a car below to continue"
                  ) : (
                    "Search Available Cars"
                  )}
                </button>
              </form>
            </div>

            {/* Car Availability Status */}
            {city && (
              <div className="mb-6">
                {loadingCars ? (
                  <div className="bg-blue-900/20 border border-blue-500/50 text-blue-400 p-4 rounded-lg">
                    <div className="flex items-center">
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
                      Searching for available cars in {city}...
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Car Cards Display */}
            {filteredCars.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium text-white">
                    Available {originalCar.name} {originalCar.model} Models
                  </h2>
                  <span className="text-sm text-[#faffa4] bg-[#3a3a3a] px-3 py-1 rounded-full">
                    {filteredCars.length} car
                    {filteredCars.length > 1 ? "s" : ""} found
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Click on any car below to proceed to booking summary, or
                  modify your search criteria below.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {filteredCars.map((car, index) => (
                    <div
                      key={`${car.id || index}`}
                      className="bg-[#404040] p-4 rounded-lg shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-[2%] hover:shadow-xl border-2 border-transparent hover:border-[#faffa4]"
                      onClick={() => handleCarSelect(car)}
                    >
                      <div className="flex items-center justify-between">
                        {/* Left Side - Car Info */}
                        <div className="flex flex-col flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {car.name}
                          </h3>
                          <CarSpecBadges options={car.options || []} />
                          {car.location_est && (
                            <p className="text-xs text-[#faffa4] mt-2">
                              📍 {car.location_est}
                            </p>
                          )}
                          {car.sourceImg && (
                            <div className="mt-2">
                              <img
                                loading="lazy"
                                src={car.sourceImg}
                                alt={car.source}
                                className="h-6 rounded-sm bg-white p-1"
                              />
                            </div>
                          )}
                        </div>

                        {/* Center - Car Image */}
                        <div className="flex-1 flex justify-center items-center mx-4">
                          {car.images && car.images[0] && (
                            <img
                              loading="lazy"
                              src={car.images[0]}
                              alt={car.name}
                              className="w-40 h-24 object-contain bg-[#353535] rounded-md p-1"
                            />
                          )}
                        </div>

                        {/* Right Side - Price & Action */}
                        <div className="flex flex-col items-end text-right">
                          {car.inflated_fare && (
                            <p className="text-sm text-gray-400 line-through">
                              {car.inflated_fare}
                            </p>
                          )}
                          <p className="text-xl font-semibold text-white mb-2">
                            {car.fare || "Contact for Price"}
                          </p>
                          <p className="text-xs text-gray-400 mb-3">
                            (GST incl)
                          </p>{" "}
                          <button
                            className="bg-[#faffa4] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#e8e84d] transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCarSelect(car);
                            }}
                          >
                            Book This Car
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Date Picker Overlays */}
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

          {isEndPickerOpen && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <DateTimeOverlay
                selectedDate={endDate}
                setSelectedDate={setEndDate}
                onSave={handleEndDateSelection}
                onClose={() => setIsEndPickerOpen(false)}
                minDate={startDate || new Date()}
              />
            </div>
          )}
        </div>
      </LoadScriptNext>
    </>
  );
};

export default ExtendedTestDriveLocation;
