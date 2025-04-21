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
        let scrollAmount = 0;

        const scrollInterval = setInterval(() => {
            if (scrollContainer) {
                scrollAmount += 3; 
                
                if (scrollAmount >= scrollContainer.scrollWidth / 2) {
                    scrollAmount = 0;
                }

                scrollContainer.scrollLeft = scrollAmount;
            }
        }, 30); 

        return () => clearInterval(scrollInterval);
    }, []);

    return (
        <div className="text-white py-10">
            <h2 className="text-center text-xl font-bold mb-6">Brands Available</h2>
            <div className="rounded-lg py-8 mx-auto max-w-full overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex space-x-10 md:space-x-16 overflow-hidden whitespace-nowrap"

                >
                    {[...brands, ...brands].map((brand, index) => (
                        <div key={index} className="flex flex-col justify-between items-center flex-shrink-0 w-24 sm:w-28 md:w-32">
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
