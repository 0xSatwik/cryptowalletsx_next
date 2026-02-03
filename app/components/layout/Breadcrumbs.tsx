"use client";

import React from 'react';
import Link from 'next/link';
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

    return (
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li className="flex items-center">
                    <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                        <Home className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Home</span>
                    </Link>
                </li>

                {pathSegments.map((segment, index) => {
                    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathSegments.length - 1;

                    return (
                        <li key={href} className="flex items-center">
                            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                            {isLast ? (
                                <span className="font-semibold text-blue-600 truncate max-w-[150px] sm:max-w-none">
                                    {formatSegment(segment)}
                                </span>
                            ) : (
                                <Link href={href} className="hover:text-blue-600 transition-colors">
                                    {formatSegment(segment)}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
