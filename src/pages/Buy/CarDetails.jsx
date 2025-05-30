import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
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
  const handleClicks = (carDetail, label) => {
    trackEvent("Test & Extended Test Drive Section", "Buy Section Button Clicked", label);
    trackEvent("Buy Section Car", `Buy Section Car`, `${carDetail.name} ${carDetail.model}- ${carDetail.vendor}-${label}`)
  }

  const features = car.type === 'Electric'
  ? [
      { icon: 'fa-car', label: 'Range', value: `${car.range} Km` },
      { icon: 'fa-battery', label: 'Battery', value: `${car.battery} kWh` },
      { icon: 'fa-plug', label: 'Power', value: `${car.power} bhp` },
      { icon: 'fa-stopwatch', label: 'Charging', value: `${car.charging.min_time} - ${car.charging.max_time} hrs` }
    ]
  : [
      { icon: 'fa-car', label: 'Engine', value: `${car.engine} cc` },
      { icon: 'fa-gauge', label: 'Mileage', value: `${car.mileage} kmpl` },
      { icon: 'fa-car-battery', label: 'Power', value: `${car.power} bhp` },
      { icon: 'fa-gauge-high', label: 'Top Speed', value: `${car.speed} kmph` }
    ];


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
          className="fixed left-1 md:left-5 top-8 p-2 text-white/80 hover:text-white hover:bg-[#2A2A2A] bg-transparent transition-all z-10"
        >
          <ArrowLeft size={28} />
        </button>

        {/* Main Content */}
        <main className='w-full h-full flex flex-col md:flex-row gap-5 pt-10 md:pt-0'>
          {/* Image container */}
          <div className='md:w-1/2 flex items-start justify-center md:sticky top-56 h-fit'>
            <img 
              className='w-full h-auto max-w-[400px] md:max-w-full object-contain'
              src={car.image}
              alt={`${car.name}${car.model}`}
            />
          </div>


          {/* Car Details */}
          <div className='md:w-1/2 flex flex-col p-0 lg:p-2 xl:p-10'>
            <h1 className='text-4xl text-center md:text-left font-bold'>{car.name} {car.model}</h1>
            <div className='my-2'>
              <span className='text-appColor text-xl md:text-2xl flex justify-center md:justify-start'>★ {car.rating}</span>
            </div>
            {/* Key Feaures */}
            <div className='pt-5'>
              <h2 className='text-xl md:text-2xl font-bold mb-4'>Key Features</h2>
              <div className='grid grid-cols-2 gap-2 md:gap-5'>
                {features.map((item, index) => (
                  <div key={index} className='flex items-center gap-3 md:gap-5 md:p-4 py-3 md:pl-6 pl-4 border-2 border-white/10 rounded-xl bg-[#2d2d2d]'>
                    <div><i className={`fa ${item.icon} text-lg`} /></div>
                    <div className='flex flex-col'>
                      <h3 className='lg:text-lg text-white/75'>{item.label}</h3>
                      <p className='lg:text-xl font-semibold'>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* specifications */}
            <section className='py-10'>
              <h2 className='text-xl md:text-2xl font-bold mb-4'>Specifications</h2>
              <ul className='w-full'>
                <li className='w-full flex justify-between px-2 font-bold text-white/75 md:text-lg mb-2'>Body Style <span className='ml-auto inline-block text-white font-normal'>{car.bodyStyle}</span></li>
                <li className='w-full flex justify-between px-2 font-bold text-white/75 md:text-lg mb-2'>Warranty <span className='ml-auto inline-block text-white font-normal'>{car.warranty_years} yrs / {car.warranty_km} km</span></li>
                <li className='w-full flex justify-between px-2 font-bold text-white/75 md:text-lg mb-2'>Length <span className='ml-auto inline-block text-white font-normal'>{car.length} mm</span></li>
                <li className='w-full flex justify-between px-2 font-bold text-white/75 md:text-lg mb-2'>Width <span className='ml-auto inline-block text-white font-normal'>{car.width} mm</span></li>
                { car.type == 'Electric' ? 
                  <li className='w-full flex justify-between px-2 font-bold text-white/75 md:text-lg mb-2'>Height <span className='ml-auto inline-block text-white font-normal'>{car.height.min_height} - {car.height.max_height} mm</span></li> : 
                  <li className='w-full flex justify-between px-2 font-bold text-white/75 md:text-lg mb-2'>Height <span className='ml-auto inline-block text-white font-normal'>{car.height} mm</span></li>
                }  
                <li className='w-full flex justify-between px-2 font-bold text-white/75 md:text-lg mb-2'>Cargo Volume <span className='ml-auto inline-block text-white font-normal'>{car.cargoVolume} L</span></li>
              </ul>
            </section>

            <section className='p-6 border-l-4 border-appColor bg-darkGrey2 rounded-md shadow-md'>
              <h3 className='text-xl font-bold text-appColor mb-2'>
                About {car.name} {car.model}
              </h3>
              <p className='text-white leading-relaxed'>{car.about}</p>
            </section>


            <section className='pt-10'>
              <p className='text-3xl md:text-4xl font-bold md:pb-2 md:text-left text-center'>₹{car.price.min_price} - {car.price.max_price} Lakh</p>
              <span className='text-white/75 block md:text-left text-center'>Average Ex-Showroom Price</span>
            </section>

            <div className='flex gap-2 pt-5 md:justify-start justify-center'>
              <Link to={`/buy-car/test-drive-inputform`}
                    state={{ car: carDetail }}
              >
                <button className='bg-appColor py-3 px-4 text-darkGrey font-bold rounded-lg md:text-base text-sm hover:scale-105 transition-all duration-300'>Test Drive</button>
              </Link>
              <div className="flex gap-2 items-center group relative">
                <Link to={`/buy-car/extended-test-drive/location`} state={{ car: carDetail }}>
                  <button className="bg-appColor py-3 px-4 text-darkGrey font-bold rounded-lg md:text-base text-sm hover:scale-105 transition-all duration-300">
                    Extended Test Drive
                  </button>
                </Link>

                <span 
                  className="absolute z-10 left-1/2 md:left-1/3 -translate-x-1/2 top-[-3rem] md:top-[-2.5rem] px-1 py-1 md:px-3 md:py-2 rounded bg-darkGrey2 text-white text-xs w-52 md:w-max 
                  text-center opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300 shadow-md"
                >
                  Try Before You Buy – Book Your Extended Test Drive Now!
                </span>
              </div>

            </div>

          </div>

        </main>
        
      </div>

    </>
  );
};

export default CarDetails;