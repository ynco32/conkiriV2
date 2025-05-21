import React from 'react';

interface TicketingSeatProps {
  x: number;
  y: number;
  width: number;
  height: number;
  number: string;
  status: 'AVAILABLE' | 'RESERVED';
  isSelected: boolean;
  onClick: () => void;
}

const TicketingSeat = ({
  x,
  y,
  width,
  height,
  number,
  status,
  isSelected,
  onClick,
}: TicketingSeatProps) => {
  const getFillColor = () => {
    if (status === 'RESERVED') return '#9E9E9E';
    return '#8B5CF6'; // 보라색
  };

  const getStrokeColor = () => {
    if (isSelected) return '#000000';
    return 'none';
  };

  const getStrokeWidth = () => {
    return isSelected ? 2 : 0;
  };

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={status === 'AVAILABLE' ? onClick : undefined}
      style={{
        cursor: status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
        userSelect: 'none',
      }}
    >
      <rect
        width={width}
        height={height}
        fill={getFillColor()}
        stroke={getStrokeColor()}
        strokeWidth={getStrokeWidth()}
        className='transition-colors duration-200'
      />
    </g>
  );
};

export default TicketingSeat;
