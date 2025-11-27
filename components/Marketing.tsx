import React, { useState } from 'react';
import { generateMarketingCopy } from '../services/geminiService';
import { db } from '../services/db';
import { Product, MarketingPost } from '../types';
import { ArrowLeft, Wand2, Copy, Send, Loader2, Facebook, Instagram, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MarketingProps {
  products: Product[];
  onBack: () => void;
  setVoiceContext: (ctx: string) => void;
}

export const Marketing: React.FC<MarketingProps> = ({ products, onBack, setVoiceContext }) => {
  const { shop } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [generatedAd, setGeneratedAd] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);
  const [broadcastChannels, setBroadcastChannels] = useState({ facebook: true, instagram: false });

  const handleGenerate = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    setPublished(false);
    setVoiceContext("Synthesizing market data...");
    const ad = await generateMarketingCopy(selectedProduct, 'facebook');
    setGeneratedAd(ad);
    setLoading(false);
    setVoiceContext("Ad copy synthesized.");
  };

  const handlePublish = () => {
    if (!shop || !selectedProduct || !generatedAd) return;
    const channels = [];
    if(broadcastChannels.facebook) channels.push('facebook');
    if(broadcastChannels.instagram) channels.push('instagram');
    
    db.savePost({
        id: 'post_'+Date.now(),
        shopId: shop.id,
        type: 'POSTER',
        content: generatedAd,
        summaryBn: generatedAd.substring(0,50)+'...',
        imageUrl: selectedProduct.imageUrl,
        createdAt: Date.now(),
        channels
    });
    setPublished(true);
    setVoiceContext("Broadcast complete.");
    setTimeout(() => { setSelectedProduct(null); setGeneratedAd(''); setPublished(false); }, 3000);
  }

  return (
    <div className="h-full flex flex-col bg-[#020617] text-white">
      <div className="p-4 flex items-center space-x-3 bg-black/20 backdrop-blur-md border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10"><ArrowLeft size={20} /></button>
        <h2 className="font-bold text-lg tracking-wider uppercase">Marketing Lab</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        {!selectedProduct ? (
           <div className="grid grid-cols-1 gap-3">
               <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Select Item to Boost</p>
               {products.map(p => (
                   <button key={p.id} onClick={() => setSelectedProduct(p)} className="flex items-center bg-white/5 border border-white/5 rounded-2xl p-2 hover:bg-white/10 hover:neon-border-orange transition-all text-left group">
                       <div className="w-14 h-14 bg-gray-800 rounded-xl overflow-hidden shrink-0 mr-4">
                           {p.imageUrl && <img src={p.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />}
                       </div>
                       <div>
                           <h3 className="font-bold text-white group-hover:text-orange-400 transition-colors">{p.nameBn}</h3>
                           <p className="text-xs text-gray-500">Stock: {p.stock}</p>
                       </div>
                   </button>
               ))}
           </div>
        ) : (
           <div className="animate-fade-in-up">
               {/* Selected Item Header */}
               <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20">
                           {selectedProduct.imageUrl && <img src={selectedProduct.imageUrl} className="w-full h-full object-cover" />}
                       </div>
                       <span className="font-bold text-white">{selectedProduct.nameBn}</span>
                   </div>
                   <button onClick={() => setSelectedProduct(null)} className="text-xs text-red-400 hover:text-red-300">CHANGE</button>
               </div>

               {generatedAd ? (
                   <div className="space-y-6">
                       {/* Preview Card */}
                       <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"></div>
                           <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Preview</h3>
                           <p className="font-bengali text-lg leading-relaxed text-gray-200 whitespace-pre-wrap">{generatedAd}</p>
                           <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
                               <button onClick={() => navigator.clipboard.writeText(generatedAd)} className="text-gray-400 hover:text-white flex items-center text-xs gap-1"><Copy size={12}/> COPY</button>
                           </div>
                       </div>

                       {/* Neon Control Panel */}
                       <div className="glass-panel p-5 rounded-2xl neon-border-cyan">
                           <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div> Transmission Links
                           </h3>
                           <div className="space-y-3">
                               <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:bg-black/60 transition-colors">
                                   <div className="flex items-center gap-3">
                                       <div className={`p-2 rounded-lg ${broadcastChannels.facebook ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}><Facebook size={18}/></div>
                                       <span className="font-bold text-sm text-gray-300">Facebook Page</span>
                                   </div>
                                   <div onClick={() => setBroadcastChannels(p => ({...p, facebook: !p.facebook}))} className={`w-10 h-5 rounded-full relative transition-colors ${broadcastChannels.facebook ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                                       <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${broadcastChannels.facebook ? 'translate-x-5' : ''}`}></div>
                                   </div>
                               </label>
                               <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:bg-black/60 transition-colors">
                                   <div className="flex items-center gap-3">
                                       <div className={`p-2 rounded-lg ${broadcastChannels.instagram ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-500'}`}><Instagram size={18}/></div>
                                       <span className="font-bold text-sm text-gray-300">Instagram</span>
                                   </div>
                                   <div onClick={() => setBroadcastChannels(p => ({...p, instagram: !p.instagram}))} className={`w-10 h-5 rounded-full relative transition-colors ${broadcastChannels.instagram ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                                       <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${broadcastChannels.instagram ? 'translate-x-5' : ''}`}></div>
                                   </div>
                               </label>
                           </div>
                       </div>

                       <button 
                           onClick={handlePublish}
                           disabled={published}
                           className={`w-full py-4 rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all ${published ? 'bg-green-600 text-white' : 'bg-cyan-600 text-white hover:bg-cyan-500'}`}
                       >
                           {published ? <span className="flex items-center justify-center gap-2"><Check/> TRANSMITTED</span> : <span className="flex items-center justify-center gap-2"><Send/> BROADCAST OFFER</span>}
                       </button>
                   </div>
               ) : (
                   <div className="text-center py-10">
                       <div className="w-24 h-24 rounded-full border border-orange-500/30 flex items-center justify-center mx-auto mb-6 bg-gradient-to-b from-orange-500/10 to-transparent">
                           <Wand2 size={32} className="text-orange-500" />
                       </div>
                       <h3 className="text-white text-xl font-bold mb-2">AI Marketing Agent</h3>
                       <p className="text-gray-500 text-sm mb-8 px-6">Generate premium Bengali copy optimized for social engagement.</p>
                       <button onClick={handleGenerate} disabled={loading} className="px-8 py-3 rounded-full bg-orange-600 text-white font-bold shadow-lg hover:scale-105 transition-transform flex items-center mx-auto gap-2">
                           {loading ? <Loader2 className="animate-spin"/> : <Wand2 size={18}/>} Generate Magic
                       </button>
                   </div>
               )}
           </div>
        )}
      </div>
    </div>
  );
};