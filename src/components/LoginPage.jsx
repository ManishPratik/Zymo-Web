import { useState } from "react";
import { appAuth } from "../utils/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { BsGoogle } from "react-icons/bs";
import PhoneVerification from "./auth/PhoneVerification";
import PropTypes from "prop-types";

const LoginPage = ({ onAuth, isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  const googleProvider = new GoogleAuthProvider();

  const successMessage = (message) => {
    toast.success(message, {
      position: "top-center",
      autoClose: 1000,
    });
  };

  const errorMessage = (message) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 5000,
    });
  };

  const closePopup = (userData = null) => {
    const user = userData || appAuth.currentUser;
    onAuth(user);
    onClose();
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(appAuth, googleProvider);
      
      // Extract user data for the callback
      const user = result.user;
      const userData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        provider: 'google'
      };
      
      successMessage("Google sign-in successful!");
      closePopup(userData);
    } catch (error) {
      // Handle specific Google Sign-In errors
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, no need to show an error
        console.log("Sign-in popup closed by user");
      } else {
        errorMessage(error.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="relative bg-darkGrey text-white p-8 rounded-2xl shadow-xl w-[400px] border border-[#faffa4]">
        <button
          className="absolute top-3 right-3 text-white hover:text-gray-300"
          onClick={onClose}
        >
          <IoClose size={24} />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-center mb-6">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          
          {/* Phone Verification UI */}
          <div className="mb-4">
            <PhoneVerification 
              onAuth={onAuth}
              isOpen={true}
              onClose={onClose}
              authType={isLogin ? "login" : "signup"}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="mx-2 text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>
          
          {/* Google Sign-In Button */}
          {/* <button
            onClick={handleGoogleLogin}
            className="w-full bg-[#ffffff] text-darkGrey py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200"
          >
            <BsGoogle className="text-lg" />
            <span>Sign in with Google</span>
          </button> */}
          
          <p className="mt-4 text-sm text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              className="text-[#faffa4] font-semibold ml-1"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

LoginPage.propTypes = {
  onAuth: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LoginPage;
