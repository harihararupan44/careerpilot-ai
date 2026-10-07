import React from 'react';
import { getStatusConfig } from '../../utils/formatters';

export default function StatusBadge({ status, size = 'md' }) {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-[11px] px-2.5 py-0.5 gap-1.5 font-semibold',
    lg: 'text-xs px-3 py-1 gap-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      <span>{config.label}</span>
    </span>
  );
}
