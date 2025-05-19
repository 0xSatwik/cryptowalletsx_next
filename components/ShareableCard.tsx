import React from 'react';
import { Trophy, Wallet } from 'lucide-react';

interface ShareableCardProps {
  mitoBalance: string;
  wmitoBalance: string;
  totalBalance: string;
  rank: number | null;
  totalWallets: number;
}

export function ShareableCard({ mitoBalance, wmitoBalance, totalBalance, rank, totalWallets }: ShareableCardProps) {
  return (
    <div id="shareable-card" className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-purple-600">My Mitosis Stats</h2>
        <p className="text-sm text-gray-500">cryptowalletsx.com</p>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
          <Wallet className="text-green-500 flex-shrink-0" size={32} />
          <div>
            <p className="text-sm text-gray-600">MITO Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {Number(mitoBalance).toLocaleString()} MITO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
          <Wallet className="text-blue-500 flex-shrink-0" size={32} />
          <div>
            <p className="text-sm text-gray-600">WMITO Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {Number(wmitoBalance).toLocaleString()} WMITO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
          <Wallet className="text-purple-500 flex-shrink-0" size={32} />
          <div>
            <p className="text-sm text-gray-600">Total Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {Number(totalBalance).toLocaleString()} MITO
            </p>
          </div>
        </div>

        {rank !== null && (
          <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
            <Trophy className="text-yellow-500 flex-shrink-0" size={32} />
            <div>
              <p className="text-sm text-gray-600">Rank</p>
              <p className="text-2xl font-bold text-gray-900">
                #{rank.toLocaleString()}
              </p>
              <p className="text-sm font-medium text-purple-600">
                Top {((rank * 100) / totalWallets).toFixed(2)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}