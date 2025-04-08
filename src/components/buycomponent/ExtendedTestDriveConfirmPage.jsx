import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect,useCallback ,useRef} from 'react';
import useTrackEvent from "../../hooks/useTrackEvent";


const ExtendedTestDriveConfirmPage = ({ isOpen, close, bookingData }) => {
  const navigate = useNavigate();
  const trackEvent = useTrackEvent();

  const isProcessing = useRef(false);
  const processingComplete = useRef(false);
  const eventTracked = useRef(false);

  const functionsUrl = import.meta.env.VITE_FUNCTIONS_API_URL;

  const sendWhatsAppMessage = useCallback(async (bookingData) => {
    try {
      const response = await fetch(`${functionsUrl}/message/extended-test-drive-whatsapp-message`, {
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

  useEffect(() => {
    const processBooking = async () => {
      if (!isOpen || !bookingData || isProcessing.current || processingComplete.current) {
        return;
      }

      if (isOpen && !eventTracked.current) {
        trackEvent("Extended Test Drive Booking", "Extended Test Drive", "Payment Successful/Booking Confirmed");
        eventTracked.current = true; 
      }

      try {
        isProcessing.current = true;
        await sendWhatsAppMessage(bookingData);
        processingComplete.current = true;
        
        // console.log('Extended test drive booking processed successfully');
      } catch (error) {
        console.error('Error processing extended test drive booking:', error);
      } finally {
        isProcessing.current = false;
      }
    };

    processBooking();
  }, [isOpen, bookingData, sendWhatsAppMessage, trackEvent]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      close();
      navigate("/", { replace: true });
    }, 8000); 

    return () => clearTimeout(timer);
  }, [isOpen, close, navigate]);

  // Handle button click
  const handleConfirm = () => {
    localStorage.clear();
    sessionStorage.clear();
    close();
    navigate("/", { replace: true });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 w-80 text-center">
        <div className="w-16 h-16 bg-[#faffa4] rounded-full flex items-center justify-center mx-auto text-[#212121]">
          <Check size={32} />
        </div>
        <h2 className="text-xl font-bold mt-4 text-white">Awesome!</h2>
        <p className="text-white mt-2">
          Your booking has been confirmed. <br />
          Check your WhatsApp for more details.
        </p>
        <button
          onClick={handleConfirm}
          className="bg-[#faffa4] text-[#212121] font-semibold px-6 py-2 rounded-lg mt-4 hover:bg-[#edff8d] transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default ExtendedTestDriveConfirmPage;