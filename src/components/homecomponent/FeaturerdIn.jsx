import { useEffect, useRef } from "react";

const FeaturedIn = () => {
  const Featured = [
    {
      id: 1,
      name: "World news network",
      image: "/images/FeaturedIn/WNN.png",
      url: "https://www.worldnewsnetwork.net/news/zymo-the-leading-self-drive-car-rental-service-in-india20230413132853/",
    },
    {
      id: 2,
      name: "Business Standard",
      image: "/images/FeaturedIn/BS.png",
      url: "https://www.business-standard.com/content/press-releases-ani/zymo-the-leading-self-drive-car-rental-service-in-india-123041300540_1.html",
    },
    {
      id: 3,
      name: "The Print",
      image: "/images/FeaturedIn/TP.png",
      url: "https://theprint.in/ani-press-releases/zymo-the-leading-self-drive-car-rental-service-in-india/1515953/",
    },
    {
      id: 4,
      name: "Lokmat Times",
      image: "/images/FeaturedIn/LT.png",
      url: "https://www.lokmattimes.com/business/zymo-the-leading-self-drive-car-rental-service-in-india/",
    },
    {
      id: 5,
      name: "British News Network",
      image: "/images/FeaturedIn/BNN.png",
      url: "https://www.britishnewsnetwork.com/news/zymo-the-leading-self-drive-car-rental-service-in-india20230413132853/",
    },
    {
      id: 6,
      name: "Big News Network",
      image: "/images/FeaturedIn/BINN.png",
      url: "https://www.bignewsnetwork.com/news/273738851/zymo-the-leading-self-drive-car-rental-service-in-india",
    },
    {
      id: 7,
      name: "UP42 News",
      image: "/images/FeaturedIn/UPN.png",
      url: "https://up42news.com/news/27691",
    },
    {
      id: 8,
      name: "France Network Times",
      image: "/images/FeaturedIn/FNT.png",
      url: "https://www.francenetworktimes.com/news/zymo-the-leading-self-drive-car-rental-service-in-india20230413132853/",
    },
    {
      id: 9,
      name: "Indian News Network",
      image: "/images/FeaturedIn/INDNN.png",
      url: "https://www.indiannewsnetwork.net/news/zymo-the-leading-self-drive-car-rental-service-in-india20230413132853/",
    },
    {
      id: 10,
      name: "ZEE5",
      image: "/images/FeaturedIn/ZEE5.png",
      url: "https://www.zee5.com/articles/zymo-the-leading-self-drive-car-rental-service-in-india",
    },
    {
      id: 11,
      name: "ANI News",
      image: "/images/FeaturedIn/ANI.png",
      url: "https://aninews.in/news/business/business/zymo-the-leading-self-drive-car-rental-service-in-india20230413132856/",
    },
    { id: 12, name: "MD", image: "/images/FeaturedIn/MD.png", url: "public/images/FeaturedIn/" },
  ];
  
  const scrollRef = useRef(null);
  const scrollAmountRef = useRef(0);


useEffect(() => {
  const scrollContainer = scrollRef.current;
  
  // Initialize scroll position to the maximum (right edge)
  if (scrollContainer) {
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    scrollAmountRef.current = maxScroll;
    scrollContainer.scrollLeft = maxScroll;
  }

  const scrollInterval = setInterval(() => {
    if (scrollContainer) {
      // Decrement to scroll left (opposite of original)
      scrollAmountRef.current -= 1;
      scrollContainer.scrollLeft = scrollAmountRef.current;

      // Reset when we reach the left edge
      if (scrollAmountRef.current <= 0) {
        // Reset to right edge
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        scrollAmountRef.current = maxScroll;
        scrollContainer.scrollLeft = maxScroll;
      }
    }
  }, 20); 

  return () => clearInterval(scrollInterval);
}, []);

return (
  <div className="text-white py-10">
    <h2 className="text-center text-xl font-bold mb-16">
      Featured In
    </h2>
    
    <div
      ref={scrollRef}
      className="flex space-x-10 md:space-x-16 overflow-hidden whitespace-nowrap scroll-container"
      style={{
                        maskImage:
                            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                        WebkitMaskImage:
                            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                    }}
    >
      {[...Featured, ...Featured].map((featured, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center flex-shrink-0 w-32 h-36"
        >
          <a href={featured.url} target="_blank">
            <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-white rounded-lg hover:scale-105 transition-all duration-300">
              <img
                src={featured.image}
                alt={featured.name}
                className="w-full h-full object-contain"
              />
            </div>
          </a>
          <span className="text-sm mt-4">{featured.name}</span>
        </div>
      ))}
    </div>
  </div>
);

};

export default FeaturedIn;
