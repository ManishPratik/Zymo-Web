import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState , useEffect } from 'react';
import { useNavigate , useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import ExtendedTestDriveBenefits from '../../components/buycomponent/ExtendedTestDriveBenefits';
import { collection  , getDocs} from "firebase/firestore";
import { appDB } from "../../utils/firebase";
import { Helmet } from "react-helmet-async";

import useTrackEvent from '../../hooks/useTrackEvent';

import carData from '../../api/NewCarData';

const ExtendedTestDriveSummary = ({ title }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]); 
  const trackEvent = useTrackEvent();
  console.log("location.state:", location.state);
   const { car } = location.state || {};
  // const car = carData;
  
  console.log("car data:",carData);
  useEffect(() => {
    document.title = title;
  }, [title]);
  
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const subCollectionRef = collection(appDB, "EV FAQ", "MYChoize", "Nexon EV");

        const subCollectionSnapshot = await getDocs(subCollectionRef);

        if (!subCollectionSnapshot.empty) {
          const fetchedFaqs = subCollectionSnapshot.docs.map(doc => doc.data());
          setFaqs(fetchedFaqs); 
        } 
      } catch (error) {
        console.error("Error fetching data from sub-collection:", error);
      }
    };
    fetchFaqs(); 
  }, []);
  
  const onSubmit = () => {
    navigate('/buy-car/date-picker',
      { 
        state: { 
          car:car 
        } 
      }
    )
    trackEvent("Extended Test Drive Booking", "Extended Test Drive","Summary Page Seen");
  }
  
  return (
    <>
     <Helmet>
                <title>{title}</title>
                <meta name="description" content="View your test drive summary with details on car model, time, and location." />
                <meta property="og:title" content={title} />
        <meta property="og:description" content="Get a detailed summary of your scheduled test drive, including car details and pickup information." />
                <link rel="canonical" href={`https://zymo.app/buy/summary/${id}`} />
            </Helmet>
    <div className="min-h-screen bg-[#212121] px-4 md:px-8 animate-fade-in">
      <div className="container mx-auto max-w-4xl py-8">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-1 md:left-5 top-8 p-2 text-white/80 hover:text-white hover:bg-[#2A2A2A] bg-transparent transition-all"
        >
          <ArrowLeft size={28} />
        </button>
        <div className="ext-test-benf flex justify-center my-3 mb-5">
        <ExtendedTestDriveBenefits/>
        </div>
 
        {/* Summary */}
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-xl md:text-4xl font-bold text-appColor">
            Summary
          </h1>
        </div>

        <div className="mx-auto mb-5">
          <div className="bg-[#2d2d2d] backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="mt-4">
                <div className="mt-4 flex justify-center">
                    <img 
                    src={car.image}
                    alt={car.alt}
                    className="w-3/4 border border-white/10 rounded-lg"
                    />
                </div>            
            </div>

            <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Monthly Test Drive Fee</span>
                    <span className="text-white font-medium">₹ {car?.monthlyTestDriveFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Security Deposit</span>
                    <span className="text-white font-medium">₹ {car?.securityDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-gray-300">Total Amount</span>
                    <span className="text-white font-medium">₹ {car?.totalAmount.toLocaleString()}</span>
                </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mb-7">
            <div className="bg-[#2d2d2d] backdrop-blur-md rounded-2xl p-5 border border-white/10">
                <div className="grid grid-cols-2">
                    <div className="flex flex-col justify-between items-center">
                        <span className="text-gray-300">Free Kilometers</span>
                        <span className="text-white font-medium">{car?.freeKilometers.toLocaleString()} Km</span>
                    </div>
                    <div className="flex flex-col justify-between items-center">
                        <span className="text-gray-300">Vendor</span>
                        <span className="text-white font-medium">{car?.vendor}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* FAQs */}
        <div className=" mx-auto space-y-4">
          <h2 className="text-[#edff8d] text-xl font-medium mb-6">FAQs</h2>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#2d2d2d] backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 transition-all duration-300 hover:border-[#edff8d]/30"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-white font-medium">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#edff8d] transition-transform duration-300 ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-48" : "max-h-0"
                }`}
              >
                <p className="px-6 pb-4 text-gray-400">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Next Button */}
        <div className="mt-6 md:mt-8">
            <button
              onClick={onSubmit}
              className="w-full p-3 md:p-4 rounded-lg font-semibold text-base md:text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] bg-appColor text-black border"
            >
              Next
            </button>
        </div>

      </div>
    </div>
    </>
  );
};

export default ExtendedTestDriveSummary;