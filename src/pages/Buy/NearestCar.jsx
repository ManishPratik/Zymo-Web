import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Filter from "../../components/buycomponent/Filter";
import Cards from "../../components/buycomponent/Cards";
import SearchBar from "../../components/buycomponent/SearchBar";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { ArrowLeft } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { webDB } from "../../utils/firebase";
import { Helmet } from "react-helmet-async";
import LoadingCard from '../../components/buycomponent/LoadingCard'
import TestOwnership from "../../components/buycomponent/TestOwnership";
  
const NearestCar = ({ title }) => {
  const navigate = useNavigate();
  const [filteredCars, setFilteredCars] = useState("Electric");
  const [allCars, setAllCars] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    const fetchCarsData = async () => {
      try {
        setLoading(true);
        const carsCollectionRef = collection(webDB, "BuySectionCars");
        const querySnapshot = await getDocs(carsCollectionRef);

        const cars = querySnapshot.docs.map((doc) => doc.data());
        setAllCars(cars);
        setSearchResults(cars);
      } catch (err) {
        console.error("Error fetching cars data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarsData();
  }, []);

  // Update filtered cars and search results whenever the filter or search changes
  useEffect(() => {
    const filtered = allCars.filter((car) => car.type === filteredCars);
    setSearchResults(filtered);
  }, [filteredCars, allCars]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content="Find the best cars for sale near you with Zymo. Browse top deals and book your dream car today!"
        />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content="Browse Zymo's self-drive car options and choose the one that fits your needs."
        />
        <link rel="canonical" href="https://zymo.app/buy" />
      </Helmet>

      <NavBar />
      
      {/* <div className="head-container flex flex-col sm:flex-row justify-between items-center bg-darkGrey text-white p-4"> */}
        {/* <button
          onClick={() => navigate("/")}
          className="text-white m-5 cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button> */}
        
        {/* <h1 className="text-white text-3xl font-bold pl-8">EV Cars for sale</h1>

        <div className="mt-3 sm:mt-0 sm:ml-4 flex justify-end w-full sm:w-auto">
          <SearchBar setSearchResults={setSearchResults} />
        </div>
      </div> */}

      <div className="relative h-full sm:h-screen w-full bg-cover bg-center bg-no-repeat flex justify-center overflow-visible"
        // style={{ 
        //   backgroundImage: "url('/images/BuyCars/Electric_Hero_yellow.png')", 
        //   backgroundSize: "cover",
        // }}
      >
        {/* Dark overlay */}
        {/* <div className="absolute inset-0 bg-black/50"></div> */}
        
        {/* <img src="/images/BuyCars/Electric_Hero_yellow.png" alt="Yellow Hero" 
          className="absolute w-full sm:w-screen h-full object-cover z-0"
         /> */}
        {/* <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: "url('/images/BuyCars/Electric_Hero_yellow.png')",
            backgroundSize: 'fit',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        /> */}
        <TestOwnership />
      </div>

      {/* <Filter setFilterCar={setFilteredCars} /> */}
      {/* <BrandSelection setFilterCar={setFilteredCars} /> */}

      {/* <div className="mt-6 sm:mt-0 w-full">
        <SearchBar setSearchResults={setSearchResults} />
      </div> */}
      {loading ? (
        <div className="bg-darkGrey grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 py-6 my-3 rounded-lg mx-auto max-w-[1240px]">
          {Array(6)
            .fill()
            .map((_, index) => (
              <LoadingCard key={index} />
            ))}
        </div>
      ) : searchResults.length > 0 ? (
        <Cards cars={searchResults} />
      ) : (
        <div className="flex justify-center items-center h-[60vh] p-4 bg-darkGrey">
          <p className="text-white text-xl font-semibold">
            No cars at the moment. Please try another filter
          </p>
        </div>
      )}

      <Footer />
    </>
  );
};

export default NearestCar;
