import React, { useEffect } from "react";

export default function UpcomingBookingCard({ bookingData }) {
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
          <button className="text-red-500 font-semibold" onClick={handleCancelClick}>Cancel </button>

          {showOverlay && (
        <div className="fixed inset-0 bg-[#404040] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#212121] p-6 rounded-lg max-w-lg w-full relative">
            <CancellationBookingPolicy vendor={vendor} />
            <div className="mt-4 flex justify-between">
              <button 
                onClick={closeOverlay} 
                className="px-4 py-2  bg-[#faffa4] text-black rounded hover:bg-[#faffa4] "
              >
                Back
              </button>
              <button 
                onClick={() => alert("Proceeding to cancel...")} 
                className="px-4 py-2 bg-[#faffa4] text-black rounded hover:bg-[#f1f77c]"
              >
                Proceed to Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
