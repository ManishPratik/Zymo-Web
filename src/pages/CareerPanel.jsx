import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter, updateDoc, doc, where } from "firebase/firestore";
import { webDB } from "../utils/firebase";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  Briefcase, 
  FileText,
  Eye,
  User
} from "lucide-react";

// Custom color scheme
const colorScheme = {
  appColor: "#edff8d",
  darkGrey: "#212121",
  darkGrey2: "#424242", 
  black: "#000000",
  white: "#ffffff",
};

const API_URL = import.meta.env.VITE_FUNCTIONS_API_URL;


// Function to send rejection email
const sendRejectionEmail = async (email, fullName, jobType) => {
  try {
    const response =  await fetch(`${API_URL}/email/sendRejectionEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, fullName, jobType }),
    });

    if (!response.ok) {
      console.error('Failed to send rejection email:', await response.text());
    } else {
      console.log('Rejection email sent successfully');
    }
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
};

const CareerPanel = () => {
  const [applications, setApplications] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all", "accepted", "rejected"
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchInitialApplications();
  }, [activeTab]);

  const fetchInitialApplications = async () => {
    setLoading(true);
    setApplications([]); // Reset applications when switching tabs
    let q;
    if (activeTab === "all") {
      q = query(
        collection(webDB, "careerApplications"),
        orderBy("timestamp", "desc"),
        limit(10)
      );
    } else {
      q = query(
        collection(webDB, "careerApplications"),
        where("status", "==", activeTab),
        orderBy("timestamp", "desc"),
        limit(10)
      );
    }
    
    try {
      const snapshot = await getDocs(q);
      const apps = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(), 
        status: doc.data().status || "pending" 
      }));
      setApplications(apps);
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
    setLoading(false);
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    
    let q;
    if (activeTab === "all") {
      q = query(
        collection(webDB, "careerApplications"),
        orderBy("timestamp", "desc"),
        startAfter(lastDoc),
        limit(10)
      );
    } else {
      q = query(
        collection(webDB, "careerApplications"),
        where("status", "==", activeTab),
        orderBy("timestamp", "desc"),
        startAfter(lastDoc),
        limit(10)
      );
    }
    
    try {
      const snapshot = await getDocs(q);
      const newApps = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(), 
        status: doc.data().status || "pending" 
      }));
      setApplications((prev) => [...prev, ...newApps]);
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error("Error loading more applications:", error);
    }
    setLoading(false);
  };

  const updateApplicationStatus = async (id, newStatus) => {
    try {
      const appRef = doc(webDB, "careerApplications", id);
      await updateDoc(appRef, { status: newStatus });
      
      // Update local state and filter based on active tab
      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, status: newStatus } : app
        ).filter(app => 
          activeTab === "all" || app.status === activeTab
        )
      );
      
      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }

      // Send rejection email if status is "rejected"
      if (newStatus === "rejected") {
        const app = applications.find(a => a.id === id);
        if (app) {
          await sendRejectionEmail(app.email, app.fullName, app.jobType);
        }
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const handleViewDetails = (app) => {
    setSelectedApplication(app);
    setShowDetails(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <>
      <Helmet>
        <title>Career Applications Panel</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>
      
      <div className="min-h-screen" style={{ backgroundColor:colorScheme.darkGrey, color:colorScheme.white, fontFamily: "'Poppins', sans-serif" }}>
        {/* Sidebar */}
        <div className="fixed h-full w-64 py-8 px-4 z-10" style={{ backgroundColor:colorScheme.black, borderRight: `1px solid ${colorScheme.darkGrey2}` }}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold flex items-center" style={{ color:colorScheme.appColor }}>
              <Briefcase className="mr-2" size={28} />
              <span>Career Panel</span>
            </h2>
          </div>
          
          <nav>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => {setActiveTab("all"); setShowDetails(false)}}
                  className="w-full text-left py-4 px-4 rounded-lg flex items-center text-lg font-medium"
                  style={{ 
                    backgroundColor: activeTab === "all" ?colorScheme.darkGrey2 : 'transparent',
                    color: activeTab === "all" ?colorScheme.appColor :colorScheme.white
                  }}
                >
                  <Users className="mr-3" size={22} />
                  <span>All Applications</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {setActiveTab("accepted"); setShowDetails(false)}}
                  className="w-full text-left py-4 px-4 rounded-lg flex items-center text-lg font-medium"
                  style={{ 
                    backgroundColor: activeTab === "accepted" ?colorScheme.darkGrey2 : 'transparent',
                    color: activeTab === "accepted" ?colorScheme.appColor :colorScheme.white
                  }}
                >
                  <CheckCircle className="mr-3" size={22} />
                  <span>Accepted</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab("rejected")}
                  className="w-full text-left py-4 px-4 rounded-lg flex items-center text-lg font-medium"
                  style={{ 
                    backgroundColor: activeTab === "rejected" ?colorScheme.darkGrey2 : 'transparent',
                    color: activeTab === "rejected" ?colorScheme.appColor :colorScheme.white
                  }}
                >
                  <XCircle className="mr-3" size={22} />
                  <span>Rejected</span>
                </button>
              </li>
              <li>
                <Link 
                  to="/career-login/career-panel/HR-login"
                  className="w-full text-left py-4 px-4 rounded-lg flex items-center text-lg font-medium"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: colorScheme.white
                  }}
                >
                  <User className="mr-3" size={22} />
                  <span>HR Manager</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="ml-64 p-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h1 className="text-5xl font-bold mb-3" style={{ color:colorScheme.appColor }}>
              Career Panel
            </h1>
            <p className="text-xl opacity-80">Manage and review job applications</p>
          </motion.div>
          
          <div className="mb-8 flex items-center">
            <h2 className="text-3xl font-semibold" style={{ 
              color: activeTab === "accepted" ?colorScheme.appColor : 
                    activeTab === "rejected" ? "#ff6b6b" :colorScheme.appColor 
            }}>
              {activeTab === "accepted" ? "Accepted Applications" : 
               activeTab === "rejected" ? "Rejected Applications" : 
               "All Applications"}
            </h2>
            <div className="ml-4 px-4 py-1 rounded-full text-base" style={{ backgroundColor:colorScheme.darkGrey2 }}>
              {applications.length} {applications.length === 1 ? "application" : "applications"}
            </div>
          </div>
          
          {loading && applications.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor:colorScheme.appColor }}></div>
            </div>
          ) : (
            <>
              {!showDetails ? (
                <motion.div 
                  key={activeTab} // Force re-render on tab change
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {applications.map((app) => (
                    <motion.div 
                      key={app.id}
                      variants={itemVariants}
                      className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                      style={{ 
                        backgroundColor:colorScheme.darkGrey2,
                        border: `2px solid ${app.status === "accepted" ?colorScheme.appColor : 
                                            app.status === "rejected" ? "#ff6b6b" : 
                                           colorScheme.darkGrey2}`
                      }}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-5">
                          <h3 className="text-2xl font-semibold">{app.fullName}</h3>
                          <span className="px-4 py-1 rounded-full text-sm font-medium" style={{ 
                            backgroundColor: app.status === "accepted" ? "rgba(237, 255, 141, 0.2)" : 
                                           app.status === "rejected" ? "rgba(255, 107, 107, 0.2)" : 
                                           "rgba(255, 193, 7, 0.2)",
                            color: app.status === "accepted" ?colorScheme.appColor : 
                                  app.status === "rejected" ? "#ff6b6b" : 
                                  "#ffc107"
                          }}>
                            {app.status === "accepted" ? "Accepted" :
                             app.status === "rejected" ? "Rejected" : "Pending"}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center opacity-90">
                            <Briefcase size={20} className="mr-3" style={{ color:colorScheme.appColor }} />
                            <span className="text-lg">Primary Skill: <span className="font-medium">{app.primarySkill}</span></span>
                          </div>
                          <div className="flex items-center opacity-90">
                            <FileText size={20} className="mr-3" style={{ color:colorScheme.appColor }} />
                            <span className="text-lg">Applying for: <span className="font-medium">{app.applyFor || app.jobType}</span></span>
                          </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end">
                          <button
                            onClick={() => handleViewDetails(app)}
                            className="flex items-center px-5 py-3 rounded-lg hover:opacity-90 transition-opacity text-base font-medium"
                            style={{ backgroundColor:colorScheme.appColor, color:colorScheme.black }}
                          >
                            <Eye size={20} className="mr-2" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl shadow-xl p-8"
                  style={{ backgroundColor:colorScheme.darkGrey2, border: `2px solid ${colorScheme.darkGrey}` }}
                >
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-3xl font-bold">{selectedApplication.fullName}</h2>
                      <div className="mt-2">
                        <span className="px-4 py-1 rounded-full text-base font-medium inline-block" style={{ 
                          backgroundColor: selectedApplication.status === "accepted" ? "rgba(237, 255, 141, 0.2)" : 
                                         selectedApplication.status === "rejected" ? "rgba(255, 107, 107, 0.2)" : 
                                         "rgba(255, 193, 7, 0.2)",
                          color: selectedApplication.status === "accepted" ?colorScheme.appColor : 
                                selectedApplication.status === "rejected" ? "#ff6b6b" : 
                                "#ffc107"
                        }}>
                          {selectedApplication.status === "accepted" ? "Accepted" :
                           selectedApplication.status === "rejected" ? "Rejected" : "Pending"}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication.id, "accepted")}
                        className="px-5 py-3 rounded-lg flex items-center text-lg"
                        style={{ 
                          backgroundColor: selectedApplication.status === "accepted" ?colorScheme.appColor :colorScheme.darkGrey,
                          color: selectedApplication.status === "accepted" ?colorScheme.black :colorScheme.white,
                          minWidth: "150px"
                        }}
                      >
                        <CheckCircle size={20} className="mr-2" />
                        Accept
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication.id, "rejected")}
                        className="px-5 py-3 rounded-lg flex items-center text-lg"
                        style={{ 
                          backgroundColor: selectedApplication.status === "rejected" ? "#ff6b6b" :colorScheme.darkGrey,
                          color:colorScheme.white,
                          minWidth: "150px"
                        }}
                      >
                        <XCircle size={20} className="mr-2" />
                        Reject
                      </button>
                      <button
                        onClick={() => setShowDetails(false)}
                        className="px-5 py-3 rounded-lg text-lg"
                        style={{ 
                          backgroundColor:colorScheme.darkGrey, 
                          color:colorScheme.white,
                          minWidth: "150px"
                        }}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <tbody className="divide-y" style={{ borderColor:colorScheme.darkGrey }}>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium w-1/4 text-lg opacity-80">Full Name</td>
                          <td className="py-4 px-4 text-lg">{selectedApplication.fullName}</td>
                        </tr>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium text-lg opacity-80">Email</td>
                          <td className="py-4 px-4 text-lg">{selectedApplication.email}</td>
                        </tr>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium text-lg opacity-80">City</td>
                          <td className="py-4 px-4 text-lg">{selectedApplication.city}</td>
                        </tr>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium text-lg opacity-80">Phone Number</td>
                          <td className="py-4 px-4 text-lg">{selectedApplication.phoneNumber}</td>
                        </tr>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium text-lg opacity-80">Primary Skill</td>
                          <td className="py-4 px-4 text-lg">{selectedApplication.primarySkill}</td>
                        </tr>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium text-lg opacity-80">Apply For</td>
                          <td className="py-4 px-4 text-lg">{selectedApplication.applyFor}</td>
                        </tr>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium text-lg opacity-80">Job Type</td>
                          <td className="py-4 px-4 text-lg">{selectedApplication.jobType}</td>
                        </tr>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium text-lg opacity-80">Experience</td>
                          <td className="py-4 px-4 text-lg">{selectedApplication.experience || "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium text-lg opacity-80">Expected Stipend</td>
                          <td className="py-4 px-4 text-lg">{selectedApplication.expectedStipend}</td>
                        </tr>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium text-lg opacity-80">Stipend Amount</td>
                          <td className="py-4 px-4 text-lg">{selectedApplication.stipendAmount || "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium text-lg opacity-80">Aspirations</td>
                          <td className="py-4 px-4 text-lg">{selectedApplication.aspirations}</td>
                        </tr>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium text-lg opacity-80">Skills Description</td>
                          <td className="py-4 px-4 text-lg">{selectedApplication.skillsDescription}</td>
                        </tr>
                        <tr>
                          <td className="py-4 pl-0 pr-4 font-medium text-lg opacity-80">Resume</td>
                          <td className="py-4 px-4 text-lg">
                            <button
                              onClick={() => window.open(selectedApplication.resume, "_blank")}
                              className="px-5 py-3 rounded-lg flex items-center"
                              style={{ backgroundColor:colorScheme.appColor, color:colorScheme.black }}
                            >
                              <FileText size={20} className="mr-2" />
                              View Resume
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
              
              {!showDetails && applications.length > 0 && (
                <div className="mt-12 text-center">
                  {loading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor:colorScheme.appColor }}></div>
                    </div>
                  ) : hasMore ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={loadMore}
                      className="px-8 py-4 rounded-lg font-semibold text-lg shadow-lg flex items-center mx-auto"
                      style={{ backgroundColor:colorScheme.appColor, color:colorScheme.black }}
                    >
                      Load More
                      <ChevronDown className="ml-2" size={20} />
                    </motion.button>
                  ) : (
                    <p className="text-xl opacity-70">No more applications</p>
                  )}
                </div>
              )}
              
              {applications.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="text-8xl mb-6" style={{ color:colorScheme.appColor }}>📋</div>
                  <h3 className="text-2xl font-medium mb-2">No applications found</h3>
                  <p className="text-lg opacity-70">
                    {activeTab === "accepted" ? "No accepted applications yet." : 
                     activeTab === "rejected" ? "No rejected applications yet." : 
                     "There are no applications to display."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CareerPanel;