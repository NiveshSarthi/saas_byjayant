import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  elevated = false,
  interactive = false,
  onClick,
  style = {}
}) => {
  const classes = [
    'card',
    hover && 'card-hover',
    elevated && 'card-elevated',
    interactive && 'card-interactive',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;
