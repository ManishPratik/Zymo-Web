import { useEffect, useState } from "react";
import Cookies from "js-cookie";

// This function will be used throughout your app to try to store cookies
export const setBookingCookies = (location, startDate, endDate, place) => {
  const hasConsented = Cookies.get("cookiesConsent") === "true";
  console.log('Setting cookies with consent:', hasConsented);

  if (hasConsented) {
    // Set expiration to 7 days from now
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    const cookieOptions = {
      expires: expirationDate,
      path: '/',
      sameSite: 'lax',
      secure: window.location.protocol === 'https:'
    };

    // Store basic info with proper options
    Cookies.set("location", location, cookieOptions);
    Cookies.set("startDate", startDate, cookieOptions);
    Cookies.set("endDate", endDate, cookieOptions);
    
    // Store place details with same options
    if (place) {
      const placeData = {
        name: place.name,
        lat: place.lat,
        lng: place.lng,
        addressComponents: place.addressComponents
      };
      Cookies.set("placeDetails", JSON.stringify(placeData), cookieOptions);
    }

    console.log('Cookies set with options:', {
      location,
      startDate,
      endDate,
      placeDetails: place ? 'present' : 'missing',
      options: cookieOptions
    });
  }
};

export const getBookingCookies = () => {
  const hasConsented = Cookies.get("cookiesConsent") === "true";
  console.log('Cookie consent status:', hasConsented);

  if (!hasConsented) {
    console.log('No cookie consent, returning empty values');
    return {
      location: false,
      startDate: false,
      endDate: false,
      placeDetails: false
    };
  }
  
  const location = Cookies.get("location");
  const startDate = Cookies.get("startDate");
  const endDate = Cookies.get("endDate");
  const placeDetails = Cookies.get("placeDetails");

  console.log('Retrieved cookies:', {
    location,
    startDate,
    endDate,
    placeDetails: placeDetails ? 'present' : 'missing'
  });

  return {
    location: location || false,
    startDate: startDate || false,
    endDate: endDate || false,
    placeDetails: placeDetails ? JSON.parse(placeDetails) : false
  };
};

const CookiesConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!Cookies.get("cookiesConsent")) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    Cookies.set("cookiesConsent", "true", { expires: 365 });
    setShowBanner(false);
  };

  const rejectCookies = () => {
    Cookies.set("cookiesConsent", "false", { expires: 365 });
    setShowBanner(false);
  };

  return (
    <div
      className={`fixed z-50 bottom-10 left-10 max-w-lg max-h-screen bg-[#303030] text-white p-4 ${
        showBanner ? "block" : "hidden"
      }`}
    >
      <div className="flex gap-3">
        <svg
          width="26"
          height="32"
          viewBox="0 0 298 301"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M297.406 178.115C297.742 166.884 288.962 161.3 276.686 157.714C269.414 155.589 260.943 154.001 253.689 151.113C247.66 148.716 242.431 145.493 240.415 139.492C238.59 134.044 239.979 128.506 241.114 123.067C242.612 115.876 243.765 108.831 241.105 102.258C238.962 96.9735 234.323 92.5878 228.966 88.3115C222.665 83.2816 215.147 78.4062 212.46 70.4074C210.971 65.9767 212.405 61.1285 214.421 56.271C216.899 50.3241 220.431 44.4222 222.828 39.129C227.259 29.3597 227.595 21.27 219.369 16.4489C202.118 6.33458 157.375 -8.24663 106.54 8.87693C29.4663 34.8346 -12.5617 110.084 4.19864 189.664C19.2067 260.955 98.9049 321.341 197.243 294.466C270.849 274.355 296.707 201.567 297.406 178.115ZM287.954 177.843C287.309 199.57 262.968 266.702 194.755 285.342C102.564 310.528 27.5233 254.535 13.4504 187.712C-2.29311 112.944 37.1475 42.2251 109.555 17.8381C156.876 1.90391 198.532 15.1962 214.584 24.6114C216.237 25.5738 216.627 26.9811 216.409 28.6335C216.146 30.64 215.292 32.8463 214.221 35.216C211.252 41.7622 206.64 49.2344 204.225 56.5614C202.3 62.3631 201.71 68.1192 203.498 73.4215C206.268 81.6837 212.832 87.5943 219.523 92.9057C224.807 97.0912 230.273 100.714 232.334 105.807C234.295 110.656 232.961 115.84 231.853 121.142C230.382 128.206 229.075 135.424 231.454 142.506C233.923 149.86 239.343 154.736 246.271 158.168C252.309 161.155 259.536 163.016 266.482 164.778C272.655 166.348 278.603 167.792 282.933 170.234C285.957 171.941 288.063 174.166 287.954 177.843ZM177.659 203.31C161.162 203.31 147.752 216.729 147.752 233.254C147.752 249.778 161.162 263.197 177.659 263.197C194.165 263.197 207.575 249.778 207.575 233.254C207.575 216.729 194.165 203.31 177.659 203.31ZM177.659 212.771C188.953 212.771 198.114 221.95 198.114 233.254C198.114 244.557 188.953 253.736 177.659 253.736C166.373 253.736 157.212 244.557 157.212 233.254C157.212 221.95 166.373 212.771 177.659 212.771ZM87.9734 148.562C70.2687 148.562 55.8961 162.944 55.8961 180.666C55.8961 198.389 70.2687 212.771 87.9734 212.771C105.669 212.771 120.042 198.389 120.042 180.666C120.042 162.944 105.669 148.562 87.9734 148.562ZM87.9734 158.013C100.457 158.013 110.59 168.164 110.59 180.666C110.59 193.169 100.457 203.31 87.9734 203.31C75.4893 203.31 65.3569 193.169 65.3569 180.666C65.3569 168.164 75.4893 158.013 87.9734 158.013ZM177.731 113.307C161.189 113.307 147.752 126.753 147.752 143.314C147.752 159.875 161.189 173.321 177.731 173.321C194.265 173.321 207.702 159.875 207.702 143.314C207.702 126.753 194.265 113.307 177.731 113.307ZM177.731 122.768C189.053 122.768 198.241 131.974 198.241 143.314C198.241 154.654 189.053 163.861 177.731 163.861C166.4 163.861 157.212 154.654 157.212 143.314C157.212 131.974 166.4 122.768 177.731 122.768ZM113.15 51.2047C96.6713 51.2047 83.2431 64.7689 83.2431 81.5384C83.2431 98.2988 96.6713 111.864 113.15 111.864C129.638 111.864 143.057 98.2988 143.057 81.5384C143.057 64.7689 129.638 51.2047 113.15 51.2047ZM113.15 60.656C124.463 60.656 133.606 70.0349 133.606 81.5384C133.606 93.0328 124.463 102.412 113.15 102.412C101.847 102.412 92.7036 93.0328 92.7036 81.5384C92.7036 70.0349 101.847 60.656 113.15 60.656Z"
            fill="#faffa4"
          />
        </svg>

        <h2 className="text-xl font-bold text-[#faffa4] mb-2">
          Cookies Consent
        </h2>
      </div>
      <p>
        We use cookies to enhance your browsing experience, serve personalised
        ads or content, and analyse our traffic. By clicking "Accept", you
        consent to our use of cookies.
      </p>
      <div className="flex flex-row gap-4 mt-5">
        <button
          onClick={acceptCookies}
          className="bg-[#faffa4] text-black px-4 py-2 hover:bg-[#f8fad2] hover:text-black/70 transition duration-300"
        >
          Accept
        </button>
        <button
          onClick={rejectCookies}
          className="bg-transparent border-2 border-[#faffa4] text-[#faffa4] px-4 py-2"
        >
          Reject
        </button>
      </div>
    </div>
  );
};


export default CookiesConsent;