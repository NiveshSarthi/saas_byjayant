import React from 'react';

const Toggle = ({ checked, onChange, label, disabled = false }) => {
    return (
        <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1
        }}>
            <div className="toggle">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                />
                <span className="toggle-slider"></span>
            </div>
            {label && (
                <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)'
                }}>
                    {label}
                </span>
            )}
        </label>
    );
};

export default Toggle;
