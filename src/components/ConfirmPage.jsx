import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useCallback } from "react";

const ConfirmPage = ({ isOpen, close, car, userData }) => {
  const navigate = useNavigate();
  const hasSentMessage = useRef(false);

  const functionsUrl = import.meta.env.VITE_FUNCTIONS_API_URL;

  // Function to send WhatsApp message, wrapped in useCallback
  const sendWhatsAppMessage = useCallback(
    async (bookingData) => {
      try {
        const endpoint =
        bookingData.source === "zymo"
          ? "message/send-whatsapp-message"
          : "message/booking-confirmation";

        const response = await fetch(`${functionsUrl}/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingData }),
        });

        const data = await response.json();
        console.log("WhatsApp Message Response:", data);
      } catch (error) {
        console.error("Error sending WhatsApp message:", error);
      }
    },
    [functionsUrl] 
  );

  useEffect(() => {
    if (!car || !userData || hasSentMessage.current) {
      return;
    }

    const bookingData = { car, userData };
    // sendWhatsAppMessage(bookingData);
    hasSentMessage.current = true;
  }, [car, userData, sendWhatsAppMessage]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      close();
      navigate("/", { replace: true });
    }, 8000); 

    return () => clearTimeout(timer);
  }, [isOpen, close, navigate]);

  const handleConfirm = () => {
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

export default ConfirmPage;