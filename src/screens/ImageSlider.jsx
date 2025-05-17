import { useState } from "react";

export default function CarImageSlider({ preBookingData }) {
  const images = preBookingData.headerDetails.image || [];
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="sm:p-2 p-0 sm:bg-[#303030] bg-transparent rounded-md flex flex-col lg:flex-row items-center sm:gap-2 gap-2">
      
      <div>
        <img
          src={selectedImage || "/placeholder.svg"}
          alt={`${preBookingData.headerDetails.name}`}
          className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-[20rem] h-[200px] sm:h-[280px] lg:h-[200px] object-cover rounded-md"
        />
      </div>

      {images.length > 1 && (
        <div className="flex flex-row lg:flex-col md:gap-1 gap-3">
          {images.slice(0, 4).map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(img)}
              className="w-12 h-12 border-2 border-darkGrey2 rounded-md cursor-pointer overflow-hidden hover:opacity-80"
            >
              <img
                src={img || "/placeholder.svg"}
                alt={`Thumbnail ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
