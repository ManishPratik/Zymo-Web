import { useState } from "react";
import { format, addDays } from "date-fns";
import { motion } from "framer-motion";
import { useNavigate,useLocation } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from 'lucide-react';
import { useEffect } from "react";
import useTrackEvent from "../../hooks/useTrackEvent";


const ExtendedTestDriveDatePicker = ({ title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const trackEvent = useTrackEvent();
    const { car } = location.state || {};
    const dates = Array.from({ length: 90 }, (_, i) => addDays(new Date(), i));

    const startDateFormatted = format(selectedDate, "dd MMMM, yyyy");

    const endDate = new Date(selectedDate);
    endDate.setDate(selectedDate.getDate() + 30);
    const endDateFormatted = format(endDate, "dd MMMM, yyyy");
    useEffect(() => {
      document.title = title;
    }, [title]);
  
    const onSubmit = () => {
      navigate('/buy-car/upload-info',
        { 
          state: { 
            car:car , startDate:startDateFormatted , endDate:endDateFormatted
          } 
        }
      )
      trackEvent("Extended Test Drive Booking", "Extended Test Drive","Start Date Selected");
    }

  return (
    <>
    <Helmet>
                <title>{title}</title>
                <meta name="description" content="Choose a convenient date and time for your test drive with Zymo." />
                <link rel="canonical" href="https://zymo.app/buy/date-picker" />
                <meta property="og:title" content={title} />
        <meta property="og:description" content="Pick the perfect date and time for your test drive experience at Zymo." />
            </Helmet>
    <div className="min-h-screen bg-[#212121] text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto max-w-4xl py-8"
      >
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-1 md:left-5 top-8 p-2 text-white/80 hover:text-white hover:bg-[#2d2d2d] bg-transparent transition-all "
          >
          <ArrowLeft size={28} />
        </button>

        <div className="text-center mb-6 md:mb-10 text-xl md:text-4xl font-bold">
          <span className="block sm:inline text-appColor font-bold mb-2 sm:mb-0">Welcome</span>
          <span className="block sm:inline"> to Extended Test Drive!</span>
        </div>


        <div className="bg-[#2d2d2d]  p-6 md:p-8 rounded-xl shadow-xl border border-white/10">
            {/* Date Selection */}
            <div className="mb-6">
              <h2 className="text-xl mb-4">Pick-up Date</h2>
              <div className="bg-darkGrey rounded-lg p-5 border border-white/10">
                  <div className="text-xl mb-4">{format(selectedDate, "MMMM dd, yyyy")}</div>
                  
                  <div className="flex space-x-2 mb-3 pb-1 overflow-x-scroll hide-scrollbar ">
                      {dates.map((date) => (
                          <button
                          key={date.toISOString()}
                          onClick={() => setSelectedDate(date)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center transition-all duration-200 border border-white/10 ${
                              selectedDate.toDateString() === date.toDateString()
                              ? "bg-appColor text-black"
                              : "bg-darkGrey2 text-white hover:bg-opacity-70"
                          }`}
                          >
                          <span className="text-xs">{format(date, "MMM")}</span>
                          <span className="text-lg font-semibold">{format(date, "dd")}</span>
                          </button>
                      ))}
                  </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className="bg-darkGrey bg-opacity-50 backdrop-blur-lg rounded-xl p-4 mb-8 border-2 border-appColor">
                <h3 className="text-lg mb-2">Booking Info</h3>
                <p className="text-sm text-gray-300">
                    You can select a date now and have to return it exactly 1 month later
                </p>
            </div>


            {/* Next Button */}
            <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3 md:p-4 rounded-lg font-semibold text-base md:text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] bg-appColor text-black border"
            onClick={onSubmit}
            >
            Next
            </motion.button>
        </div>
      </motion.div>
    </div>
    </>
  );
};


export default ExtendedTestDriveDatePicker;
