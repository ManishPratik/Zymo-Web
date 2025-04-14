import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useEffect } from "react";
import UpcomingBookingCard from "./UpcomingBookingCard";
import PastBookings from "./PastBookings";
import ReactGA from 'react-ga4';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";


function UserNavigation(label) {
  ReactGA.event({
    category: 'User Interaction',
    action: 'Button Clicked',
    label: label,
  });
}
import { Helmet } from "react-helmet-async";
export default function MyBookings({ title }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const navigate=useNavigate();
  useEffect(() => {
    document.title = title;
}, [title]);
  return (
    <>
    <Helmet>
                <title>{title}</title>
                <meta name="description" content="View and manage all your Zymo car rental bookings in one place." />
                <link rel="canonical" href="https://zymo.app/my-bookings" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content="Check your upcoming and past bookings with Zymo." />
            </Helmet>
    <div className="bg-[#212121] min-h-screen text-white">
      <NavBar />

      <button
        onClick={() => navigate("/")}
        className="text-white m-5 cursor-pointer"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>

        {/* Tabs */}
        <div className="flex space-x-6 text-lg border-b border-gray-700 pb-2">
          <button
            className={`${activeTab === "upcoming" ? "text-[#faffa4]" : "text-gray-400"
              } cursor-pointer hover:text-white`}
            onClick={() => {
              setActiveTab("upcoming")
              UserNavigation("Upcoming Bookings");
            }}
          >
            Upcoming
          </button>
          <button
            className={`${activeTab === "past" ? "text-[#faffa4]" : "text-gray-400"
              } cursor-pointer hover:text-white`}
            onClick={() => {
              setActiveTab("past");
              UserNavigation("Past Bookings");
            }}

          >
            Past
          </button>
          <button
            className={`${activeTab === "cancelled" ? "text-[#faffa4]" : "text-gray-400"
              } cursor-pointer hover:text-white`}
            onClick={() => {
              setActiveTab("cancelled")
              UserNavigation("Cancelled Bookings");
            }}
          >
            Cancelled
          </button>
        </div>

        {/* Conditional Rendering Based on Tab */}
        <div>
          {activeTab === "upcoming" && (
            <>
              <UpcomingBookingCard />
              <UpcomingBookingCard />
            </>
          )}
          {activeTab === "past" && (
            <>
              <PastBookings />
            </>
          )}
          {activeTab === "cancelled" && (
            <>
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-400">No cancelled bookings found.</p>
            </div>
              {/* Add the page before using components */}
              {/* <CancelledBookings /> */}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}
