import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProviderDashboard } from './components/ProviderDashboard'; // New
import { ProductUpload } from './components/ProductUpload';
import { ServiceManager } from './components/ServiceManager'; // New
import { Marketing } from './components/Marketing';
import { CustomerView } from './components/CustomerView';
import { ShopProfileEditor } from './components/ShopProfileEditor';
import { OrderManager } from './components/OrderManager';
import { VoiceAssistant } from './components/VoiceAssistant';
import { AuthScreen } from './components/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import { UserRole, Product } from './types';
import { db } from './services/db';

export default function App() {
  const { user, shop } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Voice Context State
  const [voiceContext, setVoiceContext] = useState<string>('');
  const [voiceTrigger, setVoiceTrigger] = useState(false);

  // Helper to update voice context and trigger speech
  const updateVoice = (text: string) => {
    setVoiceContext(text);
    setVoiceTrigger(t => !t);
  };

  const handleSaveProduct = (partial: Partial<Product>) => {
    if (!shop) return;
    
    const newProduct: Product = {
      id: Date.now().toString(),
      shopId: shop.id,
      name: partial.name || 'Unknown',
      nameBn: partial.nameBn,
      price: partial.price || 0,
      category: partial.category || 'General',
      description: partial.description || '',
      stock: partial.stock || 0,
      imageUrl: partial.imageUrl || 'https://picsum.photos/200/300?random=' + Date.now(),
      tags: partial.tags || [],
      enableBooking: partial.enableBooking,
      durationMinutes: partial.durationMinutes
    };
    
    db.saveProduct(newProduct);
    setCurrentView('dashboard');
    updateVoice(shop.businessType === 'SERVICE' ? "Service added successfully." : "Product published successfully.");
  };

  // Routing Logic
  const renderContent = () => {
    if (!user) {
      return <AuthScreen setVoiceContext={updateVoice} />;
    }

    if (user.role === UserRole.CUSTOMER) {
      return <CustomerView />;
    }

    // --- SERVICE PROVIDER FLOW ---
    if (user.role === UserRole.SERVICE_PROVIDER) {
        switch(currentView) {
            case 'dashboard':
                return <ProviderDashboard onNavigate={setCurrentView} setVoiceContext={updateVoice} />;
            case 'add-service':
                return <ServiceManager onSave={handleSaveProduct} onCancel={() => setCurrentView('dashboard')} setVoiceContext={updateVoice} />;
            case 'shop-profile':
                return <ShopProfileEditor onBack={() => setCurrentView('dashboard')} setVoiceContext={updateVoice} />;
            default:
                return <ProviderDashboard onNavigate={setCurrentView} setVoiceContext={updateVoice} />;
        }
    }

    // --- RETAIL SHOPKEEPER FLOW ---
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'add-product') updateVoice("Take a photo of the product.");
          if (view === 'marketing') updateVoice("Select an item to advertise.");
          if (view === 'shop-profile') updateVoice("Update your shop's banner and social links.");
          if (view === 'orders') updateVoice("Managing your orders and bookings.");
        }} />;
      case 'add-product':
        return <ProductUpload 
          onSave={handleSaveProduct} 
          onCancel={() => { setCurrentView('dashboard'); updateVoice("Cancelled."); }} 
          setVoiceContext={updateVoice}
        />;
      case 'marketing':
        return <Marketing 
          products={db.getProducts().filter(p => p.shopId === shop?.id)} 
          onBack={() => setCurrentView('dashboard')}
          setVoiceContext={updateVoice}
        />;
      case 'shop-profile':
        return <ShopProfileEditor 
          onBack={() => setCurrentView('dashboard')}
          setVoiceContext={updateVoice}
        />;
      case 'orders':
        return <OrderManager 
          onBack={() => setCurrentView('dashboard')}
          setVoiceContext={updateVoice}
        />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="bg-slate-50 hero-gradient min-h-screen font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col border-x border-gray-200">
      <div className="flex-1 overflow-hidden relative">
        {renderContent()}
      </div>

      <VoiceAssistant context={voiceContext} trigger={voiceTrigger} />
    </div>
  );
}