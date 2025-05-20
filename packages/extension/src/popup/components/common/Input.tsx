import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error = false,
      errorText,
      startAdornment,
      endAdornment,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // 입력 필드에 고유 ID 할당
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    // 입력 필드 클래스 결정
    const getInputClasses = () => {
      const classes = ['input'];
      
      if (error) {
        classes.push('input-error');
      }
      
      if (startAdornment) {
        classes.push('input-with-start-adornment');
      }
      
      if (endAdornment) {
        classes.push('input-with-end-adornment');
      }
      
      if (fullWidth) {
        classes.push('input-full-width');
      }
      
      if (className) {
        classes.push(className);
      }
      
      return classes.join(' ');
    };
    
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        
        <div className="input-container">
          {startAdornment && (
            <div className="input-adornment input-adornment-start">
              {startAdornment}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            className={getInputClasses()}
            aria-invalid={error}
            {...props}
          />
          
          {endAdornment && (
            <div className="input-adornment input-adornment-end">
              {endAdornment}
            </div>
          )}
        </div>
        
        {(helperText || (error && errorText)) && (
          <span className={`form-helper ${error ? 'form-helper-error' : ''}`}>
            {error ? errorText : helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
