"use client";

import React from 'react';
import Link from 'next/link';
import { Wallet, Twitter, Github, ExternalLink, Zap, BarChart2, Database, Shield, Wrench, Home, Mail, Info, Lock, Send, ChevronRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const mainLinks = [
    { name: 'Mitosis', href: '/mitosis', icon: BarChart2, color: 'bg-indigo-500' },
    { name: 'Monad', href: '/monad-testnet', icon: Zap, color: 'bg-purple-500' },
    { name: 'Web3 Tools', href: '/web3-tools', icon: Wrench, color: 'bg-rose-500' },
  ];

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/CWalletsx', icon: Twitter, color: 'bg-blue-500' },
    { name: 'Telegram', href: 'https://t.me/cwxstats', icon: Send, color: 'bg-blue-600' },
  ];

  const importantLinks = [
    { name: 'About Us', href: '/about', icon: Info, color: 'bg-blue-600' },
    { name: 'Contact Us', href: '/contact', icon: Mail, color: 'bg-green-600' },
    { name: 'Privacy Policy', href: '/privacy', icon: Lock, color: 'bg-purple-600' },
  ];

  return (
    <footer className="bg-gradient-to-b from-blue-50 to-indigo-50 border-t border-blue-100">
      {/* Telegram Join Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-extrabold text-white">Join Our Telegram Community</h3>
              <p className="mt-2 text-blue-100">Get real-time updates, support, and connect with other users</p>
            </div>
            <a 
              href="https://t.me/cwxstats" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center px-8 py-4 rounded-lg bg-white text-blue-600 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <Send className="h-6 w-6 mr-3" /> Join Telegram
            </a>
          </div>
        </div>
      </div>
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12">
          {/* Logo and description - 2 columns */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 transform transition-transform hover:shadow-xl">
              <Link href="/" className="flex items-center">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center transform rotate-12 shadow-lg">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    WalletsX
                  </span>
                  <span className="block text-xs font-medium text-blue-400 mt-0">Analytics & Tools</span>
                </div>
              </Link>
              <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent my-6"></div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Track your crypto wallets across multiple networks with our comprehensive analytics tools.
              </p>
              <div className="mt-8 flex space-x-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-4 ${item.color} rounded-xl text-white shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300`}
                    >
                      <span className="sr-only">{item.name}</span>
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Tools Navigation - 2 columns */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 h-full transform transition-transform hover:shadow-xl">
              <h3 className="text-xl font-extrabold text-gray-800 mb-8 flex items-center">
                <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Wrench className="h-5 w-5 text-blue-600" />
                </span>
                Tools & Networks
              </h3>
              <ul className="space-y-5">
                {mainLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="flex items-center p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
                      >
                        <div className={`${item.color} p-3 rounded-xl text-white shadow-md group-hover:shadow-lg transition-all duration-300`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="ml-4 font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200">{item.name}</span>
                        <ChevronRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all duration-300" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          
          {/* Important Links - 2 columns */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Important Links
            </h3>
            <div className="grid gap-4">
              {importantLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform border-l-4 border-blue-600"
                  >
                    <div className={`${item.color} p-3 rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="ml-4 font-medium text-gray-800">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="mt-16 relative">
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
          <div className="pt-8 mt-3 bg-white/50 backdrop-blur-sm rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center shadow-sm">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mr-3">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <p className="text-base font-medium text-gray-600">
                &copy; {currentYear} <span className="text-blue-600">WalletsX</span>. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 md:space-x-8">
              <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                <Lock className="h-4 w-4 mr-1" /> Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                <Info className="h-4 w-4 mr-1" /> Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                <Mail className="h-4 w-4 mr-1" /> Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 