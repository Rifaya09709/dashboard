import React from 'react';

interface BadgeProps { label: string; className?: string; }

const Badge: React.FC<BadgeProps> = ({ label, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${className}`}>
    {label}
  </span>
);

export default Badge;