
import React from 'react';
import { ShieldCheck, Zap, Scale, Cpu } from 'lucide-react';

const Pillars: React.FC = () => {
  return (
    <section className="pt-4 pb-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Software Pillar */}
        <div className="relative group p-10 rounded-[3rem] overflow-hidden bg-blue-600/5 border border-blue-500/10 hover:border-blue-500/30 transition-all flex flex-col justify-between h-full">
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full group-hover:bg-blue-600/20 transition-colors"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-500/20">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">IT Solutions &amp; Software Development in Nellore</h3>
              <p className="text-gray-300 text-sm sm:text-base mb-8 leading-relaxed">
                As Nellore's leading software company, we don't just write code — we architect resilient systems that scale effortlessly. From cloud-native web applications to enterprise mobile solutions, our IT services in Nellore are built on modern tech stacks and agile execution.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-auto">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-blue-400 font-bold text-xl">99.9%</span>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Uptime Focus</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-blue-400 font-bold text-xl">Modern</span>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Tech Stacks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Finance Pillar */}
        <div className="relative group p-10 rounded-[3rem] overflow-hidden bg-purple-600/5 border border-purple-500/10 hover:border-purple-500/30 transition-all flex flex-col justify-between h-full">
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600/10 blur-3xl rounded-full group-hover:bg-purple-600/20 transition-colors"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white mb-8 shadow-lg shadow-purple-500/20">
                <Scale size={24} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Financial Compliance &amp; Advisory — Nellore</h3>
              <p className="text-gray-300 text-sm sm:text-base mb-8 leading-relaxed">
                Navigate the complex landscape of Indian taxation and insurance with total confidence. Our certified financial experts in Nellore ensure your business stays audit-ready, fully compliant, and fiscally optimized year-round.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-auto">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-purple-400 font-bold text-xl">Zero</span>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Compliance Risk</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-purple-400 font-bold text-xl">Expert</span>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mt-0.5">Advisory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pillars;
