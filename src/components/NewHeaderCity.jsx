import React from 'react'
import NewRSB from './NewRSB';
import { useParams } from "react-router-dom";

const NewHeaderCity = () => {
  const { city } = useParams();

  const cityImages = {
    delhi: '/images/CityCars&Price/delhi.png',
    mumbai: '/images/CityCars&Price/mumbai.png',
    bangalore: '/images/CityCars&Price/bangalore.png',
    pune: '/images/CityCars&Price/pune.png',
    chennai: '/images/CityCars&Price/chennai.png',
    hyderabad: '/images/CityCars&Price/hyderabad.png',
    kolkata: '/images/CityCars&Price/kolkata.png',
    // Add more as needed
  };

  const imageSrc = cityImages[city.toLowerCase()] || ''; // fallback

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#303030] text-white p-10 my-2 rounded-lg shadow-md">

        {/* Left: Text */}
        <div className="md:w-3/4 text-center md:text-left">
          <NewRSB urlcity={city} />
        </div>


        {/* Right: Image */}
        <div className="md:w-1/4 flex justify-center mt-6 md:mt-0 sm:">
          <img
            src={imageSrc}
            alt={`${city} Car Options`}
            className="max-w-sm w-full rounded-lg shadow-lg"
          />
        </div>

      </div>

    </>
  )
}

export default NewHeaderCity
