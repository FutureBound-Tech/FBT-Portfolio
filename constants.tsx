
import React from 'react';
import { 
  Globe, 
  Smartphone, 
  Cpu, 
  FileText, 
  ShieldCheck, 
  Layers, 
  Calculator, 
  HeartHandshake,
  Code2,
  BarChart3,
  Zap,
  Lock
} from 'lucide-react';
import { Service, Project, ContactInfo } from './types';

export const COMPANY_NAME = "Future Bound Tech";
export const ADMIN_EMAIL = "futurebound.tech@gmail.com";

export const CONTACT: ContactInfo = {
  phone: "99512 99524",
  email: "info@futureboundtech.online",
  address: "Nellore, Andhra Pradesh",
  location: "India"
};

/**
 * EMAILJS CONFIGURATION
 * Your EmailJS credentials:
 * - Public Key (API Key): 7SV2Z2LgC1GENjNY_
 * - Admin Email: futurebound.tech@gmail.com
 * 
 * To set up email templates in EmailJS dashboard:
 * 1. Create a service in EmailJS (e.g., Gmail or any SMTP service)
 * 2. Create two email templates:
 *    - "appointment_template" for appointment booking
 *    - "contact_template" for contact form submissions
 * 
 * Template variables for appointment:
 * - {{client_name}} - Client's name
 * - {{client_email}} - Client's email
 * - {{appointment_date}} - Selected date
 * - {{appointment_time}} - Selected time
 * - {{service_type}} - Selected service
 * - {{meet_link}} - Generated meeting link
 * - {{company_name}} - Future Bound Tech
 * 
 * Template variables for contact:
 * - {{from_name}} - Sender's name
 * - {{from_email}} - Sender's email
 * - {{subject}} - Message subject
 * - {{message}} - Message content
 * - {{company_name}} - Future Bound Tech
 */
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_ifj3zce',
  PUBLIC_KEY: '7SV2Z2LgC1GENjNY_',
  APPOINTMENT_TEMPLATE_ID: 'template_vu8msan', // Your appointment template ID
  CONTACT_TEMPLATE_ID: 'template_za9og46', // Your contact template ID
  CAREER_TEMPLATE_ID: 'template_za9og46' // Career form template ID (can be customized)
};

export const STATIC_MEET_LINK = 'https://meet.google.com/koi-medw-gni';

export const CAREER_DOMAINS = [
  'Full Stack Development',
  'Backend Development',
  'Artificial Intelligence (AI)',
  'Data Analyst',
  'SAP',
  'Other IT Domains'
];

export const CORPORATE_TIME_SLOTS = [
  // Morning Session (8 slots)
  { id: 'm1', label: '09:00 AM - 09:30 AM', time: '09:00 AM', session: 'morning' },
  { id: 'm2', label: '09:30 AM - 10:00 AM', time: '09:30 AM', session: 'morning' },
  { id: 'm3', label: '10:00 AM - 10:30 AM', time: '10:00 AM', session: 'morning' },
  { id: 'm4', label: '10:30 AM - 11:00 AM', time: '10:30 AM', session: 'morning' },
  { id: 'm5', label: '11:00 AM - 11:30 AM', time: '11:00 AM', session: 'morning' },
  { id: 'm6', label: '11:30 AM - 12:00 PM', time: '11:30 AM', session: 'morning' },
  { id: 'm7', label: '12:00 PM - 12:30 PM', time: '12:00 PM', session: 'morning' },
  { id: 'm8', label: '12:30 PM - 01:00 PM', time: '12:30 PM', session: 'morning' },
  // Afternoon Session (8 slots)
  { id: 'a1', label: '02:00 PM - 02:30 PM', time: '02:00 PM', session: 'afternoon' },
  { id: 'a2', label: '02:30 PM - 03:00 PM', time: '02:30 PM', session: 'afternoon' },
  { id: 'a3', label: '03:00 PM - 03:30 PM', time: '03:00 PM', session: 'afternoon' },
  { id: 'a4', label: '03:30 PM - 04:00 PM', time: '03:30 PM', session: 'afternoon' },
  { id: 'a5', label: '04:00 PM - 04:30 PM', time: '04:00 PM', session: 'afternoon' },
  { id: 'a6', label: '04:30 PM - 05:00 PM', time: '04:30 PM', session: 'afternoon' },
  { id: 'a7', label: '05:00 PM - 05:30 PM', time: '05:00 PM', session: 'afternoon' },
  { id: 'a8', label: '05:30 PM - 06:00 PM', time: '05:30 PM', session: 'afternoon' },
];

export interface DetailedService extends Service {
  features: string[];
}

export const SERVICES: DetailedService[] = [
  {
    id: 'web-dev',
    title: 'Web Application',
    description: 'High-performance, scalable web ecosystems built with modern stacks like React, Node, and Cloud infrastructure.',
    icon: 'globe',
    category: 'tech',
    features: ['SaaS Development', 'E-commerce Platforms', 'Progressive Web Apps']
  },
  {
    id: 'mobile-dev',
    title: 'Mobile Application',
    description: 'Bespoke iOS and Android experiences designed for maximum engagement and seamless performance.',
    icon: 'smartphone',
    category: 'tech',
    features: ['Native & Hybrid Apps', 'UI/UX Design', 'App Store Optimization']
  },
  {
    id: 'custom-soft',
    title: 'Custom Software',
    description: 'Tailor-made enterprise solutions that solve complex business challenges with precision engineering.',
    icon: 'cpu',
    category: 'tech',
    features: ['ERP & CRM Systems', 'API Integrations', 'Legacy Modernization']
  },
  {
    id: 'it-return',
    title: 'IT Return Filing',
    description: 'Expert income tax return processing ensuring compliance and maximizing your returns with professional oversight.',
    icon: 'file-text',
    category: 'finance',
    features: ['Individual & Business', 'Tax Planning', 'Audit Support']
  },
  {
    id: 'gst-reg',
    title: 'GST Registration',
    description: 'Hassle-free GST enrollment and structural setup for businesses of all sizes across India.',
    icon: 'layers',
    category: 'finance',
    features: ['Fresh Registration', 'Amendment Services', 'Consultation']
  },
  {
    id: 'gst-filing',
    title: 'GST Filing',
    description: 'Accurate and timely GST return submission to keep your business fully compliant and transparent.',
    icon: 'calculator',
    category: 'finance',
    features: ['Monthly Returns', 'Annual Reconciliations', 'Notice Resolution']
  },
  {
    id: 'lic-policy',
    title: 'LIC Policy',
    description: 'Comprehensive life insurance solutions and policy management to secure your family\'s financial future.',
    icon: 'heart-handshake',
    category: 'finance',
    features: ['Term & Life Insurance', 'Premium Reminders', 'Claim Assistance']
  }
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'OmniChain ERP',
    description: 'A futuristic supply chain management platform with real-time tracking and automated inventory.',
    image: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?q=80&w=1000&auto=format&fit=crop',
    tags: ['Next.js', 'PostgreSQL', 'Cloud']
  },
  {
    id: 'p2',
    title: 'Aura-Shop E-commerce',
    description: 'Premium shopping experience with AI-driven recommendations and ultra-fast checkout.',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1000&auto=format&fit=crop',
    tags: ['React', 'Stripe', 'Tailwind']
  },
  {
    id: 'p3',
    title: 'TaxFlow Pro',
    description: 'A specialized dashboard for finance professionals to track multi-client GST filings and IT returns.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000&auto=format&fit=crop',
    tags: ['Dashboard', 'React', 'Analytics']
  }
];

export const getIcon = (name: string) => {
  switch (name) {
    case 'globe': return <Globe className="w-6 h-6" />;
    case 'smartphone': return <Smartphone className="w-6 h-6" />;
    case 'cpu': return <Cpu className="w-6 h-6" />;
    case 'file-text': return <FileText className="w-6 h-6" />;
    case 'layers': return <Layers className="w-6 h-6" />;
    case 'calculator': return <Calculator className="w-6 h-6" />;
    case 'heart-handshake': return <HeartHandshake className="w-6 h-6" />;
    case 'code': return <Code2 className="w-6 h-6" />;
    case 'chart': return <BarChart3 className="w-6 h-6" />;
    case 'cloud': return <Zap className="w-6 h-6" />;
    case 'lock': return <Lock className="w-6 h-6" />;
    default: return <ShieldCheck className="w-6 h-6" />;
  }
};
