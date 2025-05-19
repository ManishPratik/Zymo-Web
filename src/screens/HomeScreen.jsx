import NavBar from "../components/NavBar";
import Header from "../components/homecomponent/Header";
import HeroImage from "../components/homecomponent/HeroImage";
import Benefits from "../components/homecomponent/Benefits";
import Reviews from "../components/homecomponent/Reviews";
import Cities from "../components/homecomponent/Cities";
import Footer from "../components/Footer";
import BrandsAvailable from "../components/homecomponent/BrandsAvailable";
import ServiceProvider from "../components/homecomponent/ServiceProvider";
import { FaWhatsapp } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import NewRSB from "../components/NewRSB";
import { useEffect } from "react";
import useTrackEvent from "../hooks/useTrackEvent";
import { useParams } from "react-router-dom";
import ChatBotButton from "../components/Chatbot/ChatBotButton";
import StepsofZymo from "../components/homecomponent/StepsofZymo";
import FeaturedIn from "../components/homecomponent/FeaturerdIn";
import CompareAndChoice from "../components/CityContentComponent/CompareAndChoice";
import CityBenefits from "../components/CityContentComponent/CityBenefits";
import CityContents from "../components/CityContentComponent/CityContents";
import CityBlogsContent from "../components/CityBlogsContent";
import NewHeaderCity from "../components/NewHeaderCity";
//import StepsofZymo from "../components/homecomponent/StepsofZymo.jsx";

const HomeScreen = ({ title, canonical }) => {
  const { city } = useParams();

  const capitalizedCity =
    city?.charAt(0).toUpperCase() + city?.slice(1).toLowerCase();

  const pageTitle = city
    ? ` Explore Self-Drive Car Rentals in ${capitalizedCity} | Zymo`
    : title || "Zymo: Your Ride. Your Way." ;                           //Added new title !

  const pageDescription = city
    ? `Rent affordable self-drive cars in ${capitalizedCity}. Compare prices, book in minutes, and enjoy affordable, hassle-free car rentals.`
    : "Compare self drive car hire deals across India and get the lowest price with Zymo. No frills, just the best value.";

  const canonicalLink = canonical
    ? `https://zymo.app${canonical}`
    : city
      ? `https://zymo.app/self-drive-car-rentals/${city.toLowerCase()}`
      : "https://zymo.app/";

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  const trackEvent = useTrackEvent();
  const handleWhatsappClicks = (label) => {
    trackEvent("Whatsapp Icon", "Icon Clicks", label);
  };

  return (
    <>
      <Helmet>
        <title>Self Drive Car Hire India – Compare Deals, Lowest Price</title> {/* Statically added title */}
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <link rel="canonical" href={canonicalLink} />
      </Helmet>

      <NavBar city={city} />
      <div className="container flex flex-col w-full mx-auto">
        <div className="container">

          {city ? <NewHeaderCity/> : <Header/>}
          {/* <Header /> */}
          {/* <NewRSB urlcity={city} /> */}
          <CompareAndChoice />
          <CityBenefits />
          
          <HeroImage />
          {/* <RSB /> */}
         


          <Benefits />
          <BrandsAvailable />
          <FeaturedIn />
          <ServiceProvider />
          

          {city && (
            <>

              <div
                className="px-4 md:px-12 py-12 mb-12 bg-[#404040] text-white font-poppins rounded-2xl max-w-screen-lg mx-auto border border-[#505050]"
                style={{
                  background: "linear-gradient(to bottom, #212121, #faffa4)",
                }}
              >
                <CityContents city={city} />
              </div>
              <CityBlogsContent cityName={city} />
            </>
          )}

          <StepsofZymo></StepsofZymo>
          <Reviews />
          <Cities />
        </div>

        {/* WhatsApp Floating Button */}
        {/* <a
          href="https://wa.me/919987933348"
          className="fixed bottom-5 right-5 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition duration-300"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleWhatsappClicks("Whatsapp Icon")}
        >
          <FaWhatsapp className="text-3xl" />
        </a> */}

        <div className="hidden sm:block">
          <ChatBotButton />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default HomeScreen;
