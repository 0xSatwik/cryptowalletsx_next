'use client';

import { Mail, MessageSquare, Twitter, HelpCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Have questions, suggestions, or feedback? We'd love to hear from you! 
              Here are the best ways to reach the WalletsX team:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="mailto:team@cryptowalletsx.com"
                className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition-colors p-5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200"
              >
                <div className="bg-purple-100 p-3 rounded-full">
                  <Mail size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Email Us</p>
                  <p className="text-sm text-gray-600">team@cryptowalletsx.com</p>
                </div>
              </a>

              <a
                href="https://t.me/cwxstats"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors p-5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200"
              >
                <div className="bg-blue-100 p-3 rounded-full">
                  <MessageSquare size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Telegram</p>
                  <p className="text-sm text-gray-600">@cwxstats</p>
                </div>
              </a>

              <a
                href="https://x.com/CWalletsx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition-colors p-5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200"
              >
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Twitter size={24} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium">Twitter/X</p>
                  <p className="text-sm text-gray-600">@CWalletsx</p>
                </div>
              </a>

              <div className="flex items-center gap-3 text-gray-700 p-5 rounded-lg bg-gray-50 border border-gray-200">
                <div className="bg-green-100 p-3 rounded-full">
                  <HelpCircle size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Support</p>
                  <p className="text-sm text-gray-600">We typically respond within 24 hours</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Our Community</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Stay updated with our latest tools and features by joining our growing community on Telegram.
              We regularly share updates, collect feedback, and help users get the most out of our tools.
            </p>
            
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">WalletsX Stats Community</h3>
              <p className="mb-4 text-white/90">Join our Telegram community for updates, support, and discussions.</p>
              <a 
                href="https://t.me/cwxstats"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                <MessageSquare size={18} />
                Join Telegram
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}