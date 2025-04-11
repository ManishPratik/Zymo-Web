import { useEffect, useRef } from "react";

// Import Images
// import WNN from "public/images/FeaturedIn/WNN.png"; 
// import INDNN from "public/images/FeaturedIn/INDNN.png";
// import BINN from "public/images/FeaturedIn/BINN.png";
// import ANI from "public/images/FeaturedIn/ANI.png";
// import UPN from "public/images/FeaturedIn/UPN.png";
// import TP from "public/images/FeaturedIn/TP.png";
// import MD from "public/images/FeaturedIn/MD.png";
// import LT from "public/images/FeaturedIn/LT.png";
// import ZEE from "public/images/FeaturedIn/ZEE5.png";
// import FNT from "public/images/FeaturedIn/FNT.png";
// import BS from "public/images/FeaturedIn/BS.png";

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

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        let scrollAmount = 0;

        const scrollInterval = setInterval(() => {
            if (scrollContainer) {
                scrollAmount += 1;
                scrollContainer.scrollLeft = scrollAmount;

                if (scrollAmount >= scrollContainer.scrollWidth / 2) {
                    scrollAmount = 0; // Reset scroll
                }
            }
        }, 30); // Adjust speed

        return () => clearInterval(scrollInterval);
    }, []);

    return (
        <div className="text-white py-10">
            <h2 className="text-center text-xl font-bold mb-6">
                Featured In
            </h2>
            <div className="bg-darkGrey2 rounded-lg p-6 py-8 mx-auto max-w-4xl overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex space-x-6 overflow-hidden whitespace-nowrap scroll-container"
                >
                    {[...Featured, ...Featured].map((featured, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-center flex-shrink-0 w-32 h-32"
                        >
                            <div className="w-24 h-24 flex items-center justify-center bg-white rounded-lg">
                                <img
                                    src={featured.image}
                                    alt={featured.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-sm mt-2">{featured.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturedIn;
