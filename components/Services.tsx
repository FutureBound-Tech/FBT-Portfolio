
import React from 'react';
import { SERVICES, getIcon } from '../constants';
import { Code, TrendingUp, CheckCircle2 } from 'lucide-react';

const Services: React.FC = () => {
  const techServices = SERVICES.filter(s => s.category === 'tech');
  const financeServices = SERVICES.filter(s => s.category === 'finance');

  return (
    <section id="services" className="pt-8 pb-12 px-6 relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-blue-500 font-bold tracking-widest uppercase text-xs mb-3 block">Nellore's Leading IT Company</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">Expert IT Services &amp; Software Solutions in Nellore</h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Future Bound Tech — Nellore's most trusted software company — bridges the gap between complex software engineering and strategic financial compliance. Serving businesses across Nellore and Andhra Pradesh with world-class IT solutions.
          </p>
        </div>

        {/* Tech Section Highlight */}
        <div className="mb-14">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl shadow-blue-500/20">
              <Code size={32} />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold mb-1.5 tracking-tight">Web &amp; Software Development — Nellore</h3>
              <p className="text-blue-400 font-medium text-sm sm:text-base">Top-rated web developers &amp; mobile app developers in Nellore, building the infrastructure of tomorrow.</p>
            </div>
            <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techServices.map((service) => (
              <div 
                key={service.id} 
                className="group p-8 rounded-[2.5rem] glass border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden"
              >
                <div className="mb-6 inline-flex p-3.5 rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  {getIcon(service.icon)}
                </div>
                <h4 className="text-xl sm:text-2xl font-bold mb-3">{service.title}</h4>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                  {service.description}
                </p>
                <div className="space-y-2.5">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-gray-300">
                      <CheckCircle2 size={15} className="text-blue-500 shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Finance Section Highlight */}
        <div id="finance" className="relative">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl shadow-xl shadow-purple-500/20">
              <TrendingUp size={32} />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold mb-1.5 tracking-tight">Financial Management — Nellore</h3>
              <p className="text-purple-400 font-medium text-sm sm:text-base">Trusted financial services for businesses in Nellore — strategic compliance for sustainable growth.</p>
            </div>
            <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {financeServices.map((service) => (
              <div 
                key={service.id} 
                className="group p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-purple-600/5 hover:border-purple-500/30 transition-all duration-500"
              >
                <div className="mb-4 text-purple-500 group-hover:scale-110 transition-transform">
                  {getIcon(service.icon)}
                </div>
                <h4 className="text-lg sm:text-xl font-bold mb-2">{service.title}</h4>
                <p className="text-gray-400 text-xs sm:text-sm mb-5 leading-relaxed">
                  {service.description}
                </p>
                <div className="space-y-2 pt-4 border-t border-white/5">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="text-xs uppercase tracking-wider text-purple-400/90 font-semibold">
                      • {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
