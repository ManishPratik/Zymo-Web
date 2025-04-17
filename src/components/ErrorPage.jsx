import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = ({ title }) => {

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
  content="Oops! The page you're looking for doesn't exist. It might have been moved or deleted. Please check the URL or return to the homepage."
/>
<link rel="canonical" href="https://zymo.app/404" />
<meta
  property="og:title"
  content="Page Not Found | Zymo"
/>
<meta
  property="og:description"
  content="We're sorry, but the page you're trying to reach isn’t available. Try checking the URL or head back to the Zymo homepage."
/>

      </Helmet>


      <div className="flex flex-col items-center justify-center h-screen0 text-white">
        <button
          onClick={() => navigate("/")}
          className="absolute top-5 left-5 p-2 bg-transparent border-none cursor-pointer text-white"
        >
          <ArrowLeft size={30} />
        </button>

        <div className="flex flex-col items-center justify-center text-center">
          <img
            src="/images/404.png"
            alt="error"
            className="w-[300px] md:w-[400px] lg:w-[500px] max-w-full"
          />
          <h1 className="text-2xl md:text-3xl font-bold mt-4">404 - Page Not Found</h1>
        </div>
      </div>
    </>
  );
};

export default ErrorPage;
