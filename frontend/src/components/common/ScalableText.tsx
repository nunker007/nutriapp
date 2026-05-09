import React from 'react';

interface ScalableTextProps {
  children: React.ReactNode;
  className?: string;
}

const ScalableText: React.FC<ScalableTextProps> = ({ children, className }) => (
  <span className={`scalable-text ${className ?? ''}`}>{children}</span>
);

export default ScalableText;
