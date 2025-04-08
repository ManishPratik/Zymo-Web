import { useLocation ,useNavigate  } from 'react-router-dom';
import { useEffect,useCallback,useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, addDoc } from "firebase/firestore";
import { webDB } from "../../utils/firebase";

import useTrackEvent from '../../hooks/useTrackEvent';

const TestDriveConfirmPage = ({ title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const trackEvent = useTrackEvent();

  const isProcessing = useRef(false);
  const eventTracked = useRef(false);
  const processingComplete = useRef(false);

  const { car, userData } = location.state || {};  
  
  const functionsUrl = import.meta.env.VITE_FUNCTIONS_API_URL;
  useEffect(() => {
    document.title = title;
  }, [title]);

  const sendWhatsAppMessage = useCallback(async (bookingData) => {
    try {
      const response = await fetch(`${functionsUrl}/message/test-drive-whatsapp-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingData }),
      });

      const data = await response.json();
      // console.log("WhatsApp Message Response:", data);
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    }
  },[functionsUrl]);

    // Upload data to Firebase
  const uploadDataToFirebase = useCallback(async(bookingData) => {
      try {
          
        const data = {
          carId: bookingData.carId,
          bookingId: 'Z' + new Date().getTime().toString(),
          carName: bookingData.name,
          carModel: bookingData.model,
          carType: bookingData.type,
          userName: bookingData.userName,
          email: bookingData.email,
          phone: bookingData.phone,
          dob: bookingData.dob,
          address: bookingData.address,
          city: bookingData.city,
          pincode: bookingData.pincode,
          price: bookingData.totalAmount,
          bookingType:"Test Drive",
          createdAt: new Date(),
        };
  
        // Add data to Firebase collection
        await addDoc(collection(webDB, "BuySectionBookingDetail"), data);
        // console.log("Data uploaded to Firebase:", data);
        } catch (error) {
        console.error("Error uploading documents to Firebase:", error);
      }
  },[]);

    
  useEffect(() => {
    const processBooking = async () => {
      if (!car || !userData || isProcessing.current || processingComplete.current) {
        return;
      }

      try {
        isProcessing.current = true;
        const bookingData = { 
          ...car, 
          ...userData,
        };

        await Promise.all([
          sendWhatsAppMessage(bookingData),
          uploadDataToFirebase(bookingData)
        ]);
        if (!eventTracked.current) {
          trackEvent("Test Drive Booking", "Test Drive", "Payment Successful/Booking Confirmed");
          eventTracked.current = true; 
        }

        processingComplete.current = true;

      } catch (error) {
        console.error('Error processing booking:', error);
      } finally {
        isProcessing.current = false;
      }
    };

    processBooking();
  }, [car, userData, sendWhatsAppMessage, uploadDataToFirebase, trackEvent ]);
  
  useEffect(() => {

    const timer = setTimeout(() => {
      close();
      navigate("/", { replace: true });
    }, 8000); 

    return () => clearTimeout(timer);
  }, [navigate]);


  const handlesubmit = ()=>{
    localStorage.clear();
    sessionStorage.clear();
    navigate('/',{ replace: true })
  }
  return (
    <>
 <Helmet>
                <title>{title}</title>
                <meta name="description" content="Confirm your test drive details and get ready to experience your selected car with Zymo!" />
                <meta property="og:title" content={title} />
        <meta property="og:description" content="Thank you for booking your test drive with Zymo. Check your confirmation details here." />
                <link rel="canonical" href="https://zymo.app/buy/test-drive-confirmpage" />
            </Helmet>
    <div className="flex items-center justify-center min-h-screen bg-[#212121]">
      <div className="w-full max-w-md p-6 bg-[#2c2c2c] border rounded-lg shadow-lg border-appColor text-center transform transition duration-300 hover:scale-105">
        <h2 className="text-2xl font-semibold text-appColor mt-3">
          Your Test Drive Has Been Confirmed! 🚗
        </h2>
        <p className="text-gray-200 mt-2 text-lg">
          Thank you for booking a test drive with <b>Zymo</b>. We have scheduled
          your appointment, and you will receive further details soon.
        </p>
        <p className="text-gray-200 mt-2 text-lg">
          🚀 Get ready to experience your car on real roads!
        </p>
        <p className="text-gray-200 font-medium mt-4 text-lg">
          📅 Check your email for confirmation details.
        </p>

        <button
          onClick={handlesubmit}
          className="mt-6 bg-appColor text-[#212121] hover:bg-appColor py-2 px-4 rounded-lg text-lg font-semibold transition duration-300"
        >
          Go to Home
        </button>
      </div>
    </div>
    </>
  );
};

export default TestDriveConfirmPage;
