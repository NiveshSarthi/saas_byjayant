import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '' }) => {
    const classes = [
        'badge',
        `badge-${variant}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {children}
        </span>
    );
};

export default Badge;
