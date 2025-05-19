import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ErrorPage from "./components/ErrorPage";
import HomeScreen from "./screens/HomeScreen";
import BookingPage from "./screens/BookingPage";
import BookingCard from "./screens/BookingCard";
import Listing from "./screens/Listing";
import { ToastContainer } from "react-toastify";
import Details from "./screens/Details";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import ScrollToTop from "./components/ScrollToTop";
import BlogsMainPage from "./pages/BlogsMainPage";
import BlogDetailPage from "./pages/BlogDetailsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsofService from "./pages/TermsofService";
import CancellationPolicy from "./pages/CancellationPolicy";
import CareerForm from "./pages/Career";
import YourDetails from "./pages/details";
import Profile from "./components/Profile";
import NearestCar from "./pages/Buy/NearestCar";
import CarDetails from "./pages/Buy/CarDetails";
import MyBookings from "./pages/MyBookings";
import CareerPanel from "./pages/CareerPanel.jsx";

import TestDrivePopup from "./components/buycomponent/TestDrivePopup";
import TestDriveInputForm from "./components/buycomponent/TestDriveInputForm";
import TestDriveConfirmPage from "./components/buycomponent/TestDriveConfirmPage";
import ExtendedTestDriveFormPage from "./pages/Buy/ExtendedTestDriveEnterInformation";
import ExtendedTestDriveUploadDocuments from "./pages/Buy/ExtendedTestDriveUploadDocuments";
import ExtendedTestDriveDatePicker from "./pages/Buy/ExtendedTestDriveDatePicker";
import ExtendedTestDriveSummary from "./pages/Buy/ExtendedTestDriveSummary";
import SubscriptionFormPage from "./components/SubscribeInfo";
import SubscriptionUploadDocuments from "./components/SubscribeUploadDocs";
import CreateBlogPage from "./pages/CreateBlog/CreateBlogPage";
import CreateEditBlogPage from "./pages/CreateBlog/createEditBlogPage";
import Agent from "./components/AgentLogin.jsx";
import MasterAgentLogin from "./components/MasterAgentLogin.jsx";
import AgentBookingList from "./components/AgentManagement.jsx";
import PageTracker from "./components/PageTracker.jsx";
import { Navigate } from "react-router-dom";
import CookiesConsent from "./components/CookiesConsent.jsx";
import AgentList from "./components/AgentList.jsx";
import ChatBotModal from "./components/Chatbot/ChatBotModal.jsx";
import AddVoucher from "./components/AddVoucher.jsx";
import CareerLogin from "./pages/careerLogin.jsx";
import HRLogin from "./pages/HRloginPage.jsx";
import CareerAgentList from "./pages/CareerAgentList.jsx";
import VoucherDisplay from "./components/YourVouchers.jsx";
const App = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <PageTracker />
        <CookiesConsent /> {/* Cookie consent component f*/}
        <ScrollToTop /> {/* Ensures scrolling to top on route change */}
        <Routes>
          <Route
            path="/"
            element={
              <HomeScreen
                title="Self Drive Car Hire India – Compare Deals, Lowest Price"
                canonical="/"
              />
            }
          />

          <Route path="/self-drive-car-rentals" element={<Navigate to="/" replace />} />

          <Route
            path="/self-drive-car-rentals/:city"
            element={<HomeScreen key={window.location.pathname} />}
          />

          <Route
            path="/self-drive-car-rentals/:city/cars"
            element={<Listing title="Available Cars - Zymo" />}
          />
          <Route
            path="/self-drive-car-rentals/:city/cars/packages"
            element={<BookingCard title="Car Packages - Zymo" />}
          />
          <Route
            path="/self-drive-car-rentals/:city/cars/booking-details"
            element={<Details title="Booking Details - Zymo" />}
          />
          <Route
            path="/self-drive-car-rentals/:city/cars/booking-details/confirmation"
            element={<BookingPage title="Booking Confirmation - Zymo" />}
          />
          <Route
            path="/subscribe/subscribe-info"
            element={<SubscriptionFormPage title="Subscribe to Zymo" />}
          />
          <Route
            path="/subscribe/upload-doc"
            element={
              <SubscriptionUploadDocuments title="Upload Documents - Subscription" />
            }
          />
          <Route
            path="/buy-car"
            element={<NearestCar title="Find Your Car - Zymo" />}
          />
          <Route
            path="/testdrive"
            element={<TestDrivePopup title="Test Drive - Zymo" />}
          />
          <Route
            path="/buy-car/car-details/:id"
            element={<CarDetails title="Car Details - Zymo" />}
          />
          <Route
            path="/buy-car/summary/:id"
            element={
              <ExtendedTestDriveSummary title="Test Drive Summary - Zymo" />
            }
          />
          <Route
            path="/buy-car/date-picker"
            element={
              <ExtendedTestDriveDatePicker title="Pick a Date - Test Drive" />
            }
          />
          <Route
            path="/buy-car/upload-info"
            element={
              <ExtendedTestDriveFormPage title="Enter Your Info - Test Drive" />
            }
          />
          <Route
            path="/buy-car/upload-doc"
            element={
              <ExtendedTestDriveUploadDocuments title="Upload Documents - Test Drive" />
            }
          />
          <Route
            path="/buy-car/test-drive-inputform"
            element={<TestDriveInputForm title="Schedule Test Drive - Zymo" />}
          />
          <Route
            path="/buy-car/test-drive-confirmpage"
            element={<TestDriveConfirmPage title="Confirm Test Drive - Zymo" />}
          />
          <Route
            path="/about-us"
            element={<AboutUs title="About Us - Zymo" />}
          />
          <Route
            path="/contact-us"
            element={<ContactUs title="Contact Us - Zymo" />}
          />
          <Route
            path="/career"
            element={<CareerForm title="Careers at Zymo" />}
          />
          <Route
            path="/career-login"
            element={<CareerLogin title="Careers at Zymo" />}
          />
          <Route
            path="/career-login/career-panel/HR-login"
            element={<HRLogin title="Careers at Zymo" />}
          />
          <Route
            path="/career-login/career-panel/HR-login/CareerAgent-list"
            element={<CareerAgentList title="Careers at Zymo" />}
          />
          <Route
            path="/career-login/career-panel"
            element={<CareerPanel title="Careers at Zymo" />}
          />
          <Route
            path="/blogs"
            element={
              <BlogsMainPage title="Car Rental Tips & Travel Guides | Zymo Blogs" />
            }
          />
          <Route
            path="/blogs/:title/:id"
            element={<BlogDetailPage title="Blog Details - Zymo" />}
          />
          <Route
            path="/createblog/:id"
            element={<CreateBlogPage title="Edit Blog - Zymo" />}
          />
          <Route
            path="/createblog"
            element={<CreateEditBlogPage title="Create Blog - Zymo" />}
          />
          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy title="Privacy Policy - Zymo" />}
          />
          <Route
            path="/terms-of-service"
            element={<TermsofService title="Terms of Service - Zymo" />}
          />
          <Route
            path="/cancellation-policy"
            element={<CancellationPolicy title="Cancellation Policy - Zymo" />}
          />
          <Route
            path="/my-bookings"
            element={<MyBookings title="My Bookings - Zymo" />}
          />
          <Route
            path="/profile"
            element={<Profile title="Manage Your Bookings" />}
          />
          <Route
            path="/your-details"
            element={<YourDetails title="Your Details - Zymo" />}
          />
          <Route
            path="/your-vouchers"
            element={<VoucherDisplay title="Your Details - Zymo" />}
          />
          <Route
            path="/agent-login"
            element={<Agent title="Agent Login - Zymo" />}
          />
          <Route
            path="/agent-info"
            element={<AgentBookingList title="Agent Management - Zymo" />}
          />
          <Route
            path="/master-agent"
            element={<MasterAgentLogin title="Master Agent Login - Zymo" />}
          />
           <Route
            path="/add-voucher"
            element={<AddVoucher title="add voucher - Zymo" />}
          />
          <Route
            path="/agent-list"
            element={<AgentList title="Agent List - Zymo" />}
          />
          <Route path="/ZymoAI" element={<ChatBotModal />} />
          <Route
            path="*"
            element={<ErrorPage title="404 - Page Not Found" />}
          />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;
