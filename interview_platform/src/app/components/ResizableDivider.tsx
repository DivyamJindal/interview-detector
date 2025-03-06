'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ResizableDividerProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  className?: string;
  style?: React.CSSProperties;
  minSize?: number;
  maxSize?: number;
}

export default function ResizableDivider({
  direction,
  onResize,
  className = '',
  style = {},
  minSize = 200,
  maxSize = 800
}: ResizableDividerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const lastDelta = useRef(0);
  const frameRef = useRef<number>(0);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPosition({ x: clientX, y: clientY });
  }, []);

  const handleDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      const delta = direction === 'horizontal'
        ? clientX - startPosition.x
        : clientY - startPosition.y;

      const totalDelta = lastDelta.current + delta;
      if (totalDelta >= -minSize && totalDelta <= maxSize) {
        onResize(delta);
        lastDelta.current = totalDelta;
      }

      setStartPosition({ x: clientX, y: clientY });
    });
  }, [isDragging, direction, onResize, startPosition, minSize, maxSize]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    lastDelta.current = 0; // Reset the lastDelta value when dragging ends
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  }, [handleDragStart]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  }, [handleDragStart]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDrag(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleDrag(touch.clientX, touch.clientY);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleDragEnd);
      document.addEventListener('touchcancel', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleDragEnd);
      document.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  const cursorStyle = direction === 'horizontal' ? 'col-resize' : 'row-resize';
  const dividerClasses = `${className} ${isDragging ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`;

  return (
    <div
      className={dividerClasses}
      style={{
        cursor: cursorStyle,
        transition: isDragging ? 'none' : 'opacity 0.2s',
        touchAction: 'none',
        ...style
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {direction === 'horizontal' ? (
        <div className="w-1 h-full bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"></div>
      ) : (
        <div className="h-1 w-full bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"></div>
      )}
    </div>
  );

}