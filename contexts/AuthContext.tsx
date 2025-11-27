
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Shop, UserRole, BusinessType } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  shop: Shop | null;
  login: (mobile: string) => boolean;
  registerShopkeeper: (name: string, mobile: string, shopDetails: Partial<Shop>) => void;
  registerCustomer: (name: string, mobile: string) => void;
  updateShopProfile: (updates: Partial<Shop>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    // Restore session
    const userId = db.getSession();
    if (userId) {
      const users = db.getUsers();
      const foundUser = users.find(u => u.id === userId);
      if (foundUser) {
        setUser(foundUser);
        if (foundUser.role === UserRole.SHOPKEEPER) {
          const foundShop = db.getShopByOwnerId(foundUser.id);
          setShop(foundShop || null);
        }
      }
    }
  }, []);

  const login = (mobile: string): boolean => {
    const foundUser = db.login(mobile);
    if (foundUser) {
      setUser(foundUser);
      db.setSession(foundUser.id);
      if (foundUser.role === UserRole.SHOPKEEPER) {
        const foundShop = db.getShopByOwnerId(foundUser.id);
        setShop(foundShop || null);
      }
      return true;
    }
    return false;
  };

  const registerShopkeeper = (name: string, mobile: string, shopDetails: Partial<Shop>) => {
    const userId = 'u' + Date.now();
    const shopId = 's' + Date.now();
    
    const newUser: User = {
      id: userId,
      name,
      mobile,
      role: UserRole.SHOPKEEPER,
      shopId
    };

    const newShop: Shop = {
      id: shopId,
      ownerId: userId,
      name: shopDetails.name!,
      ownerName: name,
      category: shopDetails.category || 'General',
      businessType: shopDetails.businessType || BusinessType.RETAIL,
      location: shopDetails.location || { lat: 23.8103, lng: 90.4125, address: 'Unknown' },
      phone: mobile,
      rating: 5.0,
      ratingCount: 0
    };

    db.saveUser(newUser);
    db.saveShop(newShop);
    
    setUser(newUser);
    setShop(newShop);
    db.setSession(newUser.id);
  };

  const registerCustomer = (name: string, mobile: string) => {
    const userId = 'u' + Date.now();
    const newUser: User = {
      id: userId,
      name,
      mobile,
      role: UserRole.CUSTOMER
    };
    db.saveUser(newUser);
    setUser(newUser);
    db.setSession(newUser.id);
  };

  const updateShopProfile = (updates: Partial<Shop>) => {
    if (!shop) return;
    const updatedShop = { ...shop, ...updates };
    db.saveShop(updatedShop);
    setShop(updatedShop);
  };

  const logout = () => {
    setUser(null);
    setShop(null);
    db.clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, shop, login, registerShopkeeper, registerCustomer, updateShopProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
