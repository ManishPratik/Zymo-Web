import React, { useEffect } from "react";

export default function UpcomingBookingCard({ bookingData }) {
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
          <button className="text-red-500 font-semibold">Cancel Ride</button>
        </div>
      </div>
    </div>
  );
}
