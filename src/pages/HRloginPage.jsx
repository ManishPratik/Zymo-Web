import { useState, useEffect } from 'react';
import { appDB } from '../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { 
  ArrowLeft,
  KeyRound, 
  UserPlus, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock,
  CheckCircle 
} from 'lucide-react';

const HRLogin = ({title}) => {
  const colorScheme = {
    appColor: "#edff8d", // Light yellow
    darkGrey: "#212121", // Dark background
    darkGrey2: "#424242", // Modal and table background
    successGreen: "#4CAF50" // Added success color
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newAgent, setNewAgent] = useState({ userId: '', password: '' });
  const [createdAgents, setCreatedAgents] = useState([]); // Track newly created agents
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = title;
  }, [title]);

  const handleMasterLogin = (e) => {
    e.preventDefault();
    const isValid = password === 'zymopanel';
    if (isValid) {
      setIsAuthenticated(true);
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(appDB, 'CareerLogin'), {
        userId: newAgent.userId,
        password: newAgent.password, // Save plain password instead of hashing
        createdAt: new Date()
      });
      // Add to local state with plain password for current session
      setCreatedAgents(prev => [
        ...prev,
        { id: docRef.id, userId: newAgent.userId, password: newAgent.password }
      ]);
      setSuccessMessage(`Agent ${newAgent.userId} created successfully!`);
      setNewAgent({ userId: '', password: '' });

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>HR Login - Zymo</title>
        <meta
          name="description"
          content="Log in as a HR to oversee and manage Zymo's Career applications."
        />
        <meta property="og:title" content="HR Login - Zymo" />
        <meta
          property="og:description"
          content="Secure access for Zymo Master Agents to manage agents, bookings, and platform settings."
        />
        <link rel="canonical" href="https://zymo.app/HR-login" />
      </Helmet>

      <div 
        className="relative flex items-center justify-center min-h-screen p-4"
        style={{ 
          backgroundColor: colorScheme.darkGrey,
          backgroundImage: 'linear-gradient(to right bottom, rgba(33, 33, 33, 0.9), rgba(66, 66, 66, 0.9))'
        }}
      >
        <div 
          className="absolute top-4 left-4 flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/career-login/career-panel')}
        >
          <ArrowLeft className="text-3xl" style={{ color: colorScheme.appColor }} />
          <span className="text-xl ml-2" style={{ color: colorScheme.appColor }}>Back to List</span>

        </div>
        <div 
          className="w-full max-w-md p-8 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105"
          style={{ 
            backgroundColor: colorScheme.darkGrey2,
            border: `2px solid ${colorScheme.appColor}`,
            boxShadow: `0 0 20px ${colorScheme.appColor}33`
          }}
        >
          {successMessage && (
            <div 
              className="flex items-center justify-center p-3 rounded-lg mb-4 animate-pulse"
              style={{ 
                backgroundColor: colorScheme.successGreen + '22', 
                color: colorScheme.successGreen 
              }}
            >
              <CheckCircle size={24} className="mr-2" />
              {successMessage}
            </div>
          )}

          {!isAuthenticated ? (
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <ShieldCheck 
                  size={64} 
                  color={colorScheme.appColor}
                  strokeWidth={1.5} 
                />
              </div>
              <h2 
                className="text-3xl font-bold text-center mb-6"
                style={{ color: colorScheme.appColor }}
              >
                Hiring Manager Login
              </h2>
              <form onSubmit={handleMasterLogin} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock 
                      size={20} 
                      color={colorScheme.appColor}
                      strokeWidth={1.5} 
                    />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Master Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pl-10 rounded-lg text-lg transition-all duration-300 focus:ring-2 focus:ring-yellow-500"
                    style={{ 
                      backgroundColor: colorScheme.darkGrey, 
                      color: colorScheme.appColor,
                      border: `1px solid ${colorScheme.appColor}`
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff 
                        size={20} 
                        color={colorScheme.appColor}
                        strokeWidth={1.5} 
                      />
                    ) : (
                      <Eye 
                        size={20} 
                        color={colorScheme.appColor}
                        strokeWidth={1.5} 
                      />
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full p-3 rounded-lg text-lg font-bold uppercase tracking-wider transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ 
                    backgroundColor: colorScheme.appColor, 
                    color: colorScheme.darkGrey 
                  }}
                >
                  Authenticate
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center mb-6">
                <UserPlus 
                  size={64} 
                  color={colorScheme.appColor}
                  strokeWidth={1.5} 
                />
              </div>
              <h2 
                className="text-3xl font-bold text-center mb-6"
                style={{ color: colorScheme.appColor }}
              >
                Create New Agent
              </h2>
              <form onSubmit={handleCreateAgent} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound 
                      size={20} 
                      color={colorScheme.appColor}
                      strokeWidth={1.5} 
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Agent User ID"
                    value={newAgent.userId}
                    onChange={(e) => setNewAgent({ ...newAgent, userId: e.target.value })}
                    className="w-full p-3 pl-10 rounded-lg text-lg transition-all duration-300 focus:ring-2 focus:ring-yellow-500"
                    style={{ 
                      backgroundColor: colorScheme.darkGrey, 
                      color: colorScheme.appColor,
                      border: `1px solid ${colorScheme.appColor}`
                    }}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock 
                      size={20} 
                      color={colorScheme.appColor}
                      strokeWidth={1.5} 
                    />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Agent Password"
                    value={newAgent.password}
                    onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                    className="w-full p-3 pl-10 rounded-lg text-lg transition-all duration-300 focus:ring-2 focus:ring-yellow-500"
                    style={{ 
                      backgroundColor: colorScheme.darkGrey, 
                      color: colorScheme.appColor,
                      border: `1px solid ${colorScheme.appColor}`
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff 
                        size={20} 
                        color={colorScheme.appColor}
                        strokeWidth={1.5} 
                      />
                    ) : (
                      <Eye 
                        size={20} 
                        color={colorScheme.appColor}
                        strokeWidth={1.5} 
                      />
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full p-3 rounded-lg text-lg font-bold uppercase tracking-wider transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ 
                    backgroundColor: colorScheme.appColor, 
                    color: colorScheme.darkGrey 
                  }}
                >
                  Create Agent
                </button>
              </form>
              {/* Agent List Button */}
              <button
                onClick={() => navigate('/career-login/career-panel/HR-login/CareerAgent-list', { state: { createdAgents } })}
                className="mt-4 w-full p-3 rounded-lg text-lg font-bold uppercase tracking-wider transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ 
                  backgroundColor: colorScheme.appColor, 
                  color: colorScheme.darkGrey 
                }}
              >
                Agent List
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HRLogin;