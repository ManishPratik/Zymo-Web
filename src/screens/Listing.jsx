import {
  ArrowLeft,
  RotateCw,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Armchair,
  LocateFixed,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
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
  formatFare,
  getVendorDetails,
  retryFunction,
  toPascalCase,
} from "../utils/helperFunctions";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { appDB } from "../utils/firebase";
import useTrackEvent from "../hooks/useTrackEvent";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import fetchAllTestCollections from "../utils/testCarFetcher";

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
  const [carList, setCarList] = useState([]);
  const [clubbedCarList, setClubbedCarList] = useState([]);
  const [priceRange, setPriceRange] = useState("lowToHigh");
  const [seats, setSeats] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [filteredList, setFilteredList] = useState(clubbedCarList);
  const [carCount, setCarCount] = useState("");
  const [expandedStates, setExpandedStates] = useState({});
  const [vendersDetails, setVendersDetails] = useState({});

  const toggleDeals = (key) => {
    setExpandedStates((prev) => ({
      ...prev,
      [key]: !prev[key], // Toggle only the clicked car's state
    }));
  };

  //lowtoHigh filter sets as default

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

  // Errors
  const noCarsFound = () => {
    toast.error("No cars found for specified filter(s)", {
      position: "top-center",
      autoClose: 1000 * 2,
    });
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

  //It group the cars by name and brand and find the minimum fare for each group
  const clubCarsByName = (carsArray) => {
    console.log("Cars array received:", carsArray);
    if (!Array.isArray(carsArray) || carsArray.length === 0) {
      return [];
    }

    // Group cars by name
    const groupedCars = carsArray.reduce((acc, car) => {
      if (!car) {
        return acc;
      }

      // Make sure we have valid values for these fields
      const name = car.name || "Unknown";
      const brand = car.brand || "Partner";

      const fare = car.fare;

      if (typeof fare !== "string") {
        return acc;
      }

      const key = `${name}|${brand}`;

      if (!acc[key]) {
        acc[key] = {
          name: car.name,
          brand: car.brand,
          cars: [],
        };
      }
      acc[key].cars.push(car);
      return acc;
    }, {});

    // Transform groups and find the minimun fare
    return Object.values(groupedCars).map((group) => {
      const minFare = group.cars.reduce((min, car) => {
        const currentFare = parseInt(car.fare?.replace(/[^0-9]/g, ""));
        if (isNaN(currentFare)) return min;
        const minFareNum = parseInt(min.replace(/[^0-9]/g, ""));
        return currentFare < minFareNum ? car.fare : min;
      }, group.cars[0].fare);

      const minFareCar = group.cars.find((car) => car.fare === minFare);
      const seat = minFareCar.options.find((opt) => opt.includes("Seats"));

      return {
        brand: group.brand,
        name: group.name,
        fare: minFare,
        seat: seat,
        cars: group.cars,
      };
    });
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

    // if (sessionStorage.getItem("fromSearch") !== "true") {
    //   sessionStorage.setItem("fromSearch", false);
    //   const cachedCarList = localStorage.getItem("carList");
    //   if (cachedCarList) {
    //     setCarList(JSON.parse(cachedCarList));
    //     const groupedList = clubCarsByName(JSON.parse(cachedCarList));
    //     setClubbedCarList(groupedList);
    //     setCarCount(JSON.parse(cachedCarList).length);
    //     setLoading(false);
    //     return;
    //   }
    // }

    fetchVendorDetails();

    const search = async () => {
      setLoading(true);
      try {
        const url = import.meta.env.VITE_FUNCTIONS_API_URL;
        // const url = "http://127.0.0.1:5001/zymo-prod/us-central1/api";

        const fetchFirebaseCars = async () => {
          try {
            // Step 1: Get partners from partnerWebApp collection that serve the requested city
            const partnersSnapshot = await getDocs(collection(appDB, "partnerWebApp"));

            // Step 2: Filter partners by city and get their details
            const partnersInCity = partnersSnapshot.docs
              .filter((doc) => {
                const partner = doc.data();
                return (
                  partner.cities &&
                  Array.isArray(partner.cities) &&
                  partner.cities.some(
                    (c) => c && city && c.toLowerCase() === city.toLowerCase()
                  )
                );
              })
              .map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  accountType: data.accountType || "company",
                  bankAccount: data.bankAccount || "",
                  bankAccountName: data.bankAccountName || "",
                  brandName: data.brandName || "",
                  carsRange: data.carsRange || "",
                  cities: data.cities || [],
                  createdAt: data.createdAt,
                  email: data.email || "",
                  fullName: data.fullName || "Unknown",
                  gstNumber: data.gstNumber || "",
                  ifscCode: data.ifscCode || "",
                  isApproved: data.isApproved || false,
                  logo: data.logo || null,
                  phone: data.phone || "",
                  updatedAt: data.updatedAt,
                  upiId: data.upiId || null,
                  username: data.username || "",
                  // Fields used in UI
                  brandLogo: data.logo || null,
                  ...data
                };
              });

            // Step 3: Now fetch cars for each partner
            let allCars = [];

            for (const partner of partnersInCity) {
              try {
                // Get the uploadedCars subcollection for this partner
                const carsSnapshot = await getDocs(
                  collection(appDB, "partnerWebApp", partner.id, "uploadedCars")
                );

                if (!carsSnapshot.empty) {
                  const partnerCars = carsSnapshot.docs.map((doc) => {
                    const carData = doc.data();
                    return {
                      id: doc.id,
                      partnerId: partner.id,
                      partnerName: partner.fullName,
                      partnerBrandName: partner.brandName || "Zymo",
                      partnerLogo: partner.logo,
                      partnerPhone: partner.phone,
                      partnerEmail: partner.email,
                      carName: carData.carName || carData.name,
                      carType: carData.carType || carData.type,
                      carBrand: carData.carBrand || carData.brand,
                      transmissionType: carData.transmissionType,
                      fuelType: carData.fuelType,
                      noOfSeats: carData.noOfSeats || 5,
                      hourlyRental: carData.hourlyRental || {
                        limit: "Limited",
                        limited: {
                          packages: [{
                            hourlyRate: parseInt(carData.hourly_amount) || 0
                          }]
                        }
                      },
                      images: carData.images || ["/images/Cars/default-car.png"],
                      securityDeposit: carData.securityDeposit || 0,
                      deliveryCharges: carData.deliveryCharges || false,
                      source: "Zymo",
                      sourceImg: partner.logo || "/images/ServiceProvider/zymo.png",
                      location_est: city,
                      ...carData
                    };
                  });

                  console.log(
                    `Found ${partnerCars.length} cars for partner ${partner.fullName}`
                  );
                  // allCars = [...allCars, ...partnerCars];
                }
              } catch (err) {
                console.error(
                  `Error fetching cars for partner ${partner.id}:`,
                  err
                );
              }
            }

            // Step 4: Fetch cars from all test collections
            console.log(`Fetching test collection cars for ${city}...`);
            const testCollections = await fetchAllTestCollections(appDB , formatFare ,city, tripDurationHours);

            if (testCollections && testCollections.length > 0) {
              console.log(
                `Successfully fetched ${testCollections.length} test cars`
              );
              allCars = [...allCars, ...testCollections];
            } else {
              console.log(`No test collection cars found for ${city}`);
            }

            console.log(
              `Total cars found across all sources: ${allCars.length}`
            );

            const hourlyRate = (car) => {
              if (!car.hourlyRental) return 0;

              return car.hourlyRental.limit === "Limited" &&
                car.hourlyRental.limited?.packages?.[0]?.hourlyRate
                ? car.hourlyRental.limited.packages[0].hourlyRate
                : car.hourlyRental.unlimited?.fixedHourlyRate || 0;
            };

            // Step 5: Map car data to the expected format
            const filterdData = allCars
              .filter((car) => {
                // Skip cars with no data or undefined required fields
                if (!car || !car.id) {
                  console.log("Skipping invalid car:", car);
                  return false;
                }
                return true;
              })
              .map((car) => {
                // Calculate fare if not provided
                const calculatedHourlyRate = hourlyRate(car);
                const calculatedFare = calculatedHourlyRate ? formatFare(calculatedHourlyRate * tripDurationHours) : '₹0';
                console.log("car", car)
                return {
                  id: car.carId || car.id,
                  brand: car.partnerBrandName || "Zymo",
                  name: car.carName || car.name || car.model || car.type || "Car",
                  type: car.carType || car.type || "",
                  options: [
                    car.transmissionType || car.options?.[0] || "N/A",
                    car.fuelType || car.options?.[1] || "N/A",
                    car.noOfSeats ? `${car.noOfSeats} Seats` : car.options?.[2] || "5 Seats"
                  ],
                  address: car.pickupLocations?.[toPascalCase(city)] || car.address || "",
                  images: car.images || car.image_urls || ["/images/Cars/default-car.png"],
                  fare: car.fare || calculatedFare,
                  inflated_fare: car.inflated_fare || `₹${Math.round((parseInt(calculatedFare.replace(/[^0-9]/g, "")) || 0) * 1.2)}`,
                  hourly_amount: car.hourly_amount || calculatedHourlyRate || 0,
                  extrakm_charge: car.extrakm_charge || "0",
                  extrahour_charge: car.extrahour_charge || 0,
                  slabRates: car.slabRates || [],
                  securityDeposit: car.securityDeposit || 0,
                  deliveryCharges: car.deliveryCharges || false,
                  yearOfRegistration: car.yearOfRegistration || "N/A",
                  ratingData: car.ratingData || { text: "No ratings available", rating: 4.0 },
                  trips: car.trips || "N/A",
                  source: car.source || "Zymo",
                  sourceImg: car.sourceImg || car.partnerLogo || "/images/ServiceProvider/zymo.png",
                  location_est: car.location_est || city
                };
              });

            console.log("Firebase Filtered Data:", filterdData);
            return filterdData;
          } catch (error) {
            console.error("Error fetching Firebase cars:", error);
            return [];
          }
        };

        let allCarData = [];

        if (activeTab === "subscribe") {
          // Fetch only subscription cars if activeTab is "subscribe"
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
          // Fetch Zoomcar API
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

          const mychoizePromise =
            parseInt(tripDurationHours) < 24
              ? null
              : fetchMyChoizeCars(
                CityName,
                formattedPickDate,
                formattedDropDate,
                tripDurationHours
              );

          const firebasePromise = fetchFirebaseCars(); // Enable Firebase data fetch

          // Execute all API calls in parallel
          const [zoomData, mychoizeData, firebaseData] =
            await Promise.allSettled([
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
              sourceImg: "/images/ServiceProvider/zoomcarlogo.png",
              rateBasis: "DR",
            }));
            /*console.log("Zoomcar Data:", zoomCarData);*/
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
        /*console.log("All Cars:", allCarData);*/
        const groupCarList = clubCarsByName(allCarData);

        setCarList(allCarData);
        setClubbedCarList(groupCarList);
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
  }, [
    city,
    startDate,
    endDate,
    activeTab,
    lat,
    lng,
    tripDurationHours,
  ]);

  // // Filter functionality
  // useEffect(() => {
  //   setFilteredList(clubbedCarList);
  // }, [clubbedCarList]);

  // New Filter functionality
  useEffect(() => {
    applyFiltersToGroupedCars();
  }, [clubbedCarList, priceRange, seats, fuel, transmission]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  const resetFilters = () => {
    setTransmission("");
    setPriceRange("lowToHigh");
    setSeats("");
    setFuel("");
    setFilteredList(clubbedCarList);
    setCarCount(
      clubbedCarList.reduce((count, group) => count + group.cars.length, 0)
    );
  };

  const applyFiltersToGroupedCars = () => {
    if (!Array.isArray(clubbedCarList)) {
      noCarsFound();
      return [];
    }

    let filteredGroups = clubbedCarList
      .map((group) => {
        // Filter cars within the group
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

        // If no cars remain, return null to exclude the group
        if (filteredCars.length === 0) {
          return null;
        }

        // Recalculate minimum fare for the filtered cars
        const minFare = filteredCars.reduce((min, car) => {
          const currentFare = parseInt(car.fare.replace(/[^0-9]/g, ""));
          const minFareNum = parseInt(min.replace(/[^0-9]/g, ""));
          return currentFare < minFareNum ? car.fare : min;
        }, filteredCars[0].fare);

        const minFareCar = filteredCars.find((car) => car.fare === minFare);
        const seat =
          minFareCar.options.find((opt) => opt.includes("Seats")) || "Unknown";

        return {
          name: group.name,
          brand: group.brand,
          seat: seat,
          fare: minFare,
          cars: filteredCars,
        };
      })
      .filter((group) => group !== null);

    // Handle no results
    if (filteredGroups.length === 0) {
      noCarsFound();
      return;
    }

    // Sort groups by minimum fare if priceRange is specified
    if (priceRange) {
      filteredGroups = filteredGroups.sort((a, b) => {
        const priceA = parseInt(a.fare.replace(/[^0-9]/g, ""));
        const priceB = parseInt(b.fare.replace(/[^0-9]/g, ""));
        return priceRange === "lowToHigh" ? priceA - priceB : priceB - priceA;
      });
    }

    setFilteredList(filteredGroups);
    setCarCount(
      filteredGroups.reduce((count, group) => count + group.cars.length, 0)
    );
  };

  const handleSelectedCar = (label) => {
    trackEvent("Car List Section", "Rent Section Car", label);
  };

  const goToDetails = (car) => {
    handleSelectedCar(`${car.brand} ${car.name} - ${car.source}`);
    navigate(`/self-drive-car-rentals/${city}/cars/booking-details`, {
      state: {
        startDate,
        endDate,
        car,
        activeTab,
      },
    });
  };

  const goToPackages = (car) => {
    handleSelectedCar(`${car.brand} ${car.name}`);
    navigate(`/self-drive-car-rentals/${city}/cars/packages`, {
      state: {
        startDate,
        endDate,
        car,
      },
    });
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setPriceRange("lowToHigh"); // set Low-High
  //     applyFiltersToGroupedCars(); // apply filter after setting

  //     setFilteredList(clubbedCarList);

  //     console.log("Auto-applied Low-High after 2 seconds");
  //   }, 2000); // 2000ms = 2 seconds

  //   return () => clearTimeout(timer); // cleanup
  // }, []);


  return (
    <>
      {/* ✅ Dynamic SEO Tags */}
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
      <div className="h-100% min-w-screen bg-grey-900 text-white flex flex-col items-center px-4 py-6">
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
          <div className="location-container ">
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
        <div className="flex flex-wrap justify-start gap-2 w-full max-w-4xl mb-6 items-center ">
          <button
            onClick={resetFilters}
            className="bg-[#404040] h-10 text-white px-4 py-2 rounded-lg text-lg  w-full sm:w-auto  font-semibold"
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
                {/* <option value="" disabled hidden>Price Range</option> */}
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
                <option value="3 Seats">3 Seats</option>
                <option value="4 Seats">4 Seats</option>
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
              onClick={() => {
                // applyFilters();
                applyFiltersToGroupedCars();
              }}
              className="bg-[#faffa4] px-4 py-2 rounded-lg text-black text-lg lg:text-base font-semibold h-10 w-[calc(50%-0.25rem)] sm:w-[140px]"
            >
              Apply
            </button>
          </div>
        </div>

        {/* <div className="mb-6">
          <h1 className="text-[#eeff87] text-3xl font-bold">
            Choose from {carCount} cars
          </h1>
        </div> */}

        {/* Car Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-5 w-full max-w-6xl">
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full max-w-5xl items-start">
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
                        <h3 className="text-md font-semibold">
                          {car.brand} {car.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {car.cars[0].options[2]}
                        </p>
                        <div className="img-container">
                          <img
                            loading="lazy"
                            src={car.cars[0].sourceImg}
                            alt={car.cars[0].source}
                            className="h-6 rounded-sm mt-2 bg-white p-1 text-black"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Starts at</p>
                        <p className="text-sm text-gray-500 line-through decoration-2">
                          {car.cars[0].inflated_fare}
                        </p>
                        <p className="font-semibold text-md">{car.fare}</p>
                        <p className="text-[10px] text-gray-400">(GST incl)</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-sm text-[#faffa4]">
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
                            {car.brand} {car.name}
                          </h3>
                        </div>
                        <div>
                          <img
                            loading="lazy"
                            src={car.cars[0].sourceImg}
                            alt={car.cars[0].source}
                            className="h-5 rounded-sm bg-white p-1 text-black"
                          />
                          <p className="text-xs text-gray-400 ">
                            {car.cars[0].options[2]}
                          </p>
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
                          <p className="text-xs text-gray-400">Starts at</p>
                          <p className="text-md text-gray-400 line-through decoration-2">
                            {car.cars[0].inflated_fare}
                          </p>
                          <p className="text-xl font-semibold text-white">
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
                              {renderStarRating(individualCar?.ratingData?.rating)}
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
                              <p className="text-sm text-gray-400 line-through decoration-2">
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
