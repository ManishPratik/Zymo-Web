import { useEffect, useRef } from "react";

const BrandsAvailable = () => {
    const brands = [
        { name: "Kia", logo: "/images/CarLogos/Kia.png" },
        { name: "Toyota", logo: "/images/CarLogos/toyota.png" },
        { name: "Mahindra", logo: "/images/CarLogos/mahindraa.png" },
        { name: "MG", logo: "/images/CarLogos/mg.png" },
        { name: "Tata", logo: "/images/CarLogos/tata.png" },
        { name: "Honda", logo: "/images/CarLogos/honda.png" },
        { name: "BMW", logo: "/images/CarLogos/bmw.png" },
        { name: "Mercedes-Benz", logo: "/images/CarLogos/mbenz.png" },
        { name: "Maruti", logo: "/images/CarLogos/suzuki.png" },
        { name: "Audi", logo: "/images/CarLogos/audi.png" },
    ];

    const scrollRef = useRef(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        let currentScroll = 0;

        const scrollInterval = setInterval(() => {
            
            if (scrollContainer) {

                const itemWidth = scrollContainer.querySelector("div")?.offsetWidth || 0;
            const scrollBy = itemWidth * 2.4;
            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

                currentScroll+=scrollBy;
                // scrollContainer.scrollLeft = scrollAmount;

                // if (scrollAmount >= scrollContainer.scrollWidth / 2) {
                //     scrollAmount = 0; // Reset scroll
                // }
                if (currentScroll > maxScroll) {
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
                Brands Available
            </h2>
            <div className="bg-darkGrey2 rounded-lg p-6 py-8 mx-auto max-w-4xl overflow-hidden">
                <div
                   ref={scrollRef}
                    className="flex space-x-6 overflow-hidden whitespace-nowrap scroll-container"
                >
                    {[...brands, ...brands].map((brand, index) => (
                        <div
                            key={index}
                            
                            className="flex flex-col items-center flex-shrink-0 w-1/4 px-4 justify-center"
                        >
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="w-18 h-18"
                            />
                            <span className="text-sm mt-2">{brand.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BrandsAvailable;
