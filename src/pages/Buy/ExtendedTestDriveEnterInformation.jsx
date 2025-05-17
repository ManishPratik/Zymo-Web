import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { countryCodes } from '../../api/CountryCode';
import { Helmet } from "react-helmet-async";
import { useEffect } from 'react';
import useTrackEvent from '../../hooks/useTrackEvent';

export default function Extended_TestDriveFormPage( {title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    countryCode: '+91',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    dob: '',
  });
  const [errors, setErrors] = useState({});
  const trackEvent = useTrackEvent();
  const { car, startDate, endDate } = location.state || {};
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  useEffect(() => {
    document.title = title;
  }, [title]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName) newErrors.userName = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (!formData.dob) newErrors.dob = 'Date of Birth is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCountryCodeSelect = (code) => {
    setFormData((prev) => ({ ...prev, countryCode: code }));
    setShowCountryDropdown(false);
  };

  const handleNext = () => {
    if (validateForm()) {
      // Combine country code and phone for storage/transmission
      const fullPhoneNumber = `${formData.countryCode}${formData.phone}`;
      const dataToStore = {
        ...formData,
        phone: fullPhoneNumber
      };
      
      sessionStorage.setItem('formData', JSON.stringify(dataToStore));
      
      navigate('/buy-car/upload-doc', { 
        state: { 
          car, 
          startDate, 
          endDate, 
          userData: {
            ...formData,
            phone: fullPhoneNumber
          } 
        } 
      });
      trackEvent("Extended Test Drive Booking", "Extended Test Drive","User Details Entered");
    }
  };

  return (
    <>
  <Helmet>
                <title>{title}</title>
                <meta name="description" content="Provide your details to complete your test drive booking with Zymo." />
                <meta property="og:title" content={title} />
        <meta property="og:description" content="Fill in your personal information to complete the test drive booking process." />
                <link rel="canonical" href="https://zymo.app/buy/upload-info" />
            </Helmet>
    <div className="min-h-screen bg-[#212121] text-white px-4 md:px-8">
      <div className="container mx-auto max-w-4xl py-8">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-1 md:left-5 top-8 p-2 text-white/80 hover:text-white hover:bg-[#2A2A2A] bg-transparent transition-all"
        >
          <ArrowLeft size={28} />
        </button>

        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-xl p-2 md:text-4xl font-bold text-appColor">
            Extended Test Drive Booking
          </h1>
        </div>

        <div className="bg-[#2A2A2A] p-5 md:p-8 rounded-xl shadow-xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Name (as on Driving License)</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="w-full p-2 md:p-3 rounded-lg backdrop-blur-md bg-[#424242] text-white border border-white/10 focus:outline-none text-sm md:text-base"
                placeholder="Enter your Name"
              />
              {errors.userName && <p className="text-red-500 text-xs md:text-sm">{errors.userName}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 md:p-3 rounded-lg backdrop-blur-md bg-[#424242] text-white border border-white/10 focus:outline-none text-sm md:text-base"
                placeholder="Enter your Email"
              />
              {errors.email && <p className="text-red-500 text-xs md:text-sm">{errors.email}</p>}
            </div>

            {/* Phone Number Field with Country Code */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Phone Number</label>
              <div className="flex">
                {/* Country Code Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center justify-between p-2 md:p-3 rounded-l-lg bg-[#424242] text-white border border-white/10 border-r-0 focus:outline-none text-sm md:text-base min-w-[80px]"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <span>{formData.countryCode}</span>
                    <ChevronDown size={16} className="ml-1" />
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute z-10 mt-1 w-48 bg-[#333333] border border-white/10 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {countryCodes.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-[#424242] transition-colors"
                          onClick={() => handleCountryCodeSelect(country.code)}
                        >
                          {country.code} {country.country}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Phone Number Input */}
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                  className="w-full p-2 md:p-3 rounded-r-lg backdrop-blur-md bg-[#424242] text-white border border-white/10 focus:outline-none text-sm md:text-base"
                  placeholder="Enter your Phone Number"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs md:text-sm">{errors.phone}</p>}
            </div>

            {/* Date of Birth Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full p-2 md:p-3 rounded-lg backdrop-blur-md bg-[#424242] text-white border border-white/10 focus:outline-none text-sm md:text-base"
              />
              {errors.dob && <p className="text-red-500 text-xs md:text-sm">{errors.dob}</p>}
            </div>

            {/* Street Address Field */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium">Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 md:p-3 rounded-lg backdrop-blur-md bg-[#424242] text-white border border-white/10 focus:outline-none text-sm md:text-base"
                placeholder="Enter your Street Address"
              />
              {errors.address && <p className="text-red-500 text-xs md:text-sm">{errors.address}</p>}
            </div>

            {/* City Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2 md:p-3 rounded-lg backdrop-blur-md bg-[#424242] text-white border border-white/10 focus:outline-none text-sm md:text-base"
                placeholder="Enter your City Name"
              />
              {errors.city && <p className="text-red-500 text-xs md:text-sm">{errors.city}</p>}
            </div>

            {/* Pincode Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength={6}
                className="w-full p-2 md:p-3 rounded-lg backdrop-blur-md bg-[#424242] text-white border border-white/10 focus:outline-none text-sm md:text-base"
                placeholder="Enter your Pincode"
              />
              {errors.pincode && <p className="text-red-500 text-xs md:text-sm">{errors.pincode}</p>}
            </div>
          </div>

          <div className="mt-6 md:mt-8">
            <button
              onClick={handleNext}
              className="w-full p-3 md:p-4 rounded-lg font-semibold text-base md:text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] bg-appColor text-black border"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}