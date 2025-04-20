import { useEffect, useRef } from "react";

const ServiceProvider = () => {
    const brands = [
        { name: "avis", logo: "/images/ServiceProvider/avis.png" },
        { name: "carronrent", logo: "/images/ServiceProvider/carronrent.png" },
        { name: "doorcars", logo: "/images/ServiceProvider/doorcars.jpeg" },
        { name: "rnex", logo: "/images/ServiceProvider/renx.jpeg" },
        { name: "wheelup", logo: "/images/ServiceProvider/wheelup.png" },
        { name: "zoomcars", logo: "/images/ServiceProvider/zoomcars.png" },
    ];

    const scrollRef = useRef(null);
    let currentScroll = 0;
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        // let scrollAmount = 0;

        const scrollInterval = setInterval(() => {
            if (scrollContainer) {
                // scrollAmount += 1;
                // scrollContainer.scrollLeft = scrollAmount;
                const itemWidth = scrollContainer.querySelector("div").offsetWidth || 0;
                const scrollBy = itemWidth * 2.5;
                const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

                currentScroll+=scrollBy;

                // if (scrollAmount >= scrollContainer.scrollWidth / 2) {
                //     scrollAmount = 0; // Reset scroll
                // }
                if(currentScroll >= maxScroll)
                {
                    currentScroll = 0;
                }

                scrollContainer.scrollTo({
                    left: currentScroll,
                    behavior: "smooth"
                });
            }
        }, 3000); // Adjust speed

        return () => clearInterval(scrollInterval);
    }, []);

    return (
        <div className="text-white py-10">
            <h2 className="text-center text-xl font-bold mb-6">
                Service Provider
            </h2>
            <div className="bg-darkGrey2 rounded-lg p-6 py-8 mx-auto max-w-4xl overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex space-x-6 overflow-hidden whitespace-nowrap scroll-container"
                >
                    {[...brands, ...brands].map((brand, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-center flex-shrink-0 w-1/4 h-32"
                        >
                            <div className="w-24 h-24 flex items-center justify-center bg-white rounded-lg">
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-sm mt-2">{brand.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServiceProvider;
