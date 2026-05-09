import React from 'react';

interface BigTouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

const BigTouchButton: React.FC<BigTouchButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  'aria-label': ariaLabel,
}) => (
  <button
    className={`big-touch-btn big-touch-btn--${variant} big-touch-btn--${size}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
  >
    {icon && <span className="btn-icon" aria-hidden="true">{icon}</span>}
    {children}
  </button>
);

export default BigTouchButton;
