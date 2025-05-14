import { FaUser, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { FaCar } from "react-icons/fa6";
import { ArrowLeft } from "lucide-react";
import { appAuth } from "../utils/firebase";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import ReactGA from "react-ga4";
import NavBar from "./NavBar";
import Footer from "./Footer";
import LoginPage from "./LoginPage";
import { MdDiscount } from "react-icons/md";

function UserNavigation(label) {
  ReactGA.event({
    category: "User Interaction",
    action: "User Dashboard",
    label: label,
  });
}
import { useEffect, useState } from "react";

const Profile = ({ title }) => {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const user = appAuth.currentUser;

  const handleLogout = () => {
    if (user) {
      appAuth
        .signOut()
        .then(() => {
          toast.success("Logged Out...", {
            position: "top-center",
            autoClose: 3000,
          });
          navigate("/");
        })
        .catch((error) => {
          console.error(error);
          toast.error(error.message || "Something went wrong...", {
            position: "top-center",
            autoClose: 5000,
          });
        });

      UserNavigation("Account Logout");
    } else {
      toast.error("Not signed in..", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  useEffect(() => {
    if (authUser) {
      navigate("/your-details");
      UserNavigation("User Details");
    }
  });
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content="Access your Zymo account, update personal details, manage bookings, and enjoy a seamless car rental experience."
        />
        <link rel="canonical" href="https://zymo.app/profile" />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content="Access your Zymo account, update personal details, manage bookings, and enjoy a seamless car rental experience."
        />
      </Helmet>
      <NavBar />
      <LoginPage
        onAuth={setAuthUser}
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <button
        onClick={() => navigate("/")}
        className="text-white m-5 cursor-pointer"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="min-h-screen bg-[#212121] p-4">
        <div className="max-w-md mx-auto bg-[#424242] shadow-lg rounded-lg p-4">
          <h1 className="text-xl font-semibold mb-4 text-white">Profile</h1>

          {authUser || user ? (
            <>
              {/* Your Details Section */}
              <Link
                to="/your-details"
                onClick={() => UserNavigation("User Details")}
              >
                <div className="bg-gray-50 p-3 rounded-lg mb-3 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-gray-700 text-lg" />
                    <span className="text-gray-800 font-medium">
                      Your Details
                    </span>
                  </div>
                </div>
              </Link>
              {/* Your Bookings Section */}
              <Link
                to="/my-bookings"
                onClick={() => UserNavigation("My Bookings")}
              >
                <div className="bg-gray-50 p-3 rounded-lg mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaCar className="text-gray-700 text-lg" />
                    <span className="text-gray-800 font-medium">
                      Your Bookings
                    </span>
                  </div>
                </div>
              </Link>
                <Link
                to="/your-vouchers"
                onClick={() => UserNavigation("Your Vouchers")}
              >
                <div className="bg-gray-50 p-3 rounded-lg mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MdDiscount className="text-gray-700 text-lg" />
                    <span className="text-gray-800 font-medium">
                      Your Vouchers
                    </span>
                  </div>
                </div>
              </Link>
              {/* Horizontal Line */}
              <hr className="border-gray-600 my-3" />
              <div
                className="bg-red-100 p-3 rounded-lg flex items-center text-red-600 cursor-pointer"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="text-lg mr-3" />
                <span className="font-medium">Log Out</span>
              </div>
            </>
          ) : (
            <div
              className="bg-green-100 p-3 rounded-lg flex items-center text-green-600 cursor-pointer"
              onClick={handleLogin}
            >
              <FaSignInAlt className="text-lg mr-3" />
              <span className="font-medium">Log In</span>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
