import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import useTrackEvent from "../hooks/useTrackEvent";

const Footer = () => {
  const trackEvent = useTrackEvent();

  const handleFooterClicks = (label) => {
    trackEvent("Foooter new Section", "Footer Link Clicked", label);
  };
  const handleWhatsappClicks = (label) => {
    trackEvent("Whatsapp Icon", "Icon Clicks", label);
  };

  return (
    <div className="text-white p-8 flex flex-row justify-between text-left gap-4 flex-wrap">
      {/* Contact Section */}
      <div className="flex flex-col gap-2 min-w-[100px]">
        <div className="font-bold text-lg mb-2 text-[#faffa4]">
          <a href="https://www.zymo.app">Zymo</a>
          </div>
        <p>Contact:</p>
        <p>
          Email:{" "}
          <a
            href="mailto:hello@zymo.app"
            className="hover:text-[#faffa4]"
            onClick={() => handleFooterClicks("Email")}
          >
            hello@zymo.app
          </a>
        </p>
        <p>
          Phone:{" "}
          <a
            href="tel:9987933348"
            className="hover:text-[#faffa4]"
            onClick={() => handleFooterClicks("Phone No.")}
          >
            +91 9987933348
          </a>
        </p>
      </div>

      {/* About Section */}
      <div className="flex flex-col gap-2 min-w-[100px]">
        <div className="font-bold text-lg mb-2">About</div>
        <Link
          to="/about-us"
          className="hover:text-[#faffa4]"
          onClick={() => handleFooterClicks("About Us")}
        >
          About Us
        </Link>
        <Link
          to="/contact-us"
          className="hover:text-[#faffa4]"
          onClick={() => handleFooterClicks("Contact Us")}
        >
          Contact Us
        </Link>
        <Link
          to="/career"
          className="hover:text-[#faffa4]"
          onClick={() => handleFooterClicks("Career")}
        >
          Career
        </Link>
        <Link
          to="/agent-login"
          className="hover:text-[#faffa4]"
          onClick={() => handleFooterClicks("Agent-Panel")}
        >
          Agent-Panel
        </Link>
      </div>

      {/* Features Section */}
      <div className="flex flex-col gap-2 min-w-[100px]">
        <div className="font-bold text-lg mb-2">Features</div>
        <Link
          to="/blogs"
          className="hover:text-[#faffa4]"
          onClick={() => handleFooterClicks("Blogs")}
        >
          Blogs
        </Link>
        <Link
          to="/privacy-policy"
          className="hover:text-[#faffa4]"
          onClick={() => handleFooterClicks("Privacy Policy")}
        >
          Privacy Policy
        </Link>
        <Link
          to="/terms-of-service"
          className="hover:text-[#faffa4]"
          onClick={() => handleFooterClicks("Terms of Service")}
        >
          Terms of Service
        </Link>
        <Link
          to="/cancellation-policy"
          className="hover:text-[#faffa4]"
          onClick={() => handleFooterClicks("Cancellation Policy")}
        >
          Cancellation Policy
        </Link>
        <a
          href="https://partner.zymo.app/"
          className="hover:text-[#faffa4]"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleFooterClicks("Partner with us")}
        >
          Partner with us
        </a>
      </div>

      {/* Install App Section */}
      <div className="flex flex-col gap-2">
        <div className="font-bold text-lg mb-2">Install App</div>
        <p>From App Store or Google Play</p>
        <div className="flex gap-4 mt-2">
          <a
            href="https://play.google.com/store/apps/details?id=com.letzrent.letzrentnew&referrer=utm_source%3Dplaystore%26utm_medium%3Dreferral%26utm_campaign%3Dapp_launch"
            target="_blank"
            onClick={() => handleFooterClicks("Play store")}
          >
            <img
              src="/images/Footer/gplay.png"
              alt="Google Play"
              className="w-32 h-10 "
            />
          </a>
          <a
            href="https://apps.apple.com/in/app/zymo-self-drive-car-rental/id1547829759?utm_source=apple_ios&utm_medium=referral&utm_campaign=app_launch"
            target="_blank"
            onClick={() => handleFooterClicks("Apple store")}
          >
            <img
              src="/images/Footer/istore.png"
              alt="App Store"
              className="w-32 h-10"
            />
          </a>
        </div>
        <p>Secured Payment Gateway</p>
        <div className="flex gap-4 mt-2">
          <img src="/images/Footer/visa.jpg" alt="Visa" className="w-10 h-6" />
          <img
            src="/images/Footer/mcrd.jpg"
            alt="Mastercard"
            className="w-10 h-6"
          />
          <img
            src="/images/Footer/msto.jpg"
            alt="Maestro"
            className="w-10 h-6"
          />
        </div>
      </div>

      {/* Social Media Section */}
      <div className="w-full text-center mt-6">
        <div className="font-bold text-lg mb-2">Follow Us</div>
        <div className="flex justify-center gap-6">
          <a
            href="https://www.facebook.com/zymo.official/"
            target="_blank"
            className="text-[#faffa4] hover:text-[#faffa4]"
            onClick={() => handleFooterClicks("Facebook")}
          >
            <Facebook size={30} />
          </a>
          <a
            href="https://x.com/zymoapp"
            target="_blank"
            className="text-[#faffa4] hover:text-[#faffa4]"
            onClick={() => handleFooterClicks("Twitter / X")}
          >
            <Twitter size={30} />
          </a>
          <a
            href="https://www.instagram.com/zymo.app/"
            target="_blank"
            className="text-[#faffa4] hover:text-[#faffa4]"
            onClick={() => handleFooterClicks("Instgram")}
          >
            <Instagram size={30} />
          </a>
          <a
            href="https://www.linkedin.com/company/zymoapp?originalSubdomain=in"
            target="_blank"
            className="text-[#faffa4] hover:text-[#faffa4]"
            onClick={() => handleFooterClicks("Linkedin")}
          >
            <Linkedin size={30} />
          </a>
          <a
            href="https://www.youtube.com/channel/UCHUvrPwNYxw7bukWFjhNpag"
            target="_blank"
            className="text-[#faffa4] hover:text-[#faffa4]"
            onClick={() => handleFooterClicks("Youtube")}
          >
            <Youtube size={30} />
          </a>
          {/* WhatsApp Floating Button */}
          <a
              href="https://wa.me/919987933348"
              className=" text-[#faffa4] shadow-lg hover:text-[#faffa4] transition duration-300"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleWhatsappClicks("Whatsapp Icon")}
          >
              {/* <FaWhatsapp className="text-3xl" size={30}/> */}
              <FaWhatsapp size={30}/>
          </a>
          {/* Copyright Section */}
        </div>
      </div>
      <div className="w-full text-center mt-4 text-gray-400 text-sm">
        &copy; ZEP TEPI TECHNOLOGIES PVT LTD
      </div>
    </div>
  );
};

export default Footer;
