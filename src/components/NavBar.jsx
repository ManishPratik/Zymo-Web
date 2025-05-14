import React, { useState, useEffect } from 'react';
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { IoPersonCircleOutline } from "react-icons/io5";
import useTrackEvent from "../hooks/useTrackEvent";
import { FaWhatsapp } from "react-icons/fa";
import chatBotIcon from './Chatbot/images/assistant.png';
import { useNavigate } from 'react-router-dom';
import { appAuth } from "../utils/firebase.js"

const NavBar = ({ city }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);   //Storing user details

    const trackEvent = useTrackEvent();

    // Navigation Links
    const NavBarLinks = [
        { path: "/about-us", label: "About Us" },
        { path: "/blogs", label: "Blogs" },
        { path: "/career", label: "Career" },
        { path: "/contact-us", label: "Contact Us" },
    ];

    // Google Analytics Event Tracking Function
    const handleNavClick = (label) => {
        trackEvent("Navigation Bar", "Navbar Link Clicked", label);

    }
    // Whatsapp Icon Click Tracking
    const handleWhatsappClicks = (label) => {
        trackEvent("Whatsapp Icon", "Icon Clicks", label);
    };

    // CHatbot Icon Event Handling
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage('Ask me!');
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
            }, 1000);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    const handleClick = (e) => {
        e.preventDefault();
        navigate('/ZymoAI');
    };

    //Getting current user profile
    useEffect(() => {
        const unsubscribe = appAuth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);


    return (
        <nav className="bg-[#212121] text-white p-4 relative z-50 w-full">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/" onClick={() => handleNavClick("Home")}>
                    <img
                        src="/images/AppLogo/zymo2.jpg"
                        alt="zymologo"
                        className="h-14 mix-blend-screen"
                    />
                </Link>

                {/* Hamburger Button */}
                <button
                    className="md:hidden z-50"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6 fixed right-4 top-8" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Mobile Menu (Sidebar) */}
                <div
                    className={`fixed top-0 right-0 w-2/3 h-full bg-darkGrey text-[#faffa4] shadow-lg transform ${isOpen ? "translate-x-0" : "translate-x-full"
                        } transition-transform duration-300 ease-in-out md:hidden`}
                >
                    <ul className="mt-16 space-y-6 text-lg px-8">
                        {city && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#505050]"
                                style={{
                                    background: "linear-gradient(to left, #212121, #faffa4)",
                                }}
                            >
                                <svg
                                    className="w-5 h-8 fill-black"
                                    viewBox="0 0 512 512"
                                >
                                    <path d="M256 0C167.6 0 96 71.6 96 160c0 106.1 144.2 239.4 149.8 244.8 5.3 5.1 13.2 5.1 18.4 0C271.8 399.4 416 266.1 416 160 416 71.6 344.4 0 256 0zm0 240c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" />
                                </svg>
                                <span className="text-black font-medium capitalize">{city}</span>
                            </div>
                        )}
                        {NavBarLinks.map(({ path, label }) => (
                            <li key={label} className="hover:text-[#faffa4]">
                                <Link to={path} onClick={() => handleNavClick(label)}>
                                    {label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <a
                                href="https://wa.me/919987933348"
                                className=" text-[#faffa4] shadow-lg hover:text-[#faffa4] transition duration-300"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleWhatsappClicks("Whatsapp Icon")}
                            >
                                {/* <FaWhatsapp className="text-3xl" size={30}/> */}
                                <FaWhatsapp size={24} />
                            </a>
                        </li>
                        <li className="inline-flex gap-2">
                            <button
                                // className="chatbot-toggle-button"
                                className="w-6"
                                onClick={handleClick}
                                aria-label="Toggle chat"
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                <img className="bot-icon max-w-6" style={{ width: '24px' }} src={chatBotIcon} alt="Chatbot icon" />
                            </button>
                            {showMessage && <span className="ask-me-message text-[#faffa4]">Hey👋</span>}
                        </li>
                        <li>
                            <div className="inline-flex gap-2">
                                <Link to="/profile" className="flex items-center gap-2">
                                    {user && user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full border-2 border-[#faffa4]"
                                        />
                                    ) : (
                                        <IoPersonCircleOutline size={28} className="text-[#faffa4]" />
                                    )}
                                    <span className="text-[#faffa4] hidden sm:inline">
                                        {user?.displayName?.split(" ")[0] || "My Profile"}
                                    </span>
                                </Link>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Desktop Menu */}
                <ul className="hidden md:flex items-center space-x-6 text-sm">
                    {NavBarLinks.map(({ path, label }) => (
                        <li key={label} className="hover:text-[#faffa4]">
                            <Link to={path} onClick={() => handleNavClick(label)}>
                                {label}
                            </Link>
                        </li>
                    ))}
                    <li className="text-[#faffa4] cursor-pointer">
                        <Link to="/profile" className="flex items-center gap-2">
                            {user && user.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full border-2 border-[#faffa4]"
                                />
                            ) : (
                                <IoPersonCircleOutline size={28} className="text-[#faffa4]" />
                            )}
                            <span className="text-white hidden sm:inline">
                                {user?.displayName?.split(" ")[0] || "My Profile"}
                            </span>
                        </Link>
                    </li>
                    {city && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#505050]"
                            style={{
                                background: "linear-gradient(to left, #212121, #faffa4)",
                            }}
                        >
                            <svg
                                className="w-5 h-5 fill-black"
                                viewBox="0 0 512 512"
                            >
                                <path d="M256 0C167.6 0 96 71.6 96 160c0 106.1 144.2 239.4 149.8 244.8 5.3 5.1 13.2 5.1 18.4 0C271.8 399.4 416 266.1 416 160 416 71.6 344.4 0 256 0zm0 240c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" />
                            </svg>
                            <span className="text-black font-medium capitalize">{city}</span>
                        </div>
                    )}
                </ul>

            </div>
        </nav>
    );
};

export default NavBar;
