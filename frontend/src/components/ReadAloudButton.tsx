'use client';

import React from 'react';
import { useTTS } from '@/hooks/useTTS';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause } from 'lucide-react';

interface ReadAloudButtonProps {
  text: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  className?: string;
  label?: string;
}

export default function ReadAloudButton({ text, size = 'sm', variant = 'outline', className, label }: ReadAloudButtonProps) {
  const { toggle, isSpeaking, isPaused, isSupported, stop } = useTTS();

  if (!isSupported) return null;

  const getIcon = () => {
    if (isSpeaking && !isPaused) return <Pause className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  const handleClick = () => {
    if (isSpeaking && !isPaused) {
      stop();
    } else {
      toggle(text);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleClick} className={className}>
      {getIcon()}
      {label && <span className="mr-1">{label}</span>}
      {!label && size !== 'icon' && <span className="mr-1">{isSpeaking && !isPaused ? 'إيقاف' : 'اقرأ لي'}</span>}
    </Button>
  );
}
