'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { HelpCircle, MessageCircle, Mail, FileText, ChevronRight, ExternalLink } from 'lucide-react';

const helpCategories = [
  {
    icon: MessageCircle,
    title: 'Getting Started',
    description: 'Learn the basics of using the platform',
    href: '/help/getting-started',
  },
  {
    icon: FileText,
    title: 'Account & Profile',
    description: 'Manage your account settings',
    href: '/help/account',
  },
  {
    icon: Mail,
    title: 'Messaging & Chat',
    description: 'Learn about messaging features',
    href: '/help/messaging',
  },
  {
    icon: HelpCircle,
    title: 'Privacy & Security',
    description: 'Keep your account secure',
    href: '/help/security',
  },
];

const faqs = [
  {
    question: 'How do I verify my account?',
    answer: 'Go to Settings > Profile and click on "Request Verification". You\'ll need to provide some information to verify your identity.',
  },
  {
    question: 'How do I enable paid chat?',
    answer: 'If you have a Creator or Business account, go to Settings > Privacy and toggle on "Enable Paid Chat". Set your price per message.',
  },
  {
    question: 'What is Nuclear Block?',
    answer: 'Nuclear Block removes all message history between you and another user. It\'s useful when you want to completely cut off contact.',
  },
  {
    question: 'How do I create an ad?',
    answer: 'Business accounts can create ads from the Ads Manager. Go to /ads and click "Create Ad".',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-dark-300">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center">
          <HelpCircle className="h-6 w-6 mr-2" />
          Help Center
        </h1>
        <p className="text-gray-400 mb-8">Find answers to common questions</p>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for help..."
            className="w-full px-4 py-4 bg-dark-200 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {helpCategories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="bg-dark-200 rounded-xl p-4 hover:bg-dark-100 transition-colors flex items-start space-x-4"
            >
              <category.icon className="h-6 w-6 text-primary-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{category.title}</h3>
                <p className="text-sm text-gray-400">{category.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </Link>
          ))}
        </div>

        {/* FAQs */}
        <div className="bg-dark-200 rounded-xl p-4 mb-8">
          <h2 className="font-semibold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group">
                <summary className="flex items-center justify-between cursor-pointer p-3 bg-dark-300 rounded-lg hover:bg-dark-100">
                  <span className="text-white font-medium">{faq.question}</span>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 px-3 text-gray-400 text-sm">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-dark-200 rounded-xl p-4">
          <h2 className="font-semibold text-white mb-4">Still need help?</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/support"
              className="flex-1 flex items-center justify-center space-x-2 p-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Contact Support</span>
            </Link>
            <a
              href="mailto:support@socialapp.com"
              className="flex-1 flex items-center justify-center space-x-2 p-4 bg-dark-300 text-white rounded-xl hover:bg-dark-100"
            >
              <Mail className="h-5 w-5" />
              <span>Email Us</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
