import React, { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";

const testimonials = [
    {
        quote: "Great app to compare best deals. It makes my renting experience so hassle-free and the best part is I got rewards too. Easy to use and one-stop destination for my renting needs.",
        name: "Anusha Dubey",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://zymo.app/F1.webp",
    },
    {
        quote: "I just booked my car through this app and found it really useful. This app allows you to plan small distance trips with reasonable rates. Also, the support is very authentic and supportive.",
        name: "Shrivardhan",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://zymo.app/M2.webp",
    },
    {
        quote: "Amazing app and best platform for rental car requirements.. thank you",
        name: "Vinayak More",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://zymo.app/M1.webp",
    },
    {
        quote: "I found this app really interesting.t is a one-stop solution for all self driven car, chauffer driven car related problems. And even the app is very very easy to use. It surely is recommendable and keep booking and enjoy your trip with Zymo",
        name: "Sneha Modi",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://static-00.iconduck.com/assets.00/s-letter-icon-256x256-qjq4mrpf.png",
    },
    {
        quote: "Zymo Seamless Flow delivers a flawless car rental experience with its intuitive interface. The app's smooth interaction and seamless booking process make it a standout choice. Easy navigation and efficient layout ensure a hassle-free reservation. Highly recommended for a stress-free car rental experience.",
        name: "Dipanshu Ghime",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwbouyBjGtlbURkWpUYSauCpRfwGo9o2sZog&s",
    },
    {
        quote: "Perfect alternative to all high charging rental services! Overall seemless booking process.",
        name: "Sai Tours",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgxpCwu-Z30HrRTsRolGwn3tDgiR4by04WXg&s",
    },
    {
        quote: "Very convenient to use. I use this app for all my renting requirements. I can easily compare prices for different websites and do not have to waste time searching here and there. Best offers and best deals! Highly recommended",
        name: "Pakhi Khurana",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCcqzI2tjnmZ7_cH1tP08TCNR0hIY41k40Iw&s",
    },
    {
        quote: "This app is a great initiative, it helps people compare the prices and helps us fond the best deal. I would like to specially thank Ms. Tanya and Ms. Divya for the customer service they provided me and helped me with the technical pricing issue I was facing. Kudos to both of them",
        name: "Sidharth Nair",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgxpCwu-Z30HrRTsRolGwn3tDgiR4by04WXg&s",
    },
    {
        quote: "I just booked my car through this app and found it really useful. This app allows you to plan small distance trips with reasonable rates. Also the support is very authentic and supportive.",
        name: "Shrivardhan Suryawanshi",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://static-00.iconduck.com/assets.00/s-letter-icon-256x256-qjq4mrpf.png",
    },
    {
        quote: "This app is very usefull to check different types of cars and there prices in one platform we can see many vendors this make easy to book a car and make a correct decision by choosing the right car for right price.",
        name: "Samreen Sabha",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgxpCwu-Z30HrRTsRolGwn3tDgiR4by04WXg&s",
    },
    {
        quote: "It is an amazing app with so many rental options! 🤩 I booked a car rental from this company and the user experience is so clean, smooth and easy to understand! 🔥 Keep up with the good work! 💯",
        name: "Ankita Sahu",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYUcqSDPjfLiidpgxHzfqsGAGGI63weW94sA&s",
    },
    {
        quote: "It is the best Self Drive Car Rental comparison platform. Very easy to compare and book. I really enjoyed their services, highly recommend it.",
        name: "Vishakha Nilakhe",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk6uqwIlrT4zLzlOLsVwiG9eDVqStk3SC4sg&s",
    },
    {
        quote: "Easy and convenient way to pay the rent. Received the reward points instantly after the payment. Looking forward to redeem them.",
        name: "Rishi Varma",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQolIn732R3HcP0vjP5dCitwPmlUYADCBAhWA&s",
    },
    {
        quote: "Zymo is a great app for car rental and the best part is it has multiple options including various vendors. The Interactive UI provides a seamless experience.",
        name: "Rohit Parkhe",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQolIn732R3HcP0vjP5dCitwPmlUYADCBAhWA&s",
    },
    {
        quote: "Perfect platform to compare Rental service, it's saves time as well as money. Rewards are good, can be better though.",
        name: "Gautam Menon",
        stars: "⭐⭐⭐⭐⭐",
        imgSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Eo_circle_pink_letter-g.svg/2048px-Eo_circle_pink_letter-g.svg.png",
    },
];

const Reviews = () => {
    // const scrollRef = useRef(null);
    // const scrollAmountRef = useRef(0);

    // const [isPaused, setIsPaused] = useState(false);

    // useEffect(() => {
    //     const scrollContainer = scrollRef.current;

    //     const scrollInterval = setInterval(() => {
    //         if (!isPaused && scrollContainer) {
    //             scrollAmountRef.current += 1;
    //             scrollContainer.scrollLeft = scrollAmountRef.current;

    //             if (scrollAmountRef.current >= scrollContainer.scrollWidth / 2) {
    //                 scrollAmountRef.current = 0; 
    //                 scrollContainer.scrollLeft = 0;
    //             }
    //         }
    //     }, 15); 

    //     return () => clearInterval(scrollInterval);
    // }, [isPaused]);

    return (
        <section className="text-white py-12">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Our Customers Love Us</h2>
                <p className="text-gray-400">We love hearing from happy customers</p>
            </div>
            <div className="bg-transparent rounded-3xl p-6 py-8 mx-auto max-w-7xl overflow-hidden">
                <div 
                    className="flex space-x-6 overflow-hidden  scroll-container"
                    style={{
                        maskImage:
                            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                        WebkitMaskImage:
                            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                    }}
                >
                <Marquee
                    autoFill
                    pauseOnClick
                    pauseOnHover
                >
                    <div className="flex space-x-6 mr-6">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="relative flex flex-col w-[300px] md:w-[350px] p-6 rounded-3xl text-center flex-shrink-0
             border-2 border-[#faffa4]/30
             bg-gradient-to-br from-[#424242]/50 via-white/10 to-[#faffa4]/30"
                        >
                            <span className="absolute top-6 left-6 w-7 h-7 md:w-8 md:h-8">
                                <img src="/images/quotes.png"/>
                            </span>
                            <p className="text-xs font-merriweather italic text-left md:text-sm mb-4 mt-8">{testimonial.quote}</p>
                            <div className="flex items-center gap-3 mt-auto">
                                <img src={testimonial.imgSrc} alt={testimonial.name} className="w-9 h-9 md:w-10 md:h-10 rounded-full" />
                                <div className="text-left">
                                    <p className="font-semibold font-merriweather text-sm md:text-base">{testimonial.name}</p>
                                    <p className="text-xs md:text-sm">{testimonial.stars}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </Marquee>
                    
                </div>
            </div>
        </section>
    );
};

export default Reviews;
