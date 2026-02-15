import React, { useState, ReactNode, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './popover.css';

type Props = {
  content: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Popover({ content, children, className }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number; width?: number } | null>(null);
  const [useClick, setUseClick] = useState(false);

  useEffect(() => {
    // detect coarse pointer or touch-capable devices and prefer click interaction
    try {
      const prefersCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      setUseClick(prefersCoarse || 'ontouchstart' in window);
    } catch (e) {
      setUseClick(false);
    }
  }, []);

  useEffect(() => {
    function update() {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setPos({ left: rect.left + rect.width / 2, top: rect.top, width: rect.width });
    }

    if (open) {
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
    }

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open && useClick) {
      document.addEventListener('mousedown', onDoc);
    }
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, useClick]);

  function handleTriggerClick(e: React.MouseEvent) {
    if (useClick) {
      e.stopPropagation();
      setOpen((v) => !v);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (useClick) setOpen((v) => !v);
    }
  }

  return (
    <div
      className={`popover-wrapper ${className || ''}`}
      ref={wrapperRef}
      onMouseEnter={() => !useClick && setOpen(true)}
      onMouseLeave={() => !useClick && setOpen(false)}
      onFocus={() => !useClick && setOpen(true)}
      onBlur={() => !useClick && setOpen(false)}
      onClick={handleTriggerClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
    >
      <div className="popover-trigger">{children}</div>
      {open && pos && createPortal(
        <div
          role="dialog"
          className="popover-content"
          style={{ left: pos.left, top: pos.top }}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  );
}
