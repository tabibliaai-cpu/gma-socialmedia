'use client';

import { useState } from 'react';
import { Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  label: string;
  value: string;
  isSecret?: boolean;
  showCopy?: boolean;
  showRegenerate?: boolean;
  onRegenerate?: () => void;
}

export default function CredentialField({
  label,
  value,
  isSecret = false,
  showCopy = true,
  showRegenerate = false,
  onRegenerate,
}: Props) {
  const [showValue, setShowValue] = useState(!isSecret);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  };

  const maskedValue = isSecret && !showValue 
    ? '•'.repeat(Math.min(value.length, 20)) 
    : value;

  return (
    <div className="bg-dark-300 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <div className="flex items-center space-x-2">
        <code className="flex-1 bg-dark-200 px-3 py-2 rounded text-sm text-gray-300 font-mono overflow-x-auto">
          {maskedValue}
        </code>
        {isSecret && (
          <button
            onClick={() => setShowValue(!showValue)}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded"
          >
            {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {showCopy && (
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded"
          >
            <Copy className="h-4 w-4" />
          </button>
        )}
        {showRegenerate && onRegenerate && (
          <button
            onClick={onRegenerate}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
