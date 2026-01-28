
import React, { useState } from 'react';
import { Mail, MapPin, Phone, ArrowRight, Globe, Clock, Check, Loader } from 'lucide-react';
import { ViewState, LandingPageContent } from '../types';

interface AboutViewProps {
  onNavigate: (view: ViewState) => void;
  cmsContent?: LandingPageContent;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate, cmsContent }) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Fallback content if CMS not ready
  const about = cmsContent?.about || {
     hero: {
         title: "The Maison",
         subtitle: "Established 2024",
         description: "Bridging the gap between African heritage and global luxury through technology, curation, and craftsmanship.",
         imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop"
     },
     philosophy: {
         title: "Our Philosophy",
         description1: "MyFitStore was born from a desire to redefine the digital luxury experience. We believe that true luxury lies in the stories behind the seams. Our platform serves as a curated ecosystem for the world's most avant-garde designers, providing a stage where heritage meets innovation.",
         description2: "We are more than a marketplace; we are a cultural conduit. By integrating AI-driven styling with human curation, we offer a personalized journey that respects the individuality of both the creator and the collector.",
         image1: "https://images.unsplash.com/photo-1509319117116-31cf071916de?q=80&w=800",
         image2: "https://images.unsplash.com/photo-1537832816519-689ad163238b?q=80&w=800"
     },
     contact: {
         address: "24 Rue du Faubourg Saint-Honoré, 75008 Paris, France",
         email: "concierge@myfitstore.com",
         phone: "+33 1 42 68 53 00",
         hours: "Mon - Fri: 09:00 - 18:00 CET"
     }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormState({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSent(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen animate-fade-in bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden flex items-center justify-center bg-luxury-black">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={about.hero.imageUrl}
          alt="Atelier Environment" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="relative z-20 text-center text-white px-4">
          <span className="text-xs md:text-sm tracking-[0.3em] uppercase mb-4 block text-luxury-gold">{about.hero.subtitle}</span>
          <h1 className="text-4xl md:text-8xl font-serif italic mb-6">{about.hero.title}</h1>
          <p className="text-base md:text-lg font-light max-w-2xl mx-auto text-gray-200 leading-relaxed">
            {about.hero.description}
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-serif italic text-luxury-black">{about.philosophy.title}</h2>
              <div className="w-12 h-0.5 bg-luxury-gold" />
              <p className="text-gray-600 leading-relaxed font-light text-lg">
                {about.philosophy.description1}
              </p>
              <p className="text-gray-600 leading-relaxed font-light text-lg">
                {about.philosophy.description2}
              </p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <img src={about.philosophy.image1} className="w-full h-80 object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Detail 1" />
              <img src={about.philosophy.image2} className="w-full h-80 object-cover mt-12 grayscale hover:grayscale-0 transition-all duration-700" alt="Detail 2" />
           </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-luxury-cream py-16 md:py-24 px-6 border-y border-gray-100">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="text-center p-8 border border-transparent hover:border-gray-200 transition-colors">
                  <h3 className="text-xl font-serif italic mb-4">Curation</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Every piece on MyFitStore is hand-selected or AI-verified for authenticity, quality, and design integrity.</p>
               </div>
               <div className="text-center p-8 border border-transparent hover:border-gray-200 transition-colors">
                  <h3 className="text-xl font-serif italic mb-4">Innovation</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">We leverage generative AI to forecast trends and provide bespoke styling advice, merging tech with textile.</p>
               </div>
               <div className="text-center p-8 border border-transparent hover:border-gray-200 transition-colors">
                  <h3 className="text-xl font-serif italic mb-4">Sustainability</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">We champion made-to-order models and designers who prioritize ethical production and sustainable materials.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Contact / Concierge Section */}
      <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-luxury-gold mb-4 block">Concierge Services</span>
            <h2 className="text-3xl md:text-4xl font-serif italic text-luxury-black">Get in Touch</h2>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="bg-luxury-black text-white p-8 md:p-12 flex flex-col justify-between">
               <div className="space-y-8">
                  <h3 className="text-2xl font-serif italic">The Headquarters</h3>
                  <div className="space-y-6">
                     <div className="flex items-start gap-4">
                        <MapPin className="text-luxury-gold shrink-0 mt-1" size={20} />
                        <div>
                           <p className="font-bold text-sm uppercase tracking-wider mb-1">Address</p>
                           <p className="text-gray-400 text-sm font-light whitespace-pre-line">{about.contact.address}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <Mail className="text-luxury-gold shrink-0 mt-1" size={20} />
                        <div>
                           <p className="font-bold text-sm uppercase tracking-wider mb-1">Email</p>
                           <p className="text-gray-400 text-sm font-light">{about.contact.email}</p>
                           <p className="text-gray-400 text-sm font-light">partnerships@myfitstore.com</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <Phone className="text-luxury-gold shrink-0 mt-1" size={20} />
                        <div>
                           <p className="font-bold text-sm uppercase tracking-wider mb-1">Phone</p>
                           <p className="text-gray-400 text-sm font-light">{about.contact.phone}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <Clock className="text-luxury-gold shrink-0 mt-1" size={20} />
                        <div>
                           <p className="font-bold text-sm uppercase tracking-wider mb-1">Hours</p>
                           <p className="text-gray-400 text-sm font-light">{about.contact.hours}</p>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="mt-12 pt-12 border-t border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Connect with us</p>
                  <div className="flex gap-4">
                     {['Instagram', 'Twitter', 'LinkedIn'].map(social => (
                        <a key={social} href="#" className="text-sm font-bold border-b border-transparent hover:border-white hover:text-white transition-all text-gray-400 pb-0.5">{social}</a>
                     ))}
                  </div>
               </div>
            </div>

            {/* Form */}
            <div className="bg-gray-50 p-8 md:p-12">
               <h3 className="text-xl font-bold uppercase tracking-widest mb-8">Send a Request</h3>
               {isSent ? (
                 <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in min-h-[300px]">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                       <Check size={32} />
                    </div>
                    <h4 className="text-xl font-serif italic mb-2">Message Received</h4>
                    <p className="text-gray-500 text-sm max-w-xs">Thank you for contacting our concierge. A representative will respond to your inquiry within 24 hours.</p>
                 </div>
               ) : (
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Name</label>
                          <input 
                             required
                             value={formState.name}
                             onChange={e => setFormState({...formState, name: e.target.value})}
                             className="w-full bg-white border-b border-gray-200 py-3 px-2 text-sm focus:border-black outline-none transition-colors"
                             placeholder="John Doe"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email</label>
                          <input 
                             required
                             type="email"
                             value={formState.email}
                             onChange={e => setFormState({...formState, email: e.target.value})}
                             className="w-full bg-white border-b border-gray-200 py-3 px-2 text-sm focus:border-black outline-none transition-colors"
                             placeholder="john@example.com"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Subject</label>
                       <select 
                          value={formState.subject}
                          onChange={e => setFormState({...formState, subject: e.target.value})}
                          className="w-full bg-white border-b border-gray-200 py-3 px-2 text-sm focus:border-black outline-none transition-colors"
                       >
                          <option value="" disabled>Select a topic</option>
                          <option value="Client Services">Client Services</option>
                          <option value="Partnership">Brand Partnership</option>
                          <option value="Press">Press & Media</option>
                          <option value="Other">Other Inquiry</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Message</label>
                       <textarea 
                          required
                          value={formState.message}
                          onChange={e => setFormState({...formState, message: e.target.value})}
                          className="w-full bg-white border border-gray-200 p-4 text-sm focus:border-black outline-none transition-colors h-32 resize-none"
                          placeholder="How can we assist you?"
                       />
                    </div>
                    <button 
                       type="submit" 
                       disabled={isSubmitting}
                       className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                    >
                       {isSubmitting ? <Loader className="animate-spin" size={16} /> : <><span className="mt-0.5">Send Message</span> <ArrowRight size={16} /></>}
                    </button>
                 </form>
               )}
            </div>
         </div>
      </section>
    </div>
  );
};
