import React from 'react'
import NewRSB from "../NewRSB";
import { useParams } from "react-router-dom";

const Header = () => {
    const { city } = useParams();
    return (     
        <>
            <section
                // className=" w-screen realtive bg-[#212121] min-h-screen justify-center items-center"
                className="relative z-10 h-screen w-full flex flex-col items-center justify-center bg-black bg-cover bg-center bg-no-repeat text-white overflow-visible"
                // style={{ backgroundImage: `url('/images/HeroImages/hero_car.jpg')` }} //If u want to add image in bg instead of video
            >
                <video
                    // ref={videoRef}
                    className="absolute w-full lg:w-auto h-full object-cover z-0"
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source src="/images/HeroImages/hero_car_video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="bg-yellow text-white p-4 py-10 text-center my-2 z-20">
                    {/* <div className="absolute inset-0 bg-black bg-opacity-50 z-0 "></div> */}
                    {/* <h1 className="text-white text-xl sm:text-3xl  md:text-4xl font-bold">Drive Your Dreams with Zymo </h1> */}
                    {/* <h4 className='text-gray-400 text-md md:text-sm mt-2'>Experience the future of car rentals. Book, drive, and explore with ease.</h4> */}
                    <h1 className="text-white text-xl sm:text-3xl  md:text-4xl font-bold">Your Ride. Your Way.</h1>
                    <h1 className="text-white text-xl sm:text-3xl  md:text-4xl font-bold">Tap. Book. Drive.</h1>
                    <h4 className='text-gray-400 text-md md:text-sm mt-2'>Self-drive rentals made seamless with Zymo.</h4>
                </div>
                    <NewRSB urlcity={city} />
                {/* <div className='w-screen h-2'></div> */}
            </section>
        </>
    )
}

export default Header
