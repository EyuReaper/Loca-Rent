import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-solid rounded-full animate-spin border-primary border-r-transparent"></div>
    </div>
  );
};

export default Spinner;