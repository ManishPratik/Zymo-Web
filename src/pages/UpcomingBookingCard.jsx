import { useState, useCallback, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useTrackEvent from '../hooks/useTrackEvent';
// import { doc, where, query, getDocs, updateDoc, collection } from "firebase/firestore";

// import { appDB } from "../utils/firebase";

// const { VITE_FIREBASE_CANCELLATION_KEY } = import.meta.env;

// Changed to a named function and separated the export

// Modal component for cancellation confirmation
const CancelBookingModal = ({ isOpen, close, bookingData }) => {
  const navigate = useNavigate();
  const trackEvent = useTrackEvent();
  const functionsUrl = import.meta.env.VITE_FUNCTIONS_API_URL;

  const isProcessing = useRef(false);
  const processingComplete = useRef(false);
  const eventTracked = useRef(false);

  const sendCancelWhatsAppMessage = useCallback(async (bookingData) => {
    try {
      const response = await fetch(`${functionsUrl}/message/booking-cancel-whatsapp-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingData }),
      });

      const data = await response.json();
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Error sending cancellation WhatsApp message:', error);
    }
  }, [functionsUrl]);

  useEffect(() => {
    const processCancellation = async () => {
      if (!isOpen || !bookingData || isProcessing.current || processingComplete.current) {
        return;
      }

      if (isOpen && !eventTracked.current) {
        trackEvent('Booking Cancellation', 'Cancel Booking', 'Cancellation Confirmed');
        eventTracked.current = true;
      }

      try {
        isProcessing.current = true;
        await sendCancelWhatsAppMessage(bookingData);
        processingComplete.current = true;
      } catch (error) {
        console.error('Error processing booking cancellation:', error);
      } finally {
        isProcessing.current = false;
      }
    };

    processCancellation();
  }, [isOpen, bookingData, sendCancelWhatsAppMessage, trackEvent]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      close();
      navigate('/', { replace: true });
    }, 8000);

    return () => clearTimeout(timer);
  }, [isOpen, close, navigate]);

  const handleConfirm = () => {
    localStorage.clear();
    sessionStorage.clear();
    close();
    navigate('/', { replace: true });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-[#2A2A2A] rounded-lg shadow-lg p-6 w-80 text-center">
        <div className="w-16 h-16 bg-[#faffa4] rounded-full flex items-center justify-center mx-auto text-[#212121]">
          <Check size={32} />
        </div>
        <h2 className="text-xl font-bold mt-4 text-white">Booking Cancelled</h2>
        <p className="text-white mt-2">
          Your booking has been cancelled. <br />
          Check your WhatsApp for other details.
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

export default function UpcomingBookingCard({ bookingData }) {
  // const handleCancelBooking = async (bookingId) => {
  //   console.log("Cancelling booking:", bookingId, "for user:", bookingData.UserId);

  //   try {
  //     const bookingsCollectionRef = collection(appDB, "CarsPaymentSuccessDetails");
  //     const bookingQuery = query(
  //       bookingsCollectionRef,
  //       where("bookingId", "==", bookingId)
  //     );

  //     const bookingSnapshot = await getDocs(bookingQuery);
  //     if (bookingSnapshot.empty) {
  //       console.error("No booking found with the given ID");
  //       return;
  //     }

  //     const bookingDoc = bookingSnapshot.docs[0];
  //     console.log("Found booking document:", bookingDoc.id);

  //     await updateDoc(doc(appDB, "CarsPaymentSuccessDetails", bookingDoc.id), {
  //       'Cancelled': true,
  //       'CancellationDate': new Date()
  //     });
  //     console.log("Booking marked as cancelled in Firestore");

  //     // Now call the API to cancel the booking in the backend
  //     try {
  //       const cancelUrl = `${VITE_FIREBASE_CANCELLATION_KEY}cancelZoomBooking`;

  //       const response = await fetch(cancelUrl, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           uid: bookingData.UserId,
  //           bookingId: bookingId,
  //         }),
  //       });
  //       if (!response.ok) {
  //         throw new Error(`Server responded with status ${response.status}`);
  //       }

  //       const result = await response.json();
  //       console.log("Cancellation successful:", result);
  //     } catch (e) {
  //       console.error("Error in cancelling the booking:", e);
  //     }
  //   } catch (e) {
  //     console.error("Error updating cancellation status:", e);
  //     alert("Failed to cancel booking. Please try again.");
  //   }
  // };

  // implemented cancel btn logic
  const [showOverlay, setShowOverlay] = useState(false);
  const [vendor, setVendor] = useState("ZoomCar"); // Or dynamically set

  const handleCancelClick = () => {
    setShowOverlay(true);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
  };

  return (
    <div>
      {/* Booking Card */}
      <div className="bg-[#363636] mt-4 p-4 rounded-lg flex items-center space-x-4">
        <img
          src={bookingData.CarImage}
          alt={bookingData.CarName}
          className="w-50 h-24 rounded-md"
        />
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-[#faffa4]">
            {bookingData.CarName}{" "}
            <span className="text-lg text-white">({bookingData.Vendor})</span>
          </h3>
          <p className="text-gray-400">
            Booking ID:{" "}
            <span className="text-white">{bookingData.bookingId}</span>
          </p>
          <p className="text-gray-400">
            Price: <span className="text-white">₹{bookingData.price}</span>
          </p>
          <p className="text-gray-400">
            From: <span className="text-white">{bookingData.StartDate}</span>{" "}
            <br />
            To: <span className="text-white">{bookingData.EndDate}</span>
          </p>

          {/* Display pickup and drop if vendor is mychoize */}
          {bookingData["Pickup Location"] && (
            <p className="text-gray-400">
              Pickup:{" "}
              <span className="text-white">
                {bookingData["Pickup Location"]}
              </span>
              <br />
              {bookingData["Drop Location"] && (
                <>
                  Drop:{" "}
                  <span className="text-white">
                    {bookingData["Drop Location"]}
                  </span>
                </>
              )}
            </p>
          )}

          <p className="text-gray-400 mt-1">
            {bookingData["Package Selected"]} | {bookingData.Transmission}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col space-y-2">
          {/* <button className="bg-[#faffa4] text-black px-4 py-2 rounded-md">
            Extend Booking
          </button> */}
          <button className="bg-[#faffa4] text-black px-4 py-2 rounded-md">
            If Cancelled By Vendor
          </button>

          {/* <button className="text-red-500 font-semibold" onClick={handleCancelClick}>Cancel </button> */}

          {showOverlay && (
            <div className="fixed inset-0 bg-[#404040] bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-[#212121] p-6 rounded-lg max-w-lg w-full relative">
                <CancellationBookingPolicy vendor={vendor} />
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={closeOverlay}
                    className="px-4 py-2 bg-[#faffa4] text-black rounded hover:bg-[#faffa4]"
                  >
                    Back
                  </button>
                  <CancelBookingModal
                    isOpen={showOverlay}
                    close={closeOverlay}
                    bookingData={bookingData}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}