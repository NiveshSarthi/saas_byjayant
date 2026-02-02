import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';

const CustomSelect = ({
    options = [],
    value,
    onChange,
    placeholder = 'Select option',
    label,
    id,
    name,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        if (disabled) return;
        const val = option.value !== undefined ? option.value : option.id;
        onChange({ target: { name, value: val } });
        setIsOpen(false);
    };

    return (
        <div className="input-group" style={{ position: 'relative' }} ref={dropdownRef}>
            {label && <label htmlFor={id}>{label}</label>}
            <div
                id={id}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    background: 'var(--bg-primary)',
                    border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-full)',
                    padding: 'var(--space-sm) var(--space-md)',
                    color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all var(--transition-fast)',
                    opacity: disabled ? 0.5 : 1,
                    boxShadow: isOpen ? '0 0 0 3px var(--accent-glow-soft)' : 'none',
                    minHeight: '42px'
                }}
                className="custom-select-trigger"
            >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedOption ? (selectedOption.label || selectedOption.name || selectedOption.title) : placeholder}
                </span>
                <Icons.ChevronDown
                    size={16}
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform var(--transition-base)',
                        color: 'var(--text-secondary)'
                    }}
                />
            </div>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 5px)',
                        left: 0,
                        right: 0,
                        background: '#0b0b0f', // Pure black as requested
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1000,
                        maxHeight: '250px',
                        overflowY: 'auto',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                    className="custom-select-options shadow-glow"
                >
                    {options.length > 0 ? (
                        options.map((option, index) => {
                            const optValue = option.value !== undefined ? option.value : option.id;
                            const isSelected = optValue === value;
                            return (
                                <div
                                    key={index}
                                    onClick={() => handleSelect(option)}
                                    style={{
                                        padding: 'var(--space-sm) var(--space-md)',
                                        color: isSelected ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                                        fontSize: '0.875rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 122, 24, 0.15)';
                                            e.currentTarget.style.color = 'white';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--text-secondary)';
                                        }
                                    }}
                                >
                                    {option.label || option.name || option.title}
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ padding: 'var(--space-sm) var(--space-md)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
