
import React, { useState, useRef } from 'react';
import { Camera, Check, Loader2, ScanLine, X, Plus, Calendar, Sparkles } from 'lucide-react';
import { analyzeProductImage, getVoiceGuidance } from '../services/geminiService';
import { Product, BusinessType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { PRODUCT_CATEGORIES } from '../constants';

interface ProductUploadProps {
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
  setVoiceContext: (ctx: string) => void;
}

export const ProductUpload: React.FC<ProductUploadProps> = ({ onSave, onCancel, setVoiceContext }) => {
  const { shop } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiPricing, setIsAiPricing] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', nameBn: '', price: 0, category: PRODUCT_CATEGORIES[0], description: '', stock: 10, tags: [], enableBooking: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemLabel = 'Item';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setVoiceContext(`Scanning ${itemLabel} matrix. Stand by.`);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);
        const base64Data = base64.split(',')[1];
        try {
          const analysis = await analyzeProductImage(base64Data);
          if (analysis) {
            setFormData(prev => ({ ...prev, ...analysis }));
            setVoiceContext(`${itemLabel} identified. Reviewing specs.`);
          }
        } catch (error) {
           setVoiceContext("Scan failed. Manual input required.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const suggestPrice = () => {
    setIsAiPricing(true);
    // Simulation of AI pricing strategy
    setTimeout(() => {
        const basePrice = Math.floor(Math.random() * 500) + 50;
        setFormData(p => ({ ...p, price: basePrice }));
        setIsAiPricing(false);
        setVoiceContext(`Market analysis suggests ${basePrice} Taka.`);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10 bg-black/20 backdrop-blur-md sticky top-0">
        <h2 className="text-lg font-bold text-white tracking-widest uppercase">New {itemLabel}</h2>
        <button onClick={onCancel} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X size={20} className="text-gray-400"/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {/* HUD Camera Viewfinder */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`w-full aspect-square rounded-3xl relative overflow-hidden group cursor-pointer transition-all ${image ? 'border-2 border-orange-500' : 'bg-gray-900 border border-gray-700'}`}
        >
          {image ? (
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
          ) : (
             <>
               <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50"></div>
               <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50"></div>
               <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50"></div>
               <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50"></div>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center animate-pulse group-hover:border-orange-500 group-hover:text-orange-500 transition-colors">
                       <Camera size={32} className="text-gray-500 group-hover:text-orange-500" />
                   </div>
                   <p className="mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Tap to Scan</p>
               </div>
             </>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-20">
              <ScanLine size={48} className="text-cyan-400 animate-bounce mb-4" />
              <p className="text-cyan-400 font-mono text-sm animate-pulse">ANALYZING MATRIX...</p>
            </div>
          )}
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        </div>

        {/* Holographic AI Panel */}
        {formData.nameBn && (
            <div className="relative glass-panel rounded-2xl p-5 neon-border-cyan animate-fade-in-up">
                <div className="absolute -top-3 left-4 bg-[#020617] px-2 text-cyan-400 text-xs font-bold border border-cyan-900 rounded uppercase">AI Detected</div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white font-bengali">{formData.nameBn}</h3>
                    <span className="text-xs bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30">{formData.category}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag, i) => (
                        <span key={i} className="text-[10px] uppercase bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400">#{tag}</span>
                    ))}
                </div>
            </div>
        )}

        {/* Deep Inputs */}
        <div className="space-y-5">
           <div className="bg-white/5 border border-white/10 rounded-2xl p-3 focus-within:border-orange-500 transition-colors">
               <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">{itemLabel} Name (English)</label>
               <input 
                  type="text" 
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-transparent text-lg font-bold text-white outline-none placeholder-gray-700"
               />
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 border border-white/10 rounded-2xl p-3 focus-within:border-orange-500 transition-colors relative">
                   <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 flex justify-between">
                       Price (৳)
                       <button onClick={suggestPrice} className="text-cyan-400 hover:text-white transition-colors"><Sparkles size={12}/></button>
                   </label>
                   <input 
                      type="number" 
                      value={formData.price || ''}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full bg-transparent text-2xl font-bold text-orange-500 outline-none placeholder-gray-700"
                      placeholder="0"
                   />
                   {isAiPricing && <Loader2 size={16} className="absolute right-3 bottom-4 text-orange-500 animate-spin"/>}
               </div>
               
               <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                   <div className="flex-1">
                       <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Stock</label>
                       <span className="text-xl font-bold text-white">{formData.stock}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                       <button onClick={() => setFormData(p => ({...p, stock: (p.stock||0)+1}))} className="bg-white/10 p-1 rounded hover:bg-white/20"><Plus size={12} className="text-white"/></button>
                       <button onClick={() => setFormData(p => ({...p, stock: Math.max(0,(p.stock||0)-1) }))} className="bg-white/10 p-1 rounded hover:bg-white/20"><div className="w-3 h-0.5 bg-white"></div></button>
                   </div>
               </div>
           </div>

           {/* Booking Toggle */}
           <div 
             onClick={() => setFormData(p => ({...p, enableBooking: !p.enableBooking}))}
             className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${formData.enableBooking ? 'bg-orange-900/20 border-orange-500' : 'bg-white/5 border-white/10'}`}
           >
               <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-full ${formData.enableBooking ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                       <Calendar size={20}/>
                   </div>
                   <div>
                       <h3 className={`font-bold text-sm ${formData.enableBooking ? 'text-white' : 'text-gray-400'}`}>Enable Booking</h3>
                       <p className="text-[10px] text-gray-500">Allow customers to schedule pickup</p>
                   </div>
               </div>
               <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.enableBooking ? 'bg-orange-500' : 'bg-gray-700'}`}>
                   <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.enableBooking ? 'translate-x-4' : ''}`}></div>
               </div>
           </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-0 w-full px-4 z-30">
          <button 
            onClick={() => onSave(formData)}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg py-4 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 transition-all active:scale-95"
          >
              <Check size={20} />
              SAVE ITEM
          </button>
      </div>
    </div>
  );
};
