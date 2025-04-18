import React, { useEffect } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import CarAnimation from "../components/CarAnimation";

const AboutUs = ({ title }) => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content="Learn about Zymo's mission to simplify car rentals with reliable, affordable, and convenient self-drive options."
        />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content="Learn about Zymo's mission to simplify car rentals with reliable, affordable, and convenient self-drive options."
        />
        <link rel="canonical" href="https://zymo.app/about-us" />
      </Helmet>

      <NavBar />

      <button
        onClick={() => navigate("/")}
        className="text-white m-5 cursor-pointer flex items-center"
        aria-label="Back to home"
      >
        <ArrowLeft className="w-6 h-6" />
        <span className="sr-only">Back</span>
      </button>

      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl p-8">
          <h1 className="text-2xl font-bold text-yellow-400 mb-6">About Us</h1>
          <CarAnimation width="100%" height="300px" /> {/* Moving Car Component */}
          <hr />
          <br />
          <p className=" mb-4">
                        Welcome to Zymo, India's largest aggregator for
                        self-drive car rentals. With over 30,000 cars listed on
                        our platform, we are the go-to destination for
                        individuals looking for an exceptional self-drive rental
                        experience in over 50 cities. Our goal is to be a
                        lifestyle brand that is trusted by millions of Indians,
                        and we strive to become the most beloved brand in the
                        country.
                    </p>
                    <p className=" mb-4">
                        At Zymo, we understand that building trust is critical
                        to our success. Therefore, we focus on two key areas:
                        transparent pricing and excellent customer service. Our
                        pricing is always upfront, so you never have to worry
                        about hidden fees or surprises. Our commitment to
                        exceptional customer service ensures that every
                        interaction you have with us is pleasant and
                        hassle-free.
                    </p>
                    <p className=" mb-4">
                        Whether you need a self-drive car for a minimum of 8
                        hours or several months, we have you covered. Our vast
                        collection of cars includes hatchbacks, sedans, SUVs,
                        and luxury vehicles. No matter what your needs or
                        preferences are, you can find the perfect car for your
                        next adventure on our platform.
                    </p>
                    <p className=" mb-4">
                        What sets us apart from other rental platforms is our
                        price comparison feature, which allows you to choose
                        from the maximum options at the best prices. Our
                        platform makes it easy to compare rental options, so you
                        can make an informed decision that meets your needs and
                        budget.
                    </p>
                    <p className=" mb-4">
                        We take pride in providing a seamless, stress-free
                        rental experience, from the moment you book your car to
                        the end of your rental period. Our app is the highest
                        rated in the category on both platforms, reflecting our
                        commitment to providing the best service possible.
                    </p>
                    <p className=" mb-4">
                        At Zymo, we are more than just a rental platform. We are
                        your partner in adventure, here to help you explore the
                        beauty of India on your own terms. With our vast
                        collection of cars, transparent pricing, and exceptional
                        customer service, you can trust us to deliver a
                        self-drive rental experience that exceeds your
                        expectations.
                    </p>
                    <p className=" mb-4">
                        Thank you for choosing Zymo. We look forward to serving
                        you soon.
                    </p>
          
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AboutUs;
