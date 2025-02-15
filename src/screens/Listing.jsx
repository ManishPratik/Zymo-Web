import { ArrowLeft, RotateCw, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { FiMapPin } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { collectionGroup, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";

const Listing = () => {
    const location = useLocation();
    const { address, lat, lng, startDate, endDate, tripDuration } = location.state || {};
    const { city } = useParams();
    const [loading, setLoading] = useState(true);
    const [carList, setCarList] = useState([]);
    const [priceRange, setPriceRange] = useState("");
    const [seats, setSeats] = useState("");
    const [fuel, setFuel] = useState("");
    const [transmission, setTransmission] = useState("");
    const [filteredList, setFilteredList] = useState([]);
    const [carCount, setCarCount] = useState("");

    const fetchApiCars = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_FUNCTIONS_API_URL}/zoomcar/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: {
                        city,
                        lat,
                        lng,
                        fromDate: Date.parse(startDate),
                        toDate: Date.parse(endDate),
                    },
                }),
            });
    
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }
    
            const data = await response.json();
            console.log("API Response:", data); // Debugging log
    
            return (
                data.sections?.[data.sections.length - 1]?.cards?.map((car) => ({
                    id: car.car_data.car_id,
                    brand: car.car_data.brand,
                    name: car.car_data.name,
                    options: car.car_data.accessories,
                    address: car.car_data.location.address,
                    fare: `₹${car.car_data.pricing.revenue}`,
                    actual_fare: car.car_data.pricing.fare_breakup?.[0]?.fare_item?.[0]?.value || 0,
                    images: car.car_data.image_urls,
                    ratingData: car.car_data.rating_v3,
                    trips: car.car_data.trip_count,
                    type: "api",
                })) || []
            );
        } catch (error) {
            console.error("Error fetching API cars:", error);
            return [];
        }
    };
    

    const fetchFirebaseCars = async () => {
        try {
            const snapshot = await getDocs(collectionGroup(db, "uploadedCars"));
            console.log("Firebase Snapshot:", snapshot.docs.map(doc => doc.data()));
    
            return snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(car => car.cities?.some(c => c.toLowerCase() === city?.toLowerCase()))
                .map(car => ({
                    id: car.id,
                    brand: car.name.split(" ")[0],
                    name: car.name,
                    options: [car.fuelType, car.transmissionType, `${car.minBookingDuration} ${car.unit}`],
                    address: car.pickupLocation,
                    fare: `₹${car.kmRate}/km`,
                    actual_fare: car.kmRate,
                    images: car.images,
                    ratingData: { rating: 4.5 },
                    trips: Math.floor(Math.random() * 50),
                    type: "firebase",
                    location_est: "Local Owner",
                }));
        } catch (error) {
            console.error("Error fetching Firebase cars:", error);
            return [];
        }
    };
    
    useEffect(() => {
        const loadCars = async () => {
            try {
                const [apiCars, firebaseCars] = await Promise.all([
                    fetchApiCars(),
                    fetchFirebaseCars()
                ]);
                
                const combinedCars = [...apiCars, ...firebaseCars];
                setCarList(combinedCars);
                setFilteredList(combinedCars);
                setCarCount(combinedCars.length);
            } catch (error) {
                toast.error("Error loading cars", { position: "top-center" });
            } finally {
                setLoading(false);
            }
        };

        if (city && lat && lng && startDate && endDate) {
            loadCars();
        }
        console.log("City:", city, "Lat:", lat, "Lng:", lng, "StartDate:", startDate, "EndDate:", endDate);
        if (city && lat && lng && startDate && endDate) {
            loadCars();
        }
    }, [city, startDate, endDate]);

    const applyFilters = () => {
        let filtered = carList.filter(car => {
            const transmissionMatch = !transmission || car.options.includes(transmission);
            const seatsMatch = !seats || car.options.includes(seats);
            const fuelMatch = !fuel || car.options.includes(fuel);
            return transmissionMatch && seatsMatch && fuelMatch;
        });

        if (filtered.length === 0) {
            toast.error("No cars found for specified filters", { position: "top-center" });
            return;
        }

        if (priceRange) {
            filtered = filtered.sort((a, b) => 
                priceRange === "lowToHigh" ? a.actual_fare - b.actual_fare : b.actual_fare - a.actual_fare
            );
        }

        setFilteredList(filtered);
        setCarCount(filtered.length);
    };

    const resetFilters = () => {
        setTransmission("");
        setPriceRange("");
        setSeats("");
        setFuel("");
        setFilteredList(carList);
    };

    const navigate = useNavigate();
    const goToDetails = async (car) => {
        const encodedCarData = encodeURIComponent(JSON.stringify(car));
        const queryParams = new URLSearchParams({
            startDate,
            endDate,
            car: encodedCarData,
        }).toString();
        navigate(`/details/${city}?${queryParams}`);
    };

    return (
        <div className="h-100% min-w-screen bg-grey-900 text-white flex flex-col items-center px-4 py-6">
            <header className="w-full max-w-8xl flex flex-col md:flex-row justify-between items-center mb-4 text-center md:text-left">
                <div className="flex items-center gap-2 text-white text-lg">
                    <button
                        onClick={() => navigate(-1)}
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
                {new Date(startDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                })} - {new Date(endDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                })}
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
                            <option value="Hybrid">Hybrid</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>

                    <div className="relative w-[calc(50%-0.25rem)] sm:w-[140px]">
                        <select
                            className="bg-[#404040] text-white px-3 py-2 rounded-lg text-lg lg:text-base font-semibold w-full appearance-none cursor-pointer h-10"
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                        >
                            <option value="">Price Range</option>
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
                        onClick={applyFilters}
                        className="bg-[#faffa4] px-4 py-2 rounded-lg text-black text-lg lg:text-base font-semibold h-10 w-[calc(50%-0.25rem)] sm:w-[140px]"
                    >
                        Apply
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <h1 className="text-[#eeff87] text-3xl font-bold">
                    Choose from {carCount} cars
                </h1>
            </div>

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
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 w-full max-w-5xl">
                    {filteredList.map((car) => (
                        <div
                            key={car.id}
                            className="bg-[#404040] p-0 rounded-lg shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-[2%] mb-5 relative"
                        >
                            {/* Local Owner Badge */}
                            {car.type === "firebase" && (
                                <div className="absolute top-2 left-2 bg-lime text-black px-2 py-1 rounded-full text-xs z-10">
                                    Local Owner
                                </div>
                            )}

                            {/* Small Screens Layout */}
                            <div className="block md:hidden p-3">
                                <img
                                    src={car.images[0] || "/default-car.jpg"}
                                    alt={car.name}
                                    className="w-full h-40 object-cover bg-[#353535] rounded-lg p-1"
                                />
                                <div className="mt-3 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-md font-semibold">
                                            {car.brand?.split(" ")[0]} {car.name?.split(" ")[0]}
                                        </h3>
                                        <p className="text-md text-gray-400">
                                            {car.options[2]}
                                        </p>
                                        {car.type === "api" && (
                                            <div className="img-container">
                                                <img
                                                    src="/images/ServiceProvider/zoomcarlogo.png"
                                                    alt="Zoomcar"
                                                    className="h-5 rounded-sm mt-2 bg-white p-1"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-md text-gray-400">
                                            Starts at
                                        </p>
                                        <p className="font-semibold text-md">
                                            {car.fare}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            (GST incl)
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <p className="text-md text-[#faffa4]">
                                        {car.location_est}
                                    </p>
                                    <button
                                        style={{ backgroundColor: "#faffa4" }}
                                        className="rounded-full p-2"
                                        onClick={() => goToDetails(car)}
                                    >
                                        <ArrowLeft className="transform rotate-180 text-[#404040] w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Medium and Larger Screens Layout */}
                            <div className="hidden md:flex items-center px-4 rounded-xl shadow-xl w-full h-44">
                                <div className="flex items-stretch justify-between w-full">
                                    {/* Left Side Info */}
                                    <div className="flex flex-col text-white w-1/4 justify-between">
                                        <div className="self-auto">
                                            <h3 className="text-lg font-semibold mb-1">
                                                {car.brand} {car.name}
                                            </h3>
                                        </div>
                                        {car.type === "api" && (
                                            <div className="img-container">
                                                <img
                                                    src="/images/ServiceProvider/zoomcarlogo.png"
                                                    alt="Zoomcar"
                                                    className="h-5 rounded-sm bg-white p-1"
                                                />
                                            </div>
                                        )}
                                        <div className="self-auto ">
                                            <p className="text-left text-xs text-gray-400 mb-1">
                                                {car.options[2]}
                                            </p>
                                            <p className="text-xs text-[#faffa4]">
                                                {car.location_est} away
                                            </p>
                                        </div>
                                    </div>

                                    {/* Middle Car Image */}
                                    <div className="w-2/4 flex justify-center items-center ">
                                        <img
                                            src={car.images[0] || "/default-car.jpg"}
                                            alt={car.name}
                                            className="w-48 h-32 object-contain bg-[#353535] rounded-md p-1"
                                        />
                                    </div>

                                    {/* Right Side Info */}
                                    <div className="flex flex-col  justify-between text-right w-1/4  border-l border-gray-400">
                                        <div className="pr-2 ">
                                            <p className="text-xs text-gray-400">
                                                Starts at
                                            </p>
                                            <p className="text-lg font-semibold text-white">
                                                {car.fare}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                (GST incl)
                                            </p>
                                        </div>

                                        <button
                                            style={{
                                                backgroundColor: "#faffa4",
                                            }}
                                            className="rounded-md py-1  px-6 ml-auto"
                                            onClick={() => goToDetails(car)}
                                        >
                                            <ArrowLeft className="transform rotate-180 text-[#404040] w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Listing;