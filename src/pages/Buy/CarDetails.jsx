import  { useState,useEffect } from 'react';
import { useParams , Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExtendedTestDriveBenefits from '../../components/buycomponent/ExtendedTestDriveBenefits';
import { Helmet } from 'react-helmet-async';
import useTrackEvent from '../../hooks/useTrackEvent';


const CarDetails = ({ title }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const trackEvent = useTrackEvent();
  const location = useLocation();
  const [isTestDrivePopupOpen, setIsTestDrivePopupOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [carDetail, setCarDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const { car } = location.state || {};
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        // const carsCollectionRef = collection(webDB, 'BuySectionCars');
        // const q = query(carsCollectionRef, where('carId', '==', parseInt(id)));

        // const querySnapshot = await getDocs(q);
        
        // if (!querySnapshot.empty) {
        //   querySnapshot.forEach(doc => {
        //     // console.log('Fetched document:', doc.data());
        //     setCarDetail(doc.data());
        //   });
        // } else {
        //   setError('No car found');
        // }
        setCarDetail(car)
        console.log(car)
      } catch (err) {
        console.error('Error fetching car details:', err); 
        setError('Error fetching car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [id]); 

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!carDetail) {
    return <div>No car found</div>;
  }
  const handleClicks=(carDetail,label)=>{
    trackEvent("Test & Extended Test Drive Section", "Buy Section Button Clicked", label);
    trackEvent("Buy Section Car",`Buy Section Car`,`${carDetail.name} ${carDetail.model}- ${carDetail.vendor}-${label}`)
  }

  return (
    <>
     <Helmet>
                <title>{title}</title>
                <meta name="description" content={`Discover detailed specifications and features of your selected car. Book a test drive now!`} />
                <meta property="og:title" content={title} />
        <meta property="og:description" content="Check out in-depth details about the car you're interested in before making a decision." />
                <link rel="canonical" href={`https://zymo.app/buy/car-details/${id}`} />
            </Helmet>
      <div className="min-h-screen flex items-center justify-center p-3 bg-darkGrey text-white">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-1 md:left-5 top-8 p-2 text-white/80 hover:text-white hover:bg-[#2A2A2A] bg-transparent transition-all z-10"
        >
          <ArrowLeft size={28} />
        </button>

        {/* Main Content */}
        <div className="max-w-6xl w-full bg-darkGrey rounded-lg shadow-lg overflow-hidden">
          {/* Desktop Layout */}
          <div className="hidden md:flex">
            {/* Image Section */}
            <div className=" fixed w-1/2 top-6 left-3 h-screen flex justify-center items-center  p-2">
              <img
                src={carDetail.image}   //add newtnexcar.png image here
                alt={`${carDetail.name} ${carDetail.model}`}
                className="rounded-lg shadow-md p-2bg-transparent"
              />
            </div>
            {/* Details Section */}
            <div className="w-1/2 absolute right-0 top-4 p-4">
              <h1 className="text-3xl font-bold mb-2">{`${carDetail.name} ${carDetail.model}`}</h1>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-[#e8ff81] text-xl">&#9733; {carDetail.rating}</span>
              </div>

              {/* Key Features Section */}
              <div className="p-3">
                <h2 className="text-xl font-semibold text-gray-300 mb-4">Key Features</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#2d2d2d] border border-white/10 p-3 rounded-lg">
                    <div className="box flex items-center gap-5">
                      <i className="fa-solid fa-car text-xl text-gray-300 pl-2"></i>
                      <div>
                        <p className="font-semibold text-gray-300">Range</p>
                        <p className="text-lg">{carDetail.range} Km</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#2d2d2d] border border-white/10 p-3 rounded-lg">
                    <div className="box flex items-center gap-5">
                      <i className="fa-solid fa-battery-full text-xl text-gray-300 pl-2"></i>
                      <div>
                        <p className="font-semibold text-gray-300">Battery</p>
                        <p className="text-lg">{carDetail.battery} kWh</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#2d2d2d] border border-white/10 p-3 rounded-lg">
                    <div className="box flex items-center gap-5">
                      <i className="fa-solid fa-plug text-xl text-gray-300 pl-2"></i>
                      <div>
                        <p className="font-semibold text-gray-300">Power</p>
                        <p className="text-lg">{carDetail.power} bhp</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#2d2d2d] border border-white/10 p-3 rounded-lg">
                    <div className="box flex items-center gap-5">
                      <i className="fa-solid fa-stopwatch text-xl text-gray-300 pl-2"></i>
                      <div>
                        <p className="font-semibold text-gray-300">Charging</p>
                        <p className="text-lg">{`${carDetail.charging.min_time}-${carDetail.charging.max_time}`} hrs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications Section */}
              <h2 className="text-xl font-semibold text-white mb-4 p-3">Specifications</h2>
              <ul className="space-y-2 mb-4 px-3">
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-300">Body Style :</span>
                  <span>{carDetail.bodyStyle}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-300">Warranty :</span>
                  <span>{`${carDetail.warranty_years} yrs / ${carDetail.warranty_km.toLocaleString()} Km`}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-300">Length :</span>
                  <span>{carDetail.length.toLocaleString()} mm</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-300">Width :</span>
                  <span>{carDetail.width.toLocaleString()} mm</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-300">Height :</span>
                  <span>{`${carDetail.height.max_height.toLocaleString()}-${carDetail.height.min_height.toLocaleString()}`} mm</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-300">Cargo Volume :</span>
                  <span>{carDetail.cargoVolume} L</span>
                </li>
              </ul>

              {/* About Section */}
              <div className="about border border-[#e8ff81] p-3 rounded-lg my-4">
                <h2 className="text-xl font-semibold text-gray-300 mb-4">About {carDetail.model}</h2>
                <p className="text-gray-400 mb-4">{carDetail.about}</p>
              </div>

              {/* Price and Test Drive Button */}
              {/* <p className="text-2xl font-bold text-gray-300 m-4">Starts at &#8377;{price}*</p> */}
              <div className=''>
                <p className="text-3xl font-semibold mx-2">₹{`${carDetail.price.min_price} - ${carDetail.price.max_price}`} Lakh </p>
              </div>

              <p className="text-sm text-gray- m-2 mb-4">Avg. Ex-Showroom price</p>

              <div className='flex'>
                <div className='flex flex-col'>
                  <Link to={"/buy-car/test-drive-inputform"}
                  state={{ car: carDetail }} >
                    <button
                      className="bg-[#e8ff81] text-darkGrey px-6 py-3 rounded-lg font-semibold hover:bg-[#e8ff88] mx-1"
                    onClick={() => handleClicks(carDetail,"Test Drive")}
                    >
                      Test Drive
                    </button>
                  </Link>

                </div>

                <div className='flex flex-col'>
                <Link
                  to={`/buy-car/summary/${id}`}
                  state={{ car: carDetail }} 
                  className="block">
                    <div className="relative inline-block">
                      {/* Show Popup on Hover */}
                      {showPopup && (
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-[300px] sm:w-[400px] lg:w-[500px]">
                          <ExtendedTestDriveBenefits />
                        </div>
                      )}

                      {/* Button to hover */}
                      <button
                        className="bg-[#e8ff81] text-darkGrey px-6 py-3 rounded-lg font-semibold hover:bg-[#e8ff88] mx-1"
                        onMouseEnter={() => setShowPopup(true)}
                        onMouseLeave={() => setShowPopup(false)}
                        onClick={() => handleClicks(carDetail,"Extended Test Drive")}

                      >
                        Extended Test Drive
                      </button>
                    </div>
                  </Link>
                  <p className='text-xs mx-2 my-1 overflow-y-auto'>( Try Before You Buy -</p>
                  <p className='text-xs mx-2 my-1 overflow-y-auto'>Book Your Extended Test Drive Now! )</p>

                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Image and Title Section */}
            <div className="bg-darkGrey flex flex-col items-center p-3">
              <img
                src={carDetail.image}
                alt={`${carDetail.name} ${carDetail.model}`}
                className="w-3/4 rounded-lg shadow-md"
              />
              <div className="name-rating flex justify-between items-center px-3 mt-4">
                <h1 className="text-3xl font-bold">{`${carDetail.name} ${carDetail.model}`}</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-[#e8ff81] text-sm  px-1 rounded-lg">&#9733; {carDetail.rating}</span>
                </div>
              </div>
            </div>

            {/* Key Features Section */}
            <div className="p-3">
              <h2 className="text-xl font-semibold text-gray-300 mb-4">Key Features</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#2d2d2d] border border-white/10 p-3 rounded-lg">
                  <div className="box flex items-center gap-3">
                    <i className="fa-solid fa-car"></i>
                    <div>
                      <p className="font-semibold text-gray-300">Range</p>
                      <p className="text-lg">{carDetail.range} Km</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#2d2d2d] border border-white/10 p-3 rounded-lg">
                  <div className="box flex items-center gap-3">
                    <i className="fa-solid fa-battery-full"></i>
                    <div>
                      <p className="font-semibold text-gray-300">Battery</p>
                      <p className="text-lg">{carDetail.battery} kWh</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#2d2d2d] border border-white/10 p-3 rounded-lg">
                  <div className="box flex items-center gap-3">
                    <i className="fa-solid fa-plug"></i>
                    <div>
                      <p className="font-semibold text-gray-300">Power</p>
                      <p className="text-lg">{carDetail.power} bhp</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#2d2d2d] border border-white/10 p-3 rounded-lg">
                  <div className="box flex items-center gap-3">
                    <i className="fa-solid fa-stopwatch"></i>
                    <div>
                      <p className="font-semibold text-gray-300">Charging</p>
                      <p className="text-lg">{`${carDetail.charging.min_time}-${carDetail.charging.max_time}`} hrs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="p-3 bg-darkGrey">
              <h2 className="text-xl font-semibold text-white mb-4">Specifications</h2>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-300">Body Style :</span>
                  <span>{carDetail.bodyStyle}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-300">Warranty :</span>
                  <span>{`${carDetail.warranty_years} yrs / ${carDetail.warranty_km.toLocaleString()} Km`}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-300">Length :</span>
                  <span>{carDetail.length.toLocaleString()} mm</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-300">Width :</span>
                  <span>{carDetail.width.toLocaleString()} mm</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-300">Height :</span>
                  <span>{`${carDetail.height.max_height.toLocaleString()}-${carDetail.height.min_height.toLocaleString()}`} mm</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold text-gray-300">Cargo Volume :</span>
                  <span>{carDetail.cargoVolume} L</span>
                </li>
              </ul>
            </div>

            {/* About Section */}
            <div className="p-3 bg-[#2d2d2d] border border-[#e8ff81] rounded-lg mt-4">
              <h2 className="text-xl font-semibold text-gray-300 mb-4">About {carDetail.model}</h2>
              <p className="text-gray-300">{carDetail.about}</p>
            </div>

            {/* Price and Test Drive Button */}
            <div className="p-3 bg-darkGrey flex flex-col items-center">
              <p className="text-2xl font-bold mb-4">₹{`${carDetail.price.min_price}-${carDetail.price.max_price}`} Lakh</p>
              <div className='flex'>
                <div className='flex flex-col'>
                  <Link to={`/buy-car/test-drive-inputform`}
                  state={{ car: carDetail }} >
                    <button
                      className="bg-[#e8ff81] text-darkGrey px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#e8ff88] mx-1"
                      onClick={() => handleClicks(carDetail,"Test Drive")}
                    >
                      Test Drive
                    </button>
                  </Link>

                </div>

                <div className='flex flex-col'>
                <Link 
                  to={`/buy-car/summary/${id}`} 
                  state={{ car: carDetail }} 
                  className="block">
                    <div className="relative inline-block">
                      {/* Show Popup on Hover */}
                      {showPopup && (
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-[300px] sm:w-[400px] lg:w-[500px]">
                          <ExtendedTestDriveBenefits />
                        </div>
                      )}

                      {/* Button to hover */}
                      <button
                        className="bg-[#e8ff81] text-darkGrey px-6 py-3 rounded-lg  font-semibold hover:bg-[#e8ff88] mx-1 "
                        onMouseEnter={() => setShowPopup(true)}
                        onMouseLeave={() => setShowPopup(false)}
                        onClick={() => handleClicks(carDetail,"Extended Test Drive")}

                      >
                        Extended Test Drive
                      </button>
                    </div>
                  </Link>
                  <p className='text-xs mx-2 my-1 overflow-y-auto'>( Try Before You Buy -</p>
                  <p className='text-xs mx-2 my-1 overflow-y-auto'>Book Your Extended Test Drive Now! )</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Drive Popup */}
      {/* <TestDrivePopup
        isOpen={isTestDrivePopupOpen}
        close={() => setIsTestDrivePopupOpen(false)}
        id={id}
      /> */}

    </>
  );
};

export default CarDetails;