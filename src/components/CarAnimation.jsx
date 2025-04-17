import React, { useEffect, useState, useRef } from "react";

const CarAnimation = () => {
  const [position, setPosition] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      setPosition(prevPosition => {
        const newPosition = prevPosition + 0.5;
        return newPosition > 100 ? -20 : newPosition; // Start a bit offscreen left
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-12 overflow-hidden">
      <div
        style={{
          position: "absolute",
          left: `${position}%`,
          top: "50%",
          transform: "translateY(-50%)"
        }}
        aria-label="Moving car animation"
      >
        <img 
          src="/car.png" 
          alt="Car" 
          className="w-24 h-auto"
        />
      </div>
    </div>
  );
};

export default CarAnimation;
