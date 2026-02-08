"use client";

import React from 'react';
import Link from '@/app/components/Link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
    const pathname = usePathname();

    // Don't show breadcrumbs on the home page
    if (pathname === '/') return null;

    const pathSegments = pathname.split('/').filter(segment => segment !== '');

    // Function to format segment names (e.g., 'monad-testnet' -> 'Monad Testnet')
    const formatSegment = (segment: string) => {
        return segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Generate BreadcrumbList Schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://cryptowalletsx.com"
            },
            ...pathSegments.map((segment, index) => ({
                "@type": "ListItem",
                "position": index + 2,
                "name": formatSegment(segment),
                "item": `https://cryptowalletsx.com/${pathSegments.slice(0, index + 1).join('/')}`
            }))
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <nav className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100" aria-label="Breadcrumb">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ol className="flex items-center h-10 space-x-1 text-sm">
                        <li className="flex items-center">
                            <Link
                                href="/"
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            >
                                <Home className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline font-medium">Home</span>
                            </Link>
                        </li>

                        {pathSegments.map((segment, index) => {
                            const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
                            const isLast = index === pathSegments.length - 1;

                            return (
                                <li key={href} className="flex items-center">
                                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                    {isLast ? (
                                        <span className="ml-1 px-2 py-1 rounded-md font-semibold text-blue-600 bg-blue-50 truncate max-w-[180px] sm:max-w-none">
                                            {formatSegment(segment)}
                                        </span>
                                    ) : (
                                        <Link
                                            href={href}
                                            className="ml-1 px-2 py-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium"
                                        >
                                            {formatSegment(segment)}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </nav>
        </>
    );
};

export default Breadcrumbs;
