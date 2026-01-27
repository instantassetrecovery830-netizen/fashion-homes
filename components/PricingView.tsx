import React from 'react';
import { Check, ArrowRight, Diamond } from 'lucide-react';
import { ViewState } from '../types';

interface PricingViewProps {
  onNavigate: (view: ViewState) => void;
  onLogin: () => void;
}

const PLANS = [
  {
    name: "The Essential",
    price: "$15",
    period: "/ month",
    description: "Curated access to the digital marketplace and seasonal trends.",
    features: [
      "Access to all New Arrivals",
      "Standard Shipping Rates",
      "Basic Trend Forecasts",
      "Member-only Newsletter"
    ],
    cta: "Join Monthly",
    highlight: false
  },
  {
    name: "The Insider",
    price: "$90",
    period: "/ 6 months",
    description: "Priority access for the dedicated fashion enthusiast.",
    features: [
      "24h Early Access to Drops",
      "Priority Shipping",
      "AI Style Curator Access",
      "Private Sale Invites",
      "Exclusive Editorial Content"
    ],
    cta: "Select Semi-Annual",
    highlight: false
  },
  {
    name: "The Collector",
    price: "$165",
    period: "/ year",
    description: "The ultimate luxury experience with white-glove service.",
    features: [
      "All Insider Features",
      "Free Global Express Shipping",
      "Dedicated Personal Stylist",
      "Custom Sizing Requests",
      "VIP Event Invitations"
    ],
    cta: "Become a Collector",
    highlight: true
  }
];

export const PricingView: React.FC<PricingViewProps> = ({ onNavigate, onLogin }) => {
  return (
    <div className="min-h-screen bg-luxury-cream pt-24 pb-24 animate-fade-in">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-luxury-gold mb-4 block">MyFitStore Membership</span>
        <h1 className="text-5xl md:text-7xl font-serif italic mb-6">Unlock Privilege</h1>
        <p className="max-w-2xl mx-auto text-gray-500 font-light text-lg">
          Select your tier to access the MyFitStore ecosystem. Elevate your experience with exclusive drops, personalized curation, and white-glove service.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, index) => (
            <div 
              key={index} 
              className={`relative p-8 md:p-12 flex flex-col transition-all duration-500 hover:-translate-y-2 ${
                plan.highlight 
                  ? 'bg-luxury-black text-white shadow-2xl scale-105 z-10' 
                  : 'bg-white text-luxury-black border border-gray-100 shadow-sm hover:shadow-xl'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-luxury-gold text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg">
                  <Diamond size={12} fill="currentColor" /> Best Value
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-serif italic mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-xs uppercase tracking-wide ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>{plan.period}</span>
                </div>
                <p className={`text-sm leading-relaxed ${plan.highlight ? 'text-gray-300' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-0.5 p-0.5 rounded-full ${plan.highlight ? 'bg-luxury-gold text-black' : 'bg-gray-100 text-black'}`}>
                      <Check size={10} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={onLogin}
                className={`w-full py-4 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors ${
                  plan.highlight 
                    ? 'bg-white text-black hover:bg-luxury-gold hover:text-white' 
                    : 'bg-black text-white hover:bg-luxury-gold'
                }`}
              >
                {plan.cta} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Preview or Trust Signals */}
        <div className="mt-24 text-center border-t border-gray-200 pt-16">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-8">Trusted by Global Ateliers</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
             {/* Mock Logos */}
             <span className="text-xl font-serif font-bold">VOGUE</span>
             <span className="text-xl font-serif font-bold">HYPEBEAST</span>
             <span className="text-xl font-serif font-bold">WWD</span>
             <span className="text-xl font-serif font-bold">BOF</span>
          </div>
        </div>
      </div>
    </div>
  );
};