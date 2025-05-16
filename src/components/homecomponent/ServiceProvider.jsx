import { useEffect, useRef } from "react";

const ServiceProvider = () => {
    const brands = [
        { name: "Avis", logo: "/images/ServiceProvider/avis.png" },
        // { name: "Carronrent", logo: "/images/ServiceProvider/carronrent.png" },
        // { name: "Doorcars", logo: "/images/ServiceProvider/doorcars.jpeg" },
        // { name: "Rnex", logo: "/images/ServiceProvider/renx.jpeg" },
        // { name: "Wheelup", logo: "/images/ServiceProvider/wheelup.png" },
        { name: "Zoomcars", logo: "/images/ServiceProvider/zoomcar-logo-new.png" },
        { name: "MyChoize", logo: "/images/ServiceProvider/mychoize.png" },
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
    }, [window.innerWidth<= 768]);

    return (
        <div className="text-white py-10">
            <h2 className="text-center text-xl font-bold mb-6">
                Some Notable Service Provider
            </h2>
            <div className="bg-darkGrey2 rounded-lg p-6 py-8 mx-auto max-w-7xl overflow-hidden">
                <div
                    // ref={(window.innerWidth <=768) ? scrollRef : null}
                    ref={scrollRef}
                    className="flex space-x-6 overflow-hidden justify-center whitespace-nowrap scroll-container"
                >
                    {[...brands].map((brand, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-center flex-shrink-0 w-32 h-32"
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
                    <div className="flex flex-col items-center justify-center flex-shrink-0 w-64 h-32">
                        <div className="w-64 flex items-center justify-center">
                            <span className="inline-flex w-64 text-md mt-2">and many more to compare and choose from</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceProvider;
