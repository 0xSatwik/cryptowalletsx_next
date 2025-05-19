import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PortfolioItemProps } from './types';

export default function PortfolioItem({ title, value, change, positive, loading }: PortfolioItemProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">{title}</span>
        
        {loading ? (
          <div className="animate-pulse mt-1">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        ) : (
          <span className="text-xl font-semibold mt-1">{value}</span>
        )}
        
        {change && !loading && (
          <div className={`flex items-center mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
    </div>
  );
} 