'use client';

import React from 'react';
import { Twitter, Facebook, Linkedin } from 'lucide-react';

interface SocialShareButtonsProps {
  title: string;
  url: string;
}

export default function SocialShareButtons({ title, url }: SocialShareButtonsProps) {
  return (
    <>
      <a 
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-600 hover:text-blue-400"
      >
        <Twitter size={18} />
      </a>
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-600 hover:text-blue-600"
      >
        <Facebook size={18} />
      </a>
      <a 
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-600 hover:text-blue-700"
      >
        <Linkedin size={18} />
      </a>
    </>
  );
} 