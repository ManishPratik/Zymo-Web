import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HeroImage = () => {
  const images = [
    "/images/HeroImages/hero_img_1.jpg",
    "/images/HeroImages/hero_img_2.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();

  return (
    <div className="relative w-[100%] max-w-5xl mx-auto overflow-hidden rounded-lg z-0">
      <div className="w-screen h-10"></div>
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((carimg, index) => (
          <img
            key={index}
            src={carimg}
            alt={`Hero section ${index + 1}`}
            className="w-full h-auto flex-shrink-0 object-cover rounded-lg cursor-pointer"
            onClick={() => navigate("/buy-car")}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroImage;
