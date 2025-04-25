import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useEffect } from "react";
import UpcomingBookingCard from "./UpcomingBookingCard";
import PastBookings from "./PastBookings";
import ReactGA from "react-ga4";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UserNavigation(label) {
  ReactGA.event({
    category: "User Interaction",
    action: "Button Clicked",
    label: label,
  });
}
import { Helmet } from "react-helmet-async";
import { appAuth, appDB } from "../utils/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
export default function MyBookings({ title }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const navigate = useNavigate();
  useEffect(() => {
    document.title = title;
  }, [title]);

  const [dataUnavailable, setDataUnavailable] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [, setCancelledBookings] = useState([]);

  useEffect(() => {
    const getUserBookings = appAuth.onAuthStateChanged(async (user) => {
      if (!user) {
        setDataUnavailable(true);
        return;
      }

      try {
        const bookingsQuery = query(
          collection(appDB, "CarsPaymentSuccessDetails"),
          where("UserId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(bookingsQuery);
        
        if (querySnapshot.empty) {
          setDataUnavailable(true);
          return;
        }

        const bookings = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (bookings.length > 0) {
          setDataUnavailable(false);
          setBookings(bookings);
          console.log("Bookings:", bookings);
        }
      } catch (error) {
        console.error("Error retrieving bookings:", error);
        setDataUnavailable(true);
      }
    });
    
    return () => getUserBookings();
  }, []);

  useEffect(() => {
    const seperateBookings = () => {
      if (bookings.length < 1) return;

      const upcoming = [];
      const cancelled = [];
      const past = [];

      bookings.map((booking) => {
        const endDate = booking.EndDate;
        const endDateTimestamp = Date.parse(endDate.replace(",", ""));
        const currentTimestamp = Date.now();

        if (booking.Cancelled) {
          cancelled.push(booking);
        } else if (currentTimestamp < endDateTimestamp) {
          upcoming.push(booking);
        } else {
          past.push(booking);
        }
      });

      setCancelledBookings(cancelled);
      setUpcomingBookings(upcoming);
      setPastBookings(past);
    };

    seperateBookings();
  }, [bookings]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content="View and manage all your Zymo car rental bookings in one place."
        />
        <link rel="canonical" href="https://zymo.app/my-bookings" />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content="Check your upcoming and past bookings with Zymo."
        />
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
              className={`${
                activeTab === "upcoming" ? "text-[#faffa4]" : "text-gray-400"
              } cursor-pointer hover:text-white`}
              onClick={() => {
                setActiveTab("upcoming");
                UserNavigation("Upcoming Bookings");
              }}
            >
              Upcoming
            </button>
            <button
              className={`${
                activeTab === "past" ? "text-[#faffa4]" : "text-gray-400"
              } cursor-pointer hover:text-white`}
              onClick={() => {
                setActiveTab("past");
                UserNavigation("Past Bookings");
              }}
            >
              Past
            </button>
            <button
              className={`${
                activeTab === "cancelled" ? "text-[#faffa4]" : "text-gray-400"
              } cursor-pointer hover:text-white`}
              onClick={() => {
                setActiveTab("cancelled");
                UserNavigation("Cancelled Bookings");
              }}
            >
              Cancelled
            </button>
          </div>

          {dataUnavailable ? (
            <div className="w-full flex items-center justify-center min-h-[200px]">
              <h2 className="text-2xl text-[#faffa4]">No data available</h2>
            </div>
          ) : (
            <>
              {/* Conditional Rendering Based on Tab */}
              <div>
                {activeTab === "upcoming" && (
                  <>
                    {upcomingBookings.length > 0 ? (
                      upcomingBookings.map((booking, index) => (
                        <UpcomingBookingCard key={booking.bookingId || index} bookingData={booking} />
                      ))
                    ) : (
                      <div className="w-full flex items-center justify-center min-h-[200px]">
                        <h2 className="text-2xl text-[#faffa4]">
                          No data available
                        </h2>
                      </div>
                    )}
                  </>
                )}
                {activeTab === "past" && (
                  <>
                    {pastBookings.length > 0 ? (
                      pastBookings.map((booking, index) => (
                        <PastBookings key={booking.bookingId || index} bookingData={booking} />
                      ))
                    ) : (
                      <div className="w-full flex items-center justify-center min-h-[200px]">
                        <h2 className="text-2xl text-[#faffa4]">
                          No data available
                        </h2>
                      </div>
                    )}
                  </>
                )}
                {activeTab === "cancelled" && (
                  <>
                    {/* Add the page before using components */}
                    {/* <CancelledBookings /> */}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
