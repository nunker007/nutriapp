import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner" role="status" aria-label="로딩 중">
    <div className="spinner-circle" aria-hidden="true" />
  </div>
);

export default LoadingSpinner;
