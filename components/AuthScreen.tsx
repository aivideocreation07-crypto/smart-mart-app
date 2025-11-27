
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Store, User, ArrowRight, MapPin, Loader2, Briefcase } from 'lucide-react';
import { SHOP_CATEGORIES } from '../constants';
import { BusinessType } from '../types';

interface AuthScreenProps {
  setVoiceContext: (ctx: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ setVoiceContext }) => {
  const { login, registerShopkeeper, registerCustomer } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'SHOPKEEPER' | 'CUSTOMER'>('SHOPKEEPER');
  
  // Form States
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  // Default to RETAIL (Mart)
  const [businessType] = useState<BusinessType>(BusinessType.RETAIL);
  const [shopCategory, setShopCategory] = useState(SHOP_CATEGORIES[0]);
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLogin) {
      setVoiceContext("Welcome to Smart Mart. Please enter your mobile number to login.");
    } else {
      if (role === 'SHOPKEEPER') {
        setVoiceContext("Let's set up your online shop. What is your shop's name?");
      } else {
        setVoiceContext("Create a customer account to find nearby shops.");
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
    if (role === 'SHOPKEEPER') {
      if (!location) {
        setError('Please capture location first.');
        return;
      }
      registerShopkeeper(name, mobile, {
        name: shopName,
        category: shopCategory,
        businessType: businessType,
        location: location
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
    <div className="h-full bg-gray-900 p-6 flex flex-col justify-center animate-fade-in overflow-y-auto">
      <div className="text-center mb-8 mt-10">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">Smart Mart</h1>
        <p className="text-gray-400">Your AI Partner for Local Business</p>
      </div>

      {/* Toggle Login/Register */}
      <div className="flex bg-gray-800 p-1 rounded-xl mb-6 border border-gray-700 shrink-0">
        <button 
          onClick={() => { setIsLogin(true); setError(''); }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-gray-700 shadow text-orange-500' : 'text-gray-400 hover:text-gray-300'}`}
        >
          Login
        </button>
        <button 
          onClick={() => { setIsLogin(false); setError(''); }}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-gray-700 shadow text-orange-500' : 'text-gray-400 hover:text-gray-300'}`}
        >
          Register
        </button>
      </div>

      {!isLogin && (
        <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
           <button 
             onClick={() => setRole('SHOPKEEPER')}
             className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${role === 'SHOPKEEPER' ? 'border-orange-500 bg-orange-900/20 text-orange-500' : 'border-gray-700 bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
           >
             <Store size={24} />
             <span className="font-bold text-xs">Seller / Business</span>
           </button>
           <button 
             onClick={() => setRole('CUSTOMER')}
             className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${role === 'CUSTOMER' ? 'border-orange-500 bg-orange-900/20 text-orange-500' : 'border-gray-700 bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
           >
             <User size={24} />
             <span className="font-bold text-xs">Buyer / User</span>
           </button>
        </div>
      )}

      <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
        {error && <div className="p-3 bg-red-900/30 border border-red-900/50 text-red-400 rounded-lg text-sm font-medium">{error}</div>}

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder-gray-600"
              placeholder="e.g. Rahim Uddin"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Mobile Number</label>
          <input 
            required
            type="tel" 
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder-gray-600"
            placeholder="01XXXXXXXXX"
          />
        </div>

        {/* Shopkeeper Specific Fields */}
        {!isLogin && role === 'SHOPKEEPER' && (
          <div className="space-y-4 animate-fade-in">
             {/* Business Type is now implicitly Mart (Retail) - Hidden/ReadOnly */}
             <div className="flex items-center gap-2 p-3 bg-orange-900/20 border border-orange-500/50 rounded-xl">
                 <Briefcase size={16} className="text-orange-500"/>
                 <span className="text-sm font-bold text-orange-400">Business Type: Mart</span>
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Shop Name</label>
                <input 
                  required
                  type="text" 
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder-gray-600"
                  placeholder="e.g. Rahim General Store"
                />
             </div>
             
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <select 
                  value={shopCategory}
                  onChange={(e) => setShopCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-700 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {SHOP_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
             </div>

             <button
               type="button"
               onClick={captureLocation}
               className={`w-full py-3 rounded-xl border-2 border-dashed flex items-center justify-center space-x-2 transition-colors ${location ? 'border-green-600 bg-green-900/20 text-green-500' : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400'}`}
             >
               {isLoadingLoc ? <Loader2 className="animate-spin" /> : <MapPin size={20} />}
               <span>{location ? location.address : "Tap to Capture Shop Location"}</span>
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

      <p className="text-center text-xs text-gray-600 mt-8 pb-10">
        By continuing, you agree to Smart Mart's Terms & Conditions.
      </p>
    </div>
  );
};
