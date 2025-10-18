import React, { useState } from 'react';
import { deinit, isInitialized } from '../api/nexus';

interface DeinitButtonProps {
  className?: string;
  onDone?: () => void;
}

const DeinitButton: React.FC<DeinitButtonProps> = ({ className = '', onDone }) => {
  const [initialized, setInitialized] = useState(isInitialized());
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await deinit();
      setInitialized(false);
      onDone?.();
      alert('Nexus de-initialized successfully');
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? 'De-initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        !initialized
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-red-600 hover:bg-red-700 text-white'
      } ${className}`}
      onClick={handleClick}
      disabled={!initialized || loading}
    >
      {loading ? 'De-initializing...' : 'De-initialize Nexus'}
    </button>
  );
};

export default DeinitButton;
