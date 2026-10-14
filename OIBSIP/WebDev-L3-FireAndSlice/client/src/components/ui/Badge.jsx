const Badge = ({ 
  children, 
  variant = 'gray', 
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary-container text-on-primary',
    success: 'bg-emerald-900/40 text-emerald-300 border border-emerald-800',
    warning: 'bg-amber-900/30 text-amber-300 border border-amber-800',
    danger: 'bg-error-container/40 text-error border border-error/30',
    info: 'bg-surface-container text-ember-glow border border-surface-border',
    gray: 'bg-surface-container text-ash-muted border border-surface-border',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-widest ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;