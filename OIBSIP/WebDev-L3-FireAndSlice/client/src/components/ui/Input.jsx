import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  helperText,
  className = '',
  id,
  dark,
  rightElement,
  ...props 
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block mb-2 font-mono text-[11px] tracking-[0.14em] uppercase text-[#c7b9ad] font-semibold">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3.5 rounded-xl bg-[#181411] border ${
            error 
              ? 'border-error text-error placeholder:text-error/60 focus:border-error focus:ring-2 focus:ring-error/20' 
              : 'border-[#45382d] text-crust-cream placeholder:text-[#7d7266] focus:border-primary-container focus:ring-2 focus:ring-primary-container/25'
          } outline-none transition font-sans text-sm ${rightElement ? 'pr-12' : ''} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-error font-medium" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-xs text-[#9d9287]">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;