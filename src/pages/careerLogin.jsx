import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { appDB } from "../utils/firebase";
import { query, collection, where, getDocs } from "firebase/firestore";
import { Helmet } from "react-helmet-async";

export default function CareerLogin({ onClose, title }) {
  const colorScheme = {
    appColor: "#edff8d", // Light yellow
    darkGrey: "#212121", // Dark background
    darkGrey2: "#424242", // Modal and table background
  };
  
  useEffect(() => {
    document.title = title;
  }, [title]);

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId || !password) {
      setError("Please enter both User ID and Password");
      return;
    }

    setIsLoading(true);

    try {
      // Query Firestore for the user ID
      const q = query(
        collection(appDB, "CareerLogin"),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid User ID or Password");
        return;
      }

      // Get the first matching document
      const agentDoc = querySnapshot.docs[0];
      const agentData = agentDoc.data();

      // Compare plain text password
      const isValid = password === agentData.password;

      if (!isValid) {
        setError("Invalid User ID or Password");
        return;
      }

      // Set authentication flag in localStorage
      localStorage.setItem("isAuthenticated", "true");

      // Successful login - navigate to career panel
      navigate("/career-login/career-panel");
    } catch (error) {
      setError("Login failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content="Login to your Zymo Agent account to manage bookings, customer interactions, and vehicle listings efficiently."
        />
        <link rel="canonical" href="https://zymo.app/career-login" />
        <meta property="og:title" content="Career Login | Zymo" />
        <meta
          property="og:description"
          content="Access the Zymo Agent portal to streamline your operations, manage customers, and monitor car rentals with ease."
        />
      </Helmet>
      <div
        className="fixed inset-0 flex items-center justify-center bg-[#212121] bg-opacity-50 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <div
          className="relative bg-[#1e1e1e] text-white p-8 rounded-2xl shadow-[0_0_15px_rgba(255,255,153,0.4)] w-96 border border-[#faffa4] transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,255,153,0.8)] transform hover:scale-[1.02]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-3 right-3 text-white hover:text-gray-300 transition-all duration-300 transform hover:rotate-180"
            onClick={() => navigate("/")}
          >
            <IoClose size={24} />
          </button>

          <h1 className="text-3xl font-bold mb-6 text-center tracking-wide uppercase text-[#edff8d] animate-pulse">
            Career Agent Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-2 border border-[#faffa4] rounded-lg bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-[#faffa4] transition-all duration-300 hover:border-[#edff8d]"
                disabled={isLoading}
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#faffa4] rounded-lg bg-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-[#faffa4] transition-all duration-300 hover:border-[#edff8d] pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#edff8d] hover:text-white transition-all duration-300"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#ffff99] to-[#ffeb3b] text-darkGrey py-2 rounded-lg font-semibold tracking-wide transform transition hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,153,0.6)] active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Login"}
            </button>

            {error && (
              <p className="mt-4 text-sm text-red-500 text-center animate-bounce">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </>
  );
}