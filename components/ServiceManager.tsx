import React, { useState } from 'react';
import { ArrowLeft, Check, Camera, Plus, Clock, DollarSign } from 'lucide-react';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { SERVICE_CATEGORIES } from '../constants';

interface ServiceManagerProps {
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
  setVoiceContext: (ctx: string) => void;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({ onSave, onCancel, setVoiceContext }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Service',
    description: '',
    durationMinutes: 60,
    enableBooking: true,
    stock: 999
  });

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-900">
       <div className="p-4 flex items-center space-x-3 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeft size={20} className="text-slate-600" /></button>
        <h2 className="font-bold text-lg">Add Service</h2>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
         {/* Name */}
         <div>
             <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Service Name</label>
             <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-slate-900 focus:border-cyan-500 outline-none shadow-sm" placeholder="e.g. AC Cleaning"/>
         </div>

         {/* Price & Duration */}
         <div className="grid grid-cols-2 gap-4">
             <div>
                 <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Price (৳)</label>
                 <div className="relative">
                     <DollarSign size={14} className="absolute left-3 top-3.5 text-gray-400"/>
                     <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-xl p-3 pl-8 text-slate-900 focus:border-cyan-500 outline-none shadow-sm"/>
                 </div>
             </div>
             <div>
                 <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Duration (Min)</label>
                 <div className="relative">
                     <Clock size={14} className="absolute left-3 top-3.5 text-gray-400"/>
                     <input type="number" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-xl p-3 pl-8 text-slate-900 focus:border-cyan-500 outline-none shadow-sm"/>
                 </div>
             </div>
         </div>

         {/* Description */}
         <div>
             <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Details / Inclusions</label>
             <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-slate-900 focus:border-cyan-500 outline-none shadow-sm" placeholder="What is included in this service?"/>
         </div>

         <button onClick={() => onSave(formData)} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-lg">
             <Check size={20}/> Save Service
         </button>
      </div>
    </div>
  );
};