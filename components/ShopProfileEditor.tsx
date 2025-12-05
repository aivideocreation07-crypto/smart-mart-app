import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Save, Upload, Facebook, Instagram, Youtube, MessageCircle, QrCode, Truck, MapPin, Clock, RotateCcw } from 'lucide-react';
import { Shop } from '../types';
import { SHOP_CATEGORIES } from '../constants';

interface ShopProfileEditorProps {
  onBack: () => void;
  setVoiceContext: (ctx: string) => void;
}

export const ShopProfileEditor: React.FC<ShopProfileEditorProps> = ({ onBack, setVoiceContext }) => {
  const { shop, updateShopProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<Shop>>(shop || {});
  const [socialLinks, setSocialLinks] = useState(shop?.socialLinks || {});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (shop) {
      updateShopProfile({ ...formData, socialLinks: socialLinks });
      setVoiceContext("Shop settings updated successfully.");
      onBack();
    }
  };

  const handleImageUpload = (type: 'logo' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'logo') setFormData(prev => ({ ...prev, imageUrl: result }));
        if (type === 'banner') setFormData(prev => ({ ...prev, bannerUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in text-slate-900 pb-20">
      <div className="p-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeft size={20} className="text-slate-700" /></button>
            <h2 className="font-bold text-lg uppercase tracking-wider text-slate-900">Shop Settings</h2>
        </div>
        <button onClick={handleSave} className="bg-orange-600 text-white px-5 py-2 rounded-full font-bold text-sm shadow-md hover:bg-orange-500 transition-transform flex items-center gap-2">
            <Save size={16}/> SAVE
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        {/* Banner Section */}
        <div className="space-y-2">
            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Storefront Banner</label>
            <div onClick={() => bannerInputRef.current?.click()} className="h-40 w-full rounded-2xl bg-white border border-dashed border-gray-300 relative overflow-hidden group cursor-pointer hover:border-orange-500 transition-colors shadow-sm">
                {formData.bannerUrl ? (
                    <img src={formData.bannerUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-orange-500">
                        <Upload size={32} className="mb-2"/>
                        <span className="text-xs">Upload 16:9 HD Image</span>
                    </div>
                )}
                <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload('banner', e)} />
            </div>
        </div>

        {/* Brand Identity */}
        <div className="flex gap-5">
            <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full bg-white border border-dashed border-gray-300 flex items-center justify-center shrink-0 cursor-pointer hover:border-orange-500 overflow-hidden relative group shadow-sm">
                 {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <Upload size={24} className="text-gray-400 group-hover:text-orange-500"/>}
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload('logo', e)} />
            </div>
            <div className="flex-1 space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 focus-within:border-orange-500 transition-colors shadow-sm">
                    <label className="block text-[10px] text-gray-400 uppercase">Shop Name</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-transparent w-full text-slate-900 font-bold outline-none"/>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                    <label className="block text-[10px] text-gray-400 uppercase">Category</label>
                    <select value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="bg-transparent w-full text-slate-900 outline-none">
                         {SHOP_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>
        </div>

        {/* Operating Hours & Policy */}
        <div className="glass-panel p-5 rounded-2xl border-t border-purple-200 bg-white">
            <h3 className="text-purple-600 text-xs font-bold uppercase tracking-widest mb-4">Operations & Policies</h3>
            <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-gray-200 rounded-xl p-3">
                         <label className="block text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1"><Clock size={10}/> Open</label>
                         <input type="time" value={formData.openingTime || '09:00'} onChange={e => setFormData({...formData, openingTime: e.target.value})} className="bg-transparent w-full text-slate-900 outline-none"/>
                    </div>
                    <div className="bg-slate-50 border border-gray-200 rounded-xl p-3">
                         <label className="block text-[10px] text-gray-500 uppercase mb-1 flex items-center gap-1"><Clock size={10}/> Close</label>
                         <input type="time" value={formData.closingTime || '22:00'} onChange={e => setFormData({...formData, closingTime: e.target.value})} className="bg-transparent w-full text-slate-900 outline-none"/>
                    </div>
                 </div>

                 <div className="bg-slate-50 border border-gray-200 rounded-xl p-3">
                    <label className="block text-[10px] text-gray-500 uppercase mb-2 flex items-center gap-1"><RotateCcw size={10}/> Advance Refund Policy</label>
                    <div className="flex gap-2">
                        {['NO_REFUND', '50_PERCENT', 'FULL_REFUND'].map((policy) => (
                            <button 
                                key={policy}
                                onClick={() => setFormData({...formData, refundPolicy: policy as any})}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-colors ${formData.refundPolicy === policy ? 'bg-purple-100 border-purple-300 text-purple-600' : 'border-gray-200 text-gray-500 bg-white'}`}
                            >
                                {policy.replace('_PERCENT', '%').replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                 </div>
            </div>
        </div>

        {/* Payments & Logistics */}
        <div className="glass-panel p-5 rounded-2xl border-t border-orange-200 bg-white">
            <h3 className="text-orange-600 text-xs font-bold uppercase tracking-widest mb-4">Advance Payments & Logistics</h3>
            <div className="space-y-4">
                <div className="flex items-center bg-slate-50 border border-gray-200 rounded-xl p-3 focus-within:border-orange-500 transition-colors">
                    <QrCode size={20} className="text-gray-400 mr-3"/>
                    <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 uppercase">UPI ID (For QR Code)</label>
                        <input 
                            type="text" 
                            value={formData.upiId || ''}
                            onChange={e => setFormData({...formData, upiId: e.target.value})}
                            placeholder="e.g. yourname@okaxis"
                            className="bg-transparent w-full text-slate-900 font-mono outline-none placeholder-gray-400"
                        />
                    </div>
                </div>

                 <div className="flex items-center bg-slate-50 border border-gray-200 rounded-xl p-3 focus-within:border-orange-500 transition-colors">
                    <Truck size={20} className="text-gray-400 mr-3"/>
                    <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 uppercase">Delivery Partner Name</label>
                        <input 
                            type="text" 
                            value={formData.deliveryPartnerName || ''}
                            onChange={e => setFormData({...formData, deliveryPartnerName: e.target.value})}
                            placeholder="e.g. Local Courier / Self"
                            className="bg-transparent w-full text-slate-900 outline-none placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="flex items-center bg-slate-50 border border-gray-200 rounded-xl p-3 focus-within:border-orange-500 transition-colors">
                    <MapPin size={20} className="text-gray-400 mr-3"/>
                    <div className="flex-1">
                        <label className="block text-[10px] text-gray-500 uppercase">Max Booking Distance (KM)</label>
                        <input 
                            type="number" 
                            value={formData.maxBookingDistance || ''}
                            onChange={e => setFormData({...formData, maxBookingDistance: Number(e.target.value)})}
                            placeholder="e.g. 5"
                            className="bg-transparent w-full text-slate-900 outline-none placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Social Panel */}
        <div className="glass-panel p-5 rounded-2xl border-t border-cyan-200 bg-white">
            <h3 className="text-cyan-600 text-xs font-bold uppercase tracking-widest mb-4">Digital Presence</h3>
            <div className="space-y-3">
                {[
                    { icon: Facebook, color: 'text-blue-600', key: 'facebook', ph: 'Facebook Page URL' },
                    { icon: Instagram, color: 'text-pink-600', key: 'instagram', ph: 'Instagram Handle' },
                    { icon: MessageCircle, color: 'text-green-600', key: 'whatsapp', ph: 'WhatsApp Number' },
                    { icon: Youtube, color: 'text-red-600', key: 'youtube', ph: 'YouTube Channel' }
                ].map((item) => (
                    <div key={item.key} className="flex items-center bg-slate-50 border border-gray-200 rounded-xl p-2 focus-within:border-cyan-500/50 transition-colors">
                        <item.icon size={20} className={`${item.color} mx-2`} />
                        <input 
                            type="text" 
                            placeholder={item.ph}
                            value={(socialLinks as any)[item.key] || ''}
                            onChange={e => setSocialLinks({...socialLinks, [item.key]: e.target.value})}
                            className="bg-transparent flex-1 text-sm text-slate-900 outline-none placeholder-gray-400"
                        />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};