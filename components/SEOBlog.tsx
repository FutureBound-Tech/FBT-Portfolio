
import React, { useState } from "react";
import { BookOpen, ChevronRight, Lightbulb, Smartphone, GraduationCap, Globe } from "lucide-react";

interface BlogPost {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  body: string[];
  tags: string[];
  color: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "best-software-company-nellore",
    category: "About Us",
    title: "Why Future Bound Tech is the Best Software Company in Nellore",
    excerpt: "Discover what makes FBT the #1 choice for businesses in Nellore seeking expert IT solutions and software development.",
    body: [
      "Future Bound Tech has established itself as the most trusted and innovative software company in Nellore, Andhra Pradesh. Since our founding, we have been dedicated to delivering world-class software development services, IT solutions, and digital transformation strategies to businesses of all sizes across Nellore and the broader Andhra Pradesh region.",
      "What sets Future Bound Tech apart from other software companies in Nellore is our commitment to quality, speed, and results-driven development. Our team of expert web developers, mobile application developers, and IT consultants bring deep technical expertise and local market knowledge to every project.",
      "We understand the unique needs of Nellore businesses — from local enterprises looking to digitize operations to startups that need scalable, cost-effective software solutions. As a leading IT company in Nellore, we bridge the gap between global technology standards and local business requirements.",
      "Whether you need a custom web application, a mobile app for Android and iOS, an ERP system, or complete IT consulting, Future Bound Tech is the one-stop software company in Nellore that delivers on every promise."
    ],
    tags: ["Software Company Nellore", "IT Solutions Nellore", "Best IT Company Nellore"],
    color: "blue",
  },
  {
    id: "it-solutions-nellore",
    category: "IT Services",
    title: "Top IT Solutions & Web Development Services for Businesses in Nellore",
    excerpt: "From web development to mobile apps — explore the complete range of IT solutions Future Bound Tech offers businesses in Nellore.",
    body: [
      "As Nellore's most trusted IT solutions provider, Future Bound Tech offers a comprehensive portfolio of technology services designed to accelerate business growth. Our web development team in Nellore builds high-performance, responsive websites and web applications using cutting-edge technologies like React, Node.js, and cloud infrastructure.",
      "Our mobile application development team creates powerful Android and iOS apps tailored to the specific needs of businesses and consumers in Nellore. From e-commerce platforms to on-demand service apps, our mobile developers in Nellore deliver polished, scalable products that drive real results.",
      "For businesses seeking complete IT solutions in Nellore, we provide end-to-end services including custom ERP and CRM development, API integrations, legacy system modernization, and cloud deployment. Our IT consulting team works closely with Nellore-based businesses to understand their challenges and design technology solutions that create competitive advantages.",
      "Future Bound Tech also provides UI/UX design, App Store Optimization, and ongoing maintenance and support services — making us the most comprehensive software company in Nellore for all your digital needs."
    ],
    tags: ["Web Developers Nellore", "Mobile App Development Nellore", "IT Services Nellore"],
    color: "purple",
  },
  {
    id: "software-coaching-nellore",
    category: "Training & Coaching",
    title: "Software Coaching & IT Training in Nellore — Launch Your Tech Career with FBT",
    excerpt: "FBT's software coaching program in Nellore transforms beginners into industry-ready developers. Start your IT career today.",
    body: [
      "Future Bound Tech is not just a software company in Nellore — we are also one of the premier software coaching and IT training institutes in the region. Our structured coaching programs are designed to equip aspiring developers and IT professionals with the practical skills needed to succeed in today's competitive technology industry.",
      "Our software coaching curriculum in Nellore covers Full Stack Development, Backend Development, Artificial Intelligence, Data Analytics, SAP, and other cutting-edge IT domains. Whether you are a fresh graduate or a working professional looking to upskill, our expert trainers provide hands-on, industry-aligned training.",
      "As a coaching institute in Nellore rooted in real-world software development, FBT gives students a unique advantage — they learn from active developers who build production systems daily. This practical approach ensures our students are job-ready from day one, with strong foundations in coding, problem-solving, and modern development workflows.",
      "We also offer career guidance, internship opportunities, and mentorship through our growing network of industry partners. If you are looking for the best software coaching institute in Nellore, Future Bound Tech is your destination."
    ],
    tags: ["Software Coaching Nellore", "Coaching Institute Nellore", "IT Training Nellore"],
    color: "emerald",
  },
  {
    id: "mobile-app-developers-nellore",
    category: "Mobile & Web",
    title: "Mobile Application & Web Developers in Nellore — Custom Digital Solutions",
    excerpt: "Need mobile app developers in Nellore? FBT builds native Android & iOS apps, PWAs, and scalable web platforms for local businesses.",
    body: [
      "In today's mobile-first world, having a powerful mobile application is no longer optional — it's essential. Future Bound Tech is the go-to company for mobile application development in Nellore, offering bespoke Android and iOS app development services that combine beautiful design with flawless functionality.",
      "Our mobile app developers in Nellore have delivered applications across industries including retail, healthcare, education, logistics, and finance. Using both native and hybrid frameworks, we build apps that perform reliably, load quickly, and delight users across all device types and screen sizes.",
      "For web development, our team of expert web developers in Nellore creates Progressive Web Apps (PWAs), SaaS platforms, e-commerce stores, and enterprise portals. Every application we deliver is optimized for performance, accessibility, and search engine visibility — ensuring your business not only functions well but also ranks well on Google.",
      "Future Bound Tech combines powerful application development with strategic IT consulting to help Nellore businesses achieve meaningful digital transformation. If you are searching for application developers in Nellore who truly understand your business goals, connect with our team today."
    ],
    tags: ["Mobile App Developers Nellore", "Application Developers Nellore", "Web Development Nellore"],
    color: "orange",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; hover: string }> = {
  blue: { bg: "bg-blue-500/5", border: "border-blue-500/20", text: "text-blue-400", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", hover: "hover:border-blue-500/50 hover:shadow-blue-500/10" },
  purple: { bg: "bg-purple-500/5", border: "border-purple-500/20", text: "text-purple-400", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20", hover: "hover:border-purple-500/50 hover:shadow-purple-500/10" },
  emerald: { bg: "bg-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", hover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10" },
  orange: { bg: "bg-orange-500/5", border: "border-orange-500/20", text: "text-orange-400", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20", hover: "hover:border-orange-500/50 hover:shadow-orange-500/10" },
};

const iconMap: Record<string, React.ReactNode> = {
  "best-software-company-nellore": <Lightbulb className="w-5 h-5" />,
  "it-solutions-nellore": <Globe className="w-5 h-5" />,
  "software-coaching-nellore": <GraduationCap className="w-5 h-5" />,
  "mobile-app-developers-nellore": <Smartphone className="w-5 h-5" />,
};

const SEOBlog: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section id="blog" className="pt-8 pb-6 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
            <BookOpen size={14} />
            Insights from Nellore&apos;s Leading Software Company
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
            IT Expertise &amp; <span className="gradient-text">Nellore Insights</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Learn why Future Bound Tech is the most trusted software company, IT solutions provider, and software coaching institute in Nellore, Andhra Pradesh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((post) => {
            const c = colorMap[post.color];
            const isExpanded = expandedId === post.id;
            return (
              <article
                key={post.id}
                id={`blog-${post.id}`}
                className={`group rounded-[2rem] border ${c.border} ${c.bg} ${c.hover} hover:shadow-2xl transition-all duration-500 overflow-hidden`}
              >
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-xl border ${c.badge}`}>
                      {iconMap[post.id]}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${c.text}`}>{post.category}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold mb-3 leading-snug text-white">
                    {post.title}
                  </h3>

                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {post.excerpt}
                  </p>

                  {isExpanded && (
                    <div className="space-y-3 mb-6 border-t border-white/5 pt-4">
                      {post.body.map((para, i) => (
                        <p key={i} className="text-gray-300 text-sm leading-relaxed">{para}</p>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium uppercase tracking-wider text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : post.id)}
                    className={`flex items-center gap-1 text-xs font-bold uppercase tracking-widest ${c.text} hover:opacity-80 transition-opacity`}
                  >
                    {isExpanded ? "Show Less" : "Read Full Article"}
                    <ChevronRight size={14} className={`transition-transform ${isExpanded ? "rotate-90" : "group-hover:translate-x-1"}`} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 text-center p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
          <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
            <strong className="text-white">Future Bound Tech</strong> — Nellore&apos;s premier{" "}
            <strong className="text-blue-400">software company</strong>,{" "}
            <strong className="text-purple-400">IT solutions provider</strong>, and{" "}
            <strong className="text-emerald-400">software coaching institute</strong>.{" "}
            Serving businesses across Nellore, Andhra Pradesh and all of India with world-class technology and financial services.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SEOBlog;
