import Link from 'next/link';
import { Twitter, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-bold text-purple-600">
              WalletsX
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Multi-chain analytics platform for tracking wallet activity across various networks.
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://twitter.com/CWalletsx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Twitter</span>
                <Twitter size={20} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">GitHub</span>
                <Github size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Tools
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/monad-testnet" className="text-base text-gray-500 hover:text-gray-900">
                  Monad Testnet
                </Link>
              </li>
              <li>
                <Link href="/linea" className="text-base text-gray-500 hover:text-gray-900">
                  Linea
                </Link>
              </li>
              <li>
                <Link href="/soneium" className="text-base text-gray-500 hover:text-gray-900">
                  Soneium
                </Link>
              </li>
              <li>
                <Link href="/megaeth" className="text-base text-gray-500 hover:text-gray-900">
                  MegaETH
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/articles" className="text-base text-gray-500 hover:text-gray-900">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/web3-tools" className="text-base text-gray-500 hover:text-gray-900">
                  Web3 Tools
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-base text-gray-500 hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-500">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-500">
              Terms of Service
            </Link>
          </div>
          <p className="mt-8 text-sm text-gray-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} WalletsX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 