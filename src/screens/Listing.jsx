import {
  ArrowLeft,
  RotateCw,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Armchair,
  LocateFixed,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { FiMapPin } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchMyChoizeCars,
  formatDateForMyChoize,
  fetchSubscriptionCars,
  calculateSelfDrivePrice,
  calculateDiscountPrice,
} from "../utils/mychoize";
import {
  formatDate,
  getVendorDetails,
  retryFunction,
} from "../utils/helperFunctions";
import { collection, getDocs } from "firebase/firestore";
import { appDB } from "../utils/firebase";
import useTrackEvent from "../hooks/useTrackEvent";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { fetchFirebaseCars } from "../utils/cars/firebasePartnerCarsFetcher";
import { getCarKeywords } from "../utils/carClubbing";
import Marquee from "react-fast-marquee";
import { BsFuelPump } from "react-icons/bs";
import { TbManualGearbox } from "react-icons/tb";

// Helper function to get normalized car name
const getNormalizedCarName = (originalName, keywords) => {
  if (!originalName) return "UNKNOWN";
  let nameToProcess = String(originalName).toLowerCase();
  let normalizedNameResult = String(originalName); // Default to original name if no keyword matches

  if (Array.isArray(keywords)) {
    for (const keyword of keywords) {
      if (keyword && nameToProcess.includes(String(keyword).toLowerCase())) {
        normalizedNameResult = String(keyword); // Use the keyword itself as the normalized name
        break; // Found a keyword, no need to check further
      }
    }
  }
  return normalizedNameResult.toUpperCase(); // Return the keyword or original name, uppercased
};

const Listing = ({ title }) => {
  const location = useLocation();
  const {
    address,
    lat,
    lng,
    startDate,
    endDate,
    tripDuration,
    tripDurationHours,
    activeTab,
  } = location.state || {};
  const { city } = useParams();

  const trackEvent = useTrackEvent();
  const navigate = useNavigate();

  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(endDate);

  const hasRun = useRef(false);

  const [loading, setLoading] = useState(true);
  const [, setCarList] = useState([]);
  const [clubbedCarList, setClubbedCarList] = useState([]);
  const [priceRange, setPriceRange] = useState("lowToHigh");
  const [seats, setSeats] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [, setCarCount] = useState("");
  const [expandedStates, setExpandedStates] = useState({});
  const [, setVendersDetails] = useState({});

  const brands = [
    { name: "WheelUp", logo: "/images/ServiceProvider/wheelup.png" },
    { name: "Avis", logo: "/images/ServiceProvider/avis.png" },
    { name: "Zoomcars", logo: "/images/ServiceProvider/Zoomcar_Logo.jpg" },
    { name: "MyChoize", logo: "/images/ServiceProvider/mychoize.png" },
    { name: "Carronrent", logo: "/images/ServiceProvider/carronrent.png" },
    { name: "Doorcars", logo: "/images/ServiceProvider/doorcars1.png" },
    { name: "Renx", logo: "/images/ServiceProvider/renx.jpeg" }
  ];

  const toggleDeals = (key) => {
    setExpandedStates((prev) => ({
      ...prev,
      [key]: !prev[key], // Toggle only the clicked car's state
    }));
  };

  const renderStarRating = (rating) => {
    const maxStars = 5;
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const decimal = numericRating % 1;
    const emptyStars = maxStars - fullStars - (decimal > 0 ? 1 : 0);

    return (
      <span className="flex items-center gap-1">
        {Array(fullStars)
          .fill()
          .map((_, i) => (
            <span key={`full-${i}`} className="text-[#eeff87]">
              ★
            </span>
          ))}
        {decimal > 0 && (
          <span className="relative inline-block text-[#eeff87]">
            <span
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${decimal * 100}%` }}
            >
              ⯪
            </span>
            <span className="text-gray-400">☆</span>
          </span>
        )}
        {Array(emptyStars)
          .fill()
          .map((_, i) => (
            <span key={`empty-${i}`} className="text-gray-400">
              ☆
            </span>
          ))}
      </span>
    );
  };

  // fetch vendor discount, tax, and current rate of vehicle for that respective venders
  const fetchVendorDetails = async () => {
    const vendorsSnapshot = await getDocs(collection(appDB, "carvendors"));
    const vendorData = vendorsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setVendersDetails(vendorData);
  };

  // It groups the cars by name and brand and finds the minimum fare for each group
  const clubCarsByName = async (carsArray) => {
    console.log("Cars Array:", carsArray); // For debugging
    const clubbingCarNames = (await getCarKeywords()) || [];
    // console.log("Car Grouping Keywords:", clubbingCarNames); // For debugging

    if (!Array.isArray(carsArray) || carsArray.length === 0) {
      return [];
    }

    // Step 1: Group cars by normalized name
    const carsGroupedByNormalizedName = carsArray.reduce((acc, car) => {
      if (car.brand === "Karyana") console.log(car);
      if (!car || !car.name || typeof car.fare !== 'string') {
        console.log("Invalid car data:", car); // For debugging
        return acc;
      }

      const normalizedNameKey = getNormalizedCarName(car.name, clubbingCarNames);

      if (!acc[normalizedNameKey]) {
        console.log("New group created:", normalizedNameKey); // For debugging
        acc[normalizedNameKey] = [];
      }
      // console.log("Adding car to group:", normalizedNameKey, car); // For debugging
      acc[normalizedNameKey].push(car);
      return acc;
    }, {});

    // Step 2: Transform groups into the desired output structure
    return Object.entries(carsGroupedByNormalizedName).map(([normalizedGroupName, carsInGroup]) => {
      if (!carsInGroup || carsInGroup.length === 0) {
        return null;
      }

      // Sort cars within the group by price (ascending)
      const sortedCarsInGroup = [...carsInGroup].sort((a, b) => {
        const fareA = parseInt(a.fare?.replace(/[^0-9]/g, "") || "0");
        const fareB = parseInt(b.fare?.replace(/[^0-9]/g, "") || "0");
        return fareA - fareB;
      });

      const minFareCar = sortedCarsInGroup[0];
      if (!minFareCar) {
        return null;
      }

      const minFare = minFareCar.fare;
      const seat = minFareCar.options?.find((opt) => typeof opt === 'string' && opt.includes("Seats")) || "N/A";
      const brand = minFareCar.brand; // Brand of the car with the minimum fare

      return {
        brand: brand,
        name: normalizedGroupName, // The normalized group name (e.g., "SWIFT")
        fare: minFare,
        seat: seat,
        cars: sortedCarsInGroup, // All cars in this normalized group, sorted by price
      };
    }).filter(group => group !== null); // Remove any null groups
  };

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const startDateEpoc = Date.parse(startDate);
    const endDateEpoc = Date.parse(endDate);
    if (!city || !lat || !lng || !startDateEpoc || !endDateEpoc) {
      return;
    }

    const CityName = city;
    const formattedPickDate = formatDateForMyChoize(startDate);
    const formattedDropDate = formatDateForMyChoize(endDate);

    if (!formattedPickDate || !formattedDropDate) {
      toast.error("Invalid date format!", { position: "top-center" });
      return;
    }

    fetchVendorDetails();

    const search = async () => {
      setLoading(true);
      try {
        const url = import.meta.env.VITE_FUNCTIONS_API_URL;
        let allCarData = [];

        if (activeTab === "subscribe") {
          const subscriptionData = await fetchSubscriptionCars(
            CityName,
            formattedPickDate,
            formattedDropDate
          );
          if (subscriptionData) {
            allCarData = [...subscriptionData];
          } else {
            console.error("Subscription API failed or returned empty data.");
          }
        } else {
          const fetchZoomcarData = async () => {
            const response = await fetch(`${url}/zoomcar/search`, {
              method: "POST",
              body: JSON.stringify({
                data: {
                  city,
                  lat,
                  lng,
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

          const zoomPromise = retryFunction(fetchZoomcarData);
          const mychoizePromise = fetchMyChoizeCars(
            CityName,
            formattedPickDate,
            formattedDropDate,
            tripDurationHours
          );
          const firebasePromise = fetchFirebaseCars(city, tripDurationHours);

          const [zoomData, mychoizeData, firebaseData] = await Promise.allSettled([
            zoomPromise ? zoomPromise : Promise.resolve(null),
            mychoizePromise ? mychoizePromise : Promise.resolve(null),
            firebasePromise,
          ]);

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
          } else {
            console.error("Zoomcar API failed:", zoomData.reason);
          }

          if (mychoizeData.status === "fulfilled" && mychoizeData.value) {
            allCarData = [...allCarData, ...mychoizeData.value];
          }

          if (firebaseData.status === "fulfilled" && firebaseData.value) {
            allCarData = [...allCarData, ...firebaseData.value];
          } else {
            console.error("Firebase API failed:", firebaseData.reason);
          }
        }

        if (allCarData.length === 0) {
          toast.error("No cars found, Please try modifying input...", {
            position: "top-center",
            autoClose: 5000,
          });
        }
        const groupCarList = await clubCarsByName(allCarData);

        setCarList(allCarData);
        setClubbedCarList(groupCarList);
        setFilteredList(groupCarList); // Set initial filtered list to full list
        setFiltersApplied(false); // No filters applied initially
        setCarCount(
          groupCarList.reduce((count, group) => count + group.cars.length, 0)
        );
        setLoading(false);

        localStorage.setItem("carList", JSON.stringify(allCarData));
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    search();
  }, [city, startDate, endDate, activeTab, lat, lng, tripDurationHours]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  // Apply filters dynamically when filter states change
  useEffect(() => {
    applyFilters();
  }, [transmission, priceRange, seats, fuel, clubbedCarList]);

  const applyFilters = () => {
    if (!Array.isArray(clubbedCarList)) {
      setFilteredList([]);
      setFiltersApplied(true);
      return;
    }

    let filteredGroups = clubbedCarList
      .map((group) => {
        const filteredCars = group.cars.filter((car) => {
          const transmissionFilter =
            !transmission ||
            car.options.some((opt) => opt.includes(transmission));
          const seatsFilter =
            !seats || car.options.some((opt) => opt.includes(seats));
          const fuelFilter =
            !fuel || car.options.some((opt) => opt.includes(fuel));
          return transmissionFilter && seatsFilter && fuelFilter;
        });

        if (filteredCars.length === 0) {
          return null;
        }

        const sortedFilteredCars = [...filteredCars].sort((a, b) => {
          const fareA = parseInt(a.fare.replace(/[^0-9]/g, ""));
          const fareB = parseInt(b.fare.replace(/[^0-9]/g, ""));
          return fareA - fareB;
        });

        const minFareCar = sortedFilteredCars[0];
        const minFare = minFareCar.fare;
        const seat =
          minFareCar.options.find((opt) => opt.includes("Seats")) || "Unknown";

        return {
          name: group.name,
          brand: group.brand,
          seat: seat,
          fare: minFare,
          cars: sortedFilteredCars,
        };
      })
      .filter((group) => group !== null);

    if (priceRange) {
      filteredGroups = filteredGroups.sort((a, b) => {
        const priceA = parseInt(a.fare.replace(/[^0-9]/g, ""));
        const priceB = parseInt(b.fare.replace(/[^0-9]/g, ""));
        return priceRange === "lowToHigh" ? priceA - priceB : priceB - priceA;
      });
    }

    setFilteredList(filteredGroups);
    setFiltersApplied(true);
    const totalCars = filteredGroups.reduce(
      (count, group) => count + group.cars.length,
      0
    );
    setCarCount(totalCars);
  };

  const resetFilters = () => {
    setTransmission("");
    setPriceRange("lowToHigh");
    setSeats("");
    setFuel("");
    setFilteredList(clubbedCarList);
    setFiltersApplied(false);
    setCarCount(
      clubbedCarList.reduce((count, group) => count + group.cars.length, 0)
    );
  };

  const handleSelectedCar = (label) => {
    trackEvent("Car List Section", "Rent Section Car", label);
  };

  const goToDetails = (car) => {
    handleSelectedCar(`${car.brand} ${car.name} - ${car.source}`);

    if (car.source && car.source.toLowerCase() === "karyana") {
      const carWithDefaults = {
        ...car,
        rateBasis: car.rateBasis || (tripDurationHours >= 24 ? "MP" : "hourly"),
        total_km:
          car.total_km || (tripDurationHours >= 24 ? { MP: 300 } : undefined),
      };

      navigate(`/self-drive-car-rentals/${city}/cars/booking-details`, {
        state: {
          startDate,
          endDate,
          car: carWithDefaults,
          activeTab,
          tripDuration,
        },
      });
    } else {
      navigate(`/self-drive-car-rentals/${city}/cars/booking-details`, {
        state: {
          startDate,
          endDate,
          car,
          activeTab,
          tripDuration,
        },
      });
    }
  };

  const goToPackages = (car) => {
    handleSelectedCar(`${car.brand} ${car.name}`);

    navigate(`/self-drive-car-rentals/${city}/cars/packages`, {
      state: {
        startDate,
        endDate,
        car,
        tripDuration,
      },
    });
  };

  const CarSpecBadges = ({ options }) => {
    // Extract seat information from options
    const seatInfo = options.find(opt => opt.includes("Seats")) || "N/A";
    // Extract fuel type information (Petrol, Diesel, Electric)
    const fuelInfo = options.find(opt =>
      opt.includes("Petrol") || opt.includes("Diesel") || opt.includes("Electric")
    ) || "N/A";
    // Extract transmission information (Manual, Automatic)
    const transmissionInfo = options.find(opt =>
      opt.includes("Manual") || opt.includes("Automatic")
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
            {fuelInfo.includes("Petrol") ? "Petrol" :
              fuelInfo.includes("Diesel") ? "Diesel" :
                fuelInfo.includes("Electric") ? "Electric" : "N/A"}
          </span>
        </div>

        {/* Transmission Badge */}
        <div className="flex items-center bg-gray-300 rounded-md px-3 py-1">
          <TbManualGearbox size={14} className="text-black mr-1" />
          <span className="text-black font-medium text-sm">
            {transmissionInfo.includes("Manual") ? "Manual" :
              transmissionInfo.includes("Automatic") ? "Automatic" : "N/A"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Dynamic SEO Tags */}
      <Helmet>
        <title>Available Cars in {city} | Zymo</title>
        <meta
          name="description"
          content={`Find self-drive car rentals in ${city}. Browse available cars and book now!`}
        />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content="Discover a variety of cars for your self-drive rental needs."
        />
        <link
          rel="canonical"
          href={`https://zymo.app/self-drive-car-rentals/${city}/cars`}
        />
      </Helmet>
      <div className="h-100% min-w-screen bg-grey-900 text-white flex flex-col items-center px-8 py-10">
        <header className="w-full max-w-8xl flex flex-col md:flex-row justify-between items-center mb-4 text-center md:text-left">
          <div className="flex items-center gap-2 text-white text-lg">
            <button
              onClick={() => navigate("/")}
              className="border-none bg-none cursor-pointer"
            >
              <ArrowLeft size={25} />
            </button>
            <span>{tripDuration}</span>
          </div>
          <div className="location-container">
            <span className="text-[#faffa4] text-lg flex items-center gap-1 mt-2 md:mt-0">
              <FiMapPin className="text-[#faffa4] w-5 h-5" />
              {address}
            </span>
          </div>
        </header>

        <div className="bg-[#404040] text-white px-4 py-2 rounded-lg text-md w-full max-w-md text-center mb-4">
          {startDateFormatted} - {endDateFormatted}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-start gap-2 w-full max-w-4xl mb-6 items-center">
          <button
            onClick={resetFilters}
            className="bg-[#404040] h-10 text-white px-4 py-2 rounded-lg text-lg w-full sm:w-auto font-semibold"
          >
            All
          </button>

          <div className="flex w-full sm:w-auto gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative w-[calc(50%-0.25rem)] sm:w-[140px]">
              <select
                className="bg-[#404040] text-white px-3 py-2 rounded-lg text-lg lg:text-base font-semibold w-full appearance-none cursor-pointer h-10"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              >
                <option value="">Transmission</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="relative w-[calc(50%-0.25rem)] sm:w-[140px]">
              <select
                className="bg-[#404040] text-white px-3 py-2 rounded-lg text-lg lg:text-base font-semibold w-full appearance-none cursor-pointer h-10"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="lowToHigh">Low - High</option>
                <option value="highToLow">High - Low</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="flex w-full sm:w-auto gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative w-[calc(50%-0.25rem)] sm:w-[140px]">
              <select
                className="bg-[#404040] text-white px-3 py-2 rounded-lg text-lg lg:text-base font-semibold w-full appearance-none cursor-pointer h-10"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
              >
                <option value="">Seats</option>
                <option value="5 Seats">5 Seats</option>
                <option value="6 Seats">6 Seats</option>
                <option value="7 Seats">7 Seats</option>
                <option value="8 Seats">8 Seats</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="relative w-[calc(50%-0.25rem)] sm:w-[140px]">
              <select
                className="bg-[#404040] text-white px-3 py-2 rounded-lg text-lg lg:text-base font-semibold w-full appearance-none cursor-pointer h-10"
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
              >
                <option value="">Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className="flex w-full sm:w-auto gap-2 justify-center">
            <button
              className="bg-[#404040] p-2 rounded-lg h-10 flex items-center justify-center w-[calc(50%-0.25rem)] sm:w-[70px]"
              onClick={resetFilters}
            >
              <RotateCw className="text-[#faffa4] w-5 h-5" />
            </button>

            <button
              onClick={applyFilters}
              className="bg-[#faffa4] px-4 py-2 rounded-lg text-black text-lg lg:text-base font-semibold h-10 w-[calc(50%-0.25rem)] sm:w-[140px]"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Car Grid */}
        {loading ? (
          <>
            <h3 className="text-[#faffa4] text-lg text-center">We compare multiple sites to get you the best deal</h3>

            <div
              className="sm:max-w-[40rem] max-w-80"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
              }}
            >
              <Marquee autoFill>
                <div className="flex space-x-10 md:space-x-10 my-5 mr-10 md:mr-10">
                  {brands.map((brand, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center rounded-full bg-white w-16 h-16"
                    >
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-12 h-8"
                      />
                    </div>
                  ))}
                </div>
              </Marquee>
            </div>

            <div className="grid grid-cols-1 lg:w-[56%] items-start gap-5">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-[#404040] p-4 rounded-lg shadow-lg animate-pulse"
                >
                  <div className="w-full h-40 bg-gray-700 rounded-lg"></div>
                  <div className="mt-3 h-5 bg-gray-600 w-3/4 rounded"></div>
                  <div className="mt-2 h-4 bg-gray-500 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          </>
        ) : filteredList.length === 0 ? (
          <div className="text-center text-white mt-10">
            {filtersApplied ? (
              <p className="text-lg">No cars available for the specified filters. Try searching other filters or press the refresh button 🔄.</p>
            ) : (
              <p className="text-lg">Please apply filters or check availability later.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:w-[56%] items-start gap-5">
            {filteredList.map((car) => {
              const uniqueKey = `${car.name}-${car.brand}`;
              return (
                <div
                  key={uniqueKey}
                  className="bg-[#404040] p-0 rounded-lg shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-[2%] mb-5"
                >
                  {/* Small Screens Layout */}
                  <div className="block md:hidden p-3">
                    <img
                      loading="lazy"
                      src={car.cars[0].images[0]}
                      alt={car.name}
                      className="w-full h-45 object-cover bg-[#353535] rounded-lg p-1"
                    />
                    <div className="mt-3 flex justify-between items-start">
                      <div>
                        <h3 className="text-md font-semibold">{car.name}</h3>
                        <CarSpecBadges options={car.cars[0].options} />
                         <p className="text-xs text-[#faffa4]">Available from</p>
                        <div className="img-container">
                          <div className="flex gap-1">
                            {[...new Map(car.cars.map(car => [car.sourceImg, car])).values()].map((uniqueCar) => (
                              <img
                                key={uniqueCar.sourceImg} // Add a unique key for React rendering
                                loading="lazy"
                                src={uniqueCar.sourceImg}
                                alt={uniqueCar.source}
                                className="h-6 rounded-sm mt-2 bg-white p-1 text-black"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#faffa4]">
                          {car.cars.length} deal{car.cars.length > 1 ? "s" : ""} available
                        </p>
                        <p className="text-sm text-gray-400">Starts at</p>
                        <p className="text-sm text-gray-500 !line-through !decoration-2">
                          {car.cars[0].inflated_fare}
                        </p>
                        <p className="font-semibold text-lg">{car.fare}</p>
                        <p className="text-[10px] text-gray-400">(GST incl)</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-sm text-[#f  text-[#faffa4]">
                        {car.cars[0].location_est}
                      </p>
                      <button
                        style={{
                          backgroundColor: "#faffa4",
                          padding: "3px 5px",
                        }}
                        onClick={() => toggleDeals(uniqueKey)}
                        className="bg-[#faffa4] flex items-center rounded-lg text-black text-xs font-semibold h-8 w-[30%] sm:w-[120px]"
                      >
                        {expandedStates[uniqueKey] ? (
                          <>
                            <span>Hide</span>
                            <ChevronUp className="text-black w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>View Deals</span>
                            <ChevronDown className="text-black w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Medium and Larger Screens Layout */}
                  <div className="hidden md:flex items-center px-4 py-2 rounded-xl shadow-xl w-full h-52">
                    <div className="flex items-stretch justify-between w-full">
                      {/* Left Side Info */}
                      <div className="flex flex-col text-white w-1/4 justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">
                            {car.name}
                          </h3>
                          <CarSpecBadges options={car.cars[0].options} />
                        </div>
                        <div>
                          <p className="text-xs text-[#faffa4]">Available from</p>
                          <div className="flex gap-1">
                            {[...new Map(car.cars.map(car => [car.sourceImg, car])).values()].map((uniqueCar) => (
                              <img
                                key={uniqueCar.sourceImg} // Add a unique key for React rendering
                                loading="lazy"
                                src={uniqueCar.sourceImg}
                                alt={uniqueCar.source}
                                className="h-6 rounded-sm my-1 bg-white p-1 text-black"
                              />
                            ))}
                          </div>

                          <p className="text-xs text-[#faffa4]">
                            {car.cars[0].location_est}
                          </p>
                        </div>
                      </div>

                      {/* Middle Car Image */}
                      <div className="w-2/4 flex justify-center items-center">
                        <img
                          loading="lazy"
                          src={car.cars[0].images[0]}
                          alt={car.cars[0].name}
                          className="w-full max-w-60 h-36 object-contain bg-[#353535] rounded-md p-1"
                        />
                      </div>

                      {/* Right Side Info */}
                      <div className="flex flex-col justify-between text-right w-1/4 border-l border-gray-400 pl-4">
                        <div>
                          <p className="text-sm text-[#faffa4]">
                            {car.cars.length} deal{car.cars.length > 1 ? "s" : ""} available
                          </p>
                          <p className="text-xs text-gray-400">Starts at</p>
                          <p className="text-md text-gray-400 !line-through !decoration-[2px]">
                            {car.cars[0].inflated_fare}
                          </p>
                          <p className="text-2xl font-semibold text-white">
                            {car.fare}
                          </p>
                          <p className="text-xs text-gray-400">(GST incl)</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <button
                            style={{ backgroundColor: "#faffa4" }}
                            className="bg-[#faffa4] flex items-center justify-center rounded-lg text-black text-xs font-semibold h-8 w-[90px] mt-4"
                            onClick={() => toggleDeals(uniqueKey)}
                          >
                            {expandedStates[uniqueKey] ? (
                              <>
                                <span>Hide</span>
                                <ChevronUp className="text-black w-4 h-4" />
                              </>
                            ) : (
                              <>
                                <span>View Deals</span>
                                <ChevronDown className="text-black w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deals Card */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: expandedStates[uniqueKey] ? "auto" : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-[#353535] rounded-b-lg shadow-md overflow-hidden"
                  >
                    <div className="p-4">
                      {car.cars.map((individualCar) => (
                        <div
                          key={individualCar.id}
                          className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0"
                        >
                          <div className="text-left">
                            <div className="img-container">
                              <img
                                loading="lazy"
                                src={individualCar.sourceImg}
                                alt={individualCar.source}
                                className="h-6 rounded-sm mt-2 bg-white p-1 text-black"
                              />
                            </div>
                            <p className="text-xs text-[#eeff87] flex items-center gap-1">
                              Rating:{" "}
                              {renderStarRating(
                                individualCar?.ratingData?.rating
                              )}
                            </p>
                            <p className="text-xs text-[#eeff87] flex items-center gap-1">
                              <Armchair className="w-3 h-3" />
                              {individualCar?.options?.find((opt) =>
                                opt.includes("Seats")
                              ) || "N/A"}
                            </p>
                            <p className="text-xs text-[#eeff87] flex items-center gap-1">
                              {individualCar?.location_est ? (
                                <>
                                  <LocateFixed className="w-3 h-3" />
                                  {individualCar.location_est}
                                </>
                              ) : (
                                ""
                              )}
                            </p>
                          </div>
                          <div className="text-center flex flex-col items-center gap-3">
                            <div>
                              <p className="text-sm text-gray-400 !line-through !decoration-[2px]">
                                {individualCar.inflated_fare}
                              </p>
                              <p className="text-xl sm:text-md font-semibold">
                                {individualCar.fare}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <button
                                style={{ backgroundColor: "#faffa4" }}
                                className="bg-[#faffa4] flex items-center px-4 py-1 rounded-lg text-black text-xs font-semibold h-8 w-[calc(95%-0.25rem)] sm:w-[calc(90%-0.25rem)] ml-2"
                                onClick={() => {
                                  if (individualCar.source === "zoomcar") {
                                    goToDetails(individualCar);
                                  } else if (activeTab === "subscribe") {
                                    goToDetails(individualCar);
                                  } else if (individualCar.source === "Karyana" || individualCar.source === "ZT") {
                                    console.log("Karyana car selected:", individualCar);
                                    goToPackages(car); // Show packages for Karyana cars with multiple packages
                                  } else {
                                    goToPackages(individualCar);
                                  }
                                }}
                              >
                                Select{" "}
                                <ArrowRight className="w-4 h-4 text-black" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Listing;