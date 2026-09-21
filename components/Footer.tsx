
import React from 'react';
import { COMPANY_NAME, CONTACT } from '../constants';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5">
      {/* SEO Content Block */}
      <div className="py-16 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white border border-white/20 flex items-center justify-center p-0.5 shadow-md overflow-hidden">
                  <img src="/logo.png" alt="Future Bound Tech Logo" className="w-full h-full object-contain scale-105" />
                </div>
                <span className="font-extrabold text-lg text-white">{COMPANY_NAME}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Future Bound Tech is the <strong className="text-gray-300">best software company in Nellore</strong>, Andhra Pradesh. We specialize in web development, mobile application development, custom software, and IT solutions — serving businesses across Nellore and the entire AP region.
              </p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Looking for a trusted <em>software company in Nellore</em>? FBT delivers end-to-end IT services including web developers in Nellore, application developers, mobile app development, software coaching, and financial compliance.
              </p>
              {/* Schema-friendly address */}
              <address className="not-italic mt-6 space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin size={14} className="text-blue-500 shrink-0" />
                  <span itemProp="address">Nellore, Andhra Pradesh, India — 524001</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone size={14} className="text-blue-500 shrink-0" />
                  <a href={`tel:+91${CONTACT.phone.replace(/\s/g,'')}`} className="hover:text-white transition-colors">+91 {CONTACT.phone}</a>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail size={14} className="text-blue-500 shrink-0" />
                  <a href={`mailto:${CONTACT.email}`} className="hover:text-white transition-colors">{CONTACT.email}</a>
                </div>
              </address>
            </div>

            {/* IT Services */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">IT Services in Nellore</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#services" className="hover:text-blue-400 transition-colors">Web Development — Nellore</a></li>
                <li><a href="#services" className="hover:text-blue-400 transition-colors">Mobile App Development</a></li>
                <li><a href="#services" className="hover:text-blue-400 transition-colors">Custom Software Solutions</a></li>
                <li><a href="#services" className="hover:text-blue-400 transition-colors">IT Consulting &amp; Solutions</a></li>
                <li><a href="#careers" className="hover:text-blue-400 transition-colors">Software Coaching — Nellore</a></li>
                <li><a href="#careers" className="hover:text-blue-400 transition-colors">IT Training Institute Nellore</a></li>
              </ul>
            </div>

            {/* Finance Services */}
            <div>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Financial Services</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#finance" className="hover:text-purple-400 transition-colors">GST Registration</a></li>
                <li><a href="#finance" className="hover:text-purple-400 transition-colors">GST Filing Services</a></li>
                <li><a href="#finance" className="hover:text-purple-400 transition-colors">IT Return Filing</a></li>
                <li><a href="#finance" className="hover:text-purple-400 transition-colors">LIC Policy Management</a></li>
                <li><a href="#contact" className="hover:text-purple-400 transition-colors">Tax Planning &amp; Advisory</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center">
              © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved. |{' '}
              <span className="text-gray-600">Best Software Company in Nellore, Andhra Pradesh</span>
            </p>

            <div className="flex space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a
                href="/admin-mb"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/admin-mb');
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="text-blue-500/80 hover:text-blue-400 transition-colors font-medium flex items-center gap-1"
              >
                Admin Portal
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
