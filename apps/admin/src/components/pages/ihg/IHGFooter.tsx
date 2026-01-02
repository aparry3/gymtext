import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { GymTextWordmark } from './GymTextLogo';
import { EvenLogo } from './EvenLogo';

const IHGFooter: React.FC = () => {
  return (
    <footer className="bg-emerald-950 text-emerald-100/60 py-24 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="flex items-center space-x-6">
              <EvenLogo variant="white" className="h-10" />
              <span className="h-8 w-px bg-emerald-800"></span>
              <GymTextWordmark className="h-8" variant="white" />
            </div>
            <p className="max-w-md leading-relaxed font-light text-lg">
              At EVEN Hotels, we believe wellness should be integrated into every aspect of travel. Together with GymText, we&apos;re making it easier than ever to keep your balance.
            </p>
            <div className="flex space-x-5">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full border border-emerald-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-8">The Brand</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Our Philosophy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Athletic Studios</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Cork & Kale Dining</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Wellness Rooms</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-8">GymText Collaboration</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Partner FAQ</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">App Privacy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Hotel Integration</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Press & Media</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-emerald-900 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
          <p>&copy; {new Date().getFullYear()} EVEN Hotels & GymText Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default IHGFooter;
