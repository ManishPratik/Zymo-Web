import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { webDB, webStorage } from "../utils/firebase";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

const CareerForm = ({ title }) => {
  const [selectedType, setSelectedType] = useState("Internship");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    city: "",
    phoneNumber: "",
    aspirations: "",
    primarySkill: "",
    skillsDescription: "",
    resume: null,
    expectedStipend: "",
    experience: "",
    stipendAmount: "",
    applyFor: "",
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_FUNCTIONS_API_URL;

  // Set document title
  useEffect(() => {
    document.title = title;
  }, [title]);

  // Reset hasSubmitted after 5 seconds
  useEffect(() => {
    if (hasSubmitted) {
      const timer = setTimeout(() => setHasSubmitted(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [hasSubmitted]);

  // Handle input changes, restricting phoneNumber to exactly 10 digits
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const numericValue = value.replace(/\D/g, ""); // Remove non-digits
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle file upload with size validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload only PDF files");
        e.target.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("File size exceeds 5MB. Please upload a smaller file.");
        e.target.value = null;
        return;
      }
      setFormData({ ...formData, resume: file });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Early validation
      if (
        !formData.fullName ||
        !formData.email ||
        !formData.city ||
        !formData.phoneNumber ||
        !formData.aspirations ||
        !formData.primarySkill ||
        !formData.skillsDescription ||
        !formData.resume ||
        !formData.expectedStipend ||
        !formData.applyFor
      ) {
        alert("All fields are required!");
        setIsSubmitting(false);
        return;
      }

      // Validate phone number length (exactly 10 digits for Indian numbers)
      if (formData.phoneNumber.length !== 10) {
        alert("Phone number must be exactly 10 digits.");
        setIsSubmitting(false);
        return;
      }

      // Check if email already exists to prevent multiple submissions
      const emailQuery = query(
        collection(webDB, "careerApplications"),
        where("email", "==", formData.email)
      );
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        alert("Form already submitted with this email.");
        setIsSubmitting(false);
        return;
      }

      // Upload resume to Firebase Storage
      let resumeURL = "";
      if (formData.resume) {
        const resumeRef = ref(
          webStorage,
          `resumes/${formData.email}-${Date.now()}.pdf`
        );
        const metadata = {
          contentType: "application/pdf",
          contentDisposition: `inline; filename="${formData.email}-resume.pdf"`,
        };
        await uploadBytes(resumeRef, formData.resume, metadata);
        resumeURL = await getDownloadURL(resumeRef);
      }

      // Prepare application data
      const applicationData = {
        fullName: formData.fullName,
        email: formData.email,
        city: formData.city,
        phoneNumber: formData.phoneNumber,
        aspirations: formData.aspirations,
        primarySkill: formData.primarySkill,
        skillsDescription: formData.skillsDescription,
        resume: resumeURL,
        expectedStipend: formData.expectedStipend,
        jobType: selectedType,
        timestamp: new Date(),
        applyFor: formData.applyFor,
        ...(formData.expectedStipend === "Paid" && {
          experience: formData.experience,
          stipendAmount: formData.stipendAmount,
        }),
      };

      // Submit to Firestore
      await addDoc(collection(webDB, "careerApplications"), applicationData);
      
        try {
        const response = await fetch(`${API_URL}/email/sendEmailOnFormSubmit`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify(formData),
      });

      if (!response.ok) {
      throw new Error('Failed to submit application');
      }

      console.log('Application submitted successfully');
      } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }

      // Reset form after successful submission
      setFormData({
        fullName: "",
        email: "",
        city: "",
        phoneNumber: "",
        aspirations: "",
        primarySkill: "",
        skillsDescription: "",
        resume: null,
        expectedStipend: "",
        experience: "",
        stipendAmount: "",
        applyFor: "",
      });
      localStorage.setItem("careerFormSubmittedEmail", formData.email);
      setHasSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error submitting application: ", error);
      alert("Error submitting application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content="Join Zymo and be part of an innovative team transforming car rentals and sales. Explore open positions today!"
        />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content="Looking for a rewarding career? Check out Zymo's job openings and become part of our growing team."
        />
        <link rel="canonical" href="https://zymo.app/career" />
      </Helmet>
      <NavBar />
      <button
        onClick={() => navigate("/")}
        className="text-white m-5 cursor-pointer"
      >
        {/* Add content if needed */}
      </button>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[darkGrey2] text-white relative">
        {hasSubmitted ? (
          <div className="text-center">
            <div className="text-4xl mb-4 text-[#faffa4]">✓</div>
            <h2 className="text-2xl font-bold mb-4 text-[#faffa4]">
              Form submitted successfully!
            </h2>
            <p className="text-gray-300">Check your email for further details.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#faffa4] mb-6">“Join Us”</h1>
            <p className="text-gray-450 mb-6">Choose your adventure.</p>
            <div className="flex space-x-4">
              <button
                className={`px-6 py-2 text-black font-semibold rounded-lg transition duration-300 ${
                  selectedType === "Internship" ? "bg-[#faffa4]" : "bg-gray-300"
                }`}
                onClick={() => setSelectedType("Internship")}
              >
                Internship
              </button>
              <button
                className={`px-6 py-2 text-black font-semibold rounded-lg transition duration-300 ${
                  selectedType === "Full-time" ? "bg-[#faffa4]" : "bg-gray-300"
                }`}
                onClick={() => setSelectedType("Full-time")}
              >
                Full-time
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="bg-[#363636] shadow-lg rounded-lg p-6 mt-6 w-96 text-black"
            >
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full p-3 mb-4 bg-gray-200 rounded-lg"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 mb-4 bg-gray-200 rounded-lg"
                required
              />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full p-3 mb-4 bg-gray-200 rounded-lg"
                required
              />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number (10 digits)"
                maxLength="10"
                className="w-full p-3 mb-4 bg-gray-200 rounded-lg"
                required
              />
              <input
                type="text"
                name="aspirations"
                value={formData.aspirations}
                onChange={handleChange}
                placeholder="Aspirations"
                className="w-full p-3 mb-4 bg-gray-200 rounded-lg"
                required
              />
              <input
                type="text"
                name="applyFor"
                value={formData.applyFor}
                onChange={handleChange}
                placeholder="Applying For:"
                className="w-full p-3 mb-4 bg-gray-200 rounded-lg"
                required
              />
              <label className="block font-semibold text-gray-100 mb-2">
                Pick your superpower
              </label>
              <select
                name="primarySkill"
                value={formData.primarySkill}
                onChange={handleChange}
                className="w-full p-3 mb-4 bg-gray-200 rounded-lg"
                required
              >
                <option value="">Select Primary Skill</option>
                <option value="Coding">Coding</option>
                <option value="Marketing">Marketing</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Others">Others</option>
              </select>
              <textarea
                name="skillsDescription"
                value={formData.skillsDescription}
                onChange={handleChange}
                placeholder="Tell us why we need you"
                className="w-full p-3 mb-4 bg-gray-200 rounded-lg"
                required
              />
              <label className="block font-semibold text-gray-100 mb-2">
                Upload Your Resume (PDF only, max 5MB)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full p-3 mb-4 bg-gray-200 rounded-lg cursor-pointer"
                required
              />
              <label className="block font-semibold text-gray-100 mb-2">
                Expected Stipend
              </label>
              <select
                name="expectedStipend"
                value={formData.expectedStipend}
                onChange={handleChange}
                className="w-full p-3 mb-4 bg-gray-200 rounded-lg"
                required
              >
                <option value="">Expected Stipend</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
              {formData.expectedStipend === "Paid" && (
                <>
                  <label className="block font-semibold text-gray-100 mb-2">
                    Experience
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full p-3 mb-4 bg-gray-200 rounded-lg"
                    required
                  >
                    <option value="">Select Experience</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6+ months">6+ months</option>
                  </select>
                  <label className="block font-semibold text-gray-100 mb-2">
                    Expected Stipend Amount
                  </label>
                  <input
                    type="text"
                    name="stipendAmount"
                    value={formData.stipendAmount}
                    onChange={handleChange}
                    placeholder="Enter Expected Amount"
                    className="w-full p-3 mb-4 bg-gray-200 rounded-lg"
                    required
                  />
                </>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-[#faffa4] text-black py-3 rounded-lg font-semibold transition duration-300 ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#faffa4]-700"
                }`}
              >
                Submit Application
              </button>
            </form>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CareerForm;