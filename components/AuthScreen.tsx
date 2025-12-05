import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Store, User, ArrowRight, MapPin, Loader2, Briefcase, Wrench } from 'lucide-react';
import { SHOP_CATEGORIES, SERVICE_CATEGORIES } from '../constants';
import { BusinessType, UserRole } from '../types';

interface AuthScreenProps {
  setVoiceContext: (ctx: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ setVoiceContext }) => {
  const { login, registerShopkeeper, registerServiceProvider, registerCustomer } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.SHOPKEEPER);
  
  // Form States
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [experience, setExperience] = useState('1');
  
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLogin) {
      setVoiceContext("Welcome to Smart Mart. Please enter your mobile number to login.");
    } else {
      if (role === UserRole.SHOPKEEPER) {
        setVoiceContext("Let's set up your online shop.");
        setCategory(SHOP_CATEGORIES[0]);
      } else if (role === UserRole.SERVICE_PROVIDER) {
        setVoiceContext("Create your Service Provider profile.");
        setCategory(SERVICE_CATEGORIES[0]);
      } else {
        setVoiceContext("Create a customer account to find nearby shops and services.");
      }
    }
  }, [isLogin, role, setVoiceContext]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(mobile)) {
      setError('Mobile number not found. Please register.');
      setVoiceContext("I couldn't find that number. Please register for a new account.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === UserRole.SHOPKEEPER) {
      if (!location) { setError('Please capture location first.'); return; }
      registerShopkeeper(name, mobile, {
        name: shopName,
        category: category,
        location: location
      });
    } else if (role === UserRole.SERVICE_PROVIDER) {
      if (!location) { setError('Please capture location first.'); return; }
      registerServiceProvider(name, mobile, {
        name: shopName, // Business Name
        category: category,
        location: location,
        experienceYears: parseInt(experience)
      });
    } else {
      registerCustomer(name, mobile);
    }
  };

  const captureLocation = () => {
    setIsLoadingLoc(true);
    setError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock reverse geocoding
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Detected Location (Near You)'
          });
          setIsLoadingLoc(false);
          setVoiceContext("Location captured successfully!");
        },
        () => {
          setIsLoadingLoc(false);
          setError('Could not get location. Ensure GPS is on.');
          // Fallback mock
          setLocation({ lat: 23.81, lng: 90.41, address: 'Dhaka (Default)' });
        }
      );
    }
  };

  return (
    <div className="h-full bg-slate-50 p-6 flex flex-col justify-center animate-fade-in overflow-y-auto">
      <div className="text-center mb-8 mt-10">
        <h1 className="text-3xl font-bold text-orange-600 mb-2">Smart Mart</h1>
        <p className="text-gray-500">Your AI Partner for Local Business</p>
      </div>

      {/* Toggle Login/Register */}
      <div className="flex bg-white p-1 rounded-xl mb-6 border border-gray-200 shadow-sm shrink-0">
        <button 
          onClick={() => { setIsLogin(true); setError(''); }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-slate-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Login
        </button>
        <button 
          onClick={() => { setIsLogin(false); setError(''); }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-slate-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Register
        </button>
      </div>

      {!isLogin && (
        <div className="grid grid-cols-3 gap-2 mb-6 shrink-0">
           <button 
             onClick={() => setRole(UserRole.SHOPKEEPER)}
             className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-colors ${role === UserRole.SHOPKEEPER ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}
           >
             <Store size={20} />
             <span className="font-bold text-[10px]">Retailer</span>
           </button>
           <button 
             onClick={() => setRole(UserRole.SERVICE_PROVIDER)}
             className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-colors ${role === UserRole.SERVICE_PROVIDER ? 'border-cyan-500 bg-cyan-50 text-cyan-600' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}
           >
             <Wrench size={20} />
             <span className="font-bold text-[10px]">Service</span>
           </button>
           <button 
             onClick={() => setRole(UserRole.CUSTOMER)}
             className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-colors ${role === UserRole.CUSTOMER ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}
           >
             <User size={20} />
             <span className="font-bold text-[10px]">Customer</span>
           </button>
        </div>
      )}

      <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">{error}</div>}

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder-gray-400"
              placeholder="e.g. Rahim Uddin"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Mobile Number</label>
          <input 
            required
            type="tel" 
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder-gray-400"
            placeholder="01XXXXXXXXX"
          />
        </div>

        {/* Business Specific Fields */}
        {!isLogin && (role === UserRole.SHOPKEEPER || role === UserRole.SERVICE_PROVIDER) && (
          <div className="space-y-4 animate-fade-in">
             <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{role === UserRole.SHOPKEEPER ? 'Shop Name' : 'Business / Provider Name'}</label>
                <input 
                  required
                  type="text" 
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder-gray-400"
                  placeholder={role === UserRole.SHOPKEEPER ? "e.g. Rahim Store" : "e.g. Rahim Electric Works"}
                />
             </div>
             
             <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category (Profession)</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {(role === UserRole.SHOPKEEPER ? SHOP_CATEGORIES : SERVICE_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
             </div>

             {role === UserRole.SERVICE_PROVIDER && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Experience (Years)</label>
                  <input 
                    type="number" 
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
             )}

             <button
               type="button"
               onClick={captureLocation}
               className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center space-x-2 transition-colors ${location ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'}`}
             >
               {isLoadingLoc ? <Loader2 className="animate-spin" /> : <MapPin size={20} />}
               <span>{location ? location.address : "Tap to Capture Location"}</span>
             </button>
          </div>
        )}

        <button 
          type="submit"
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-orange-500 active:scale-95 transition-all flex items-center justify-center space-x-2 mt-4"
        >
          <span>{isLogin ? 'Login' : 'Complete Registration'}</span>
          <ArrowRight size={20} />
        </button>
      </form>

      <p className="text-center text-xs text-gray-500 mt-8 pb-10">
        By continuing, you agree to Smart Mart's Terms & Conditions.
      </p>
    </div>
  );
};