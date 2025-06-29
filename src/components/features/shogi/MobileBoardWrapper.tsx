'use client';

import { clsx } from 'clsx';
import React, { useState, useEffect, useMemo } from 'react';

interface MobileBoardWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileBoardWrapper: React.FC<MobileBoardWrapperProps> = ({ children, className }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  const containerClass = useMemo(() => {
    return clsx(
      'relative w-full',
      {
        // モバイル縦向き
        'max-w-[100vw] px-2': isMobile && orientation === 'portrait',
        // モバイル横向き
        'max-h-[calc(100vh-8rem)]': isMobile && orientation === 'landscape',
        // デスクトップ
        'max-w-2xl mx-auto': !isMobile
      },
      className
    );
  }, [isMobile, orientation, className]);

  const boardScale = useMemo(() => {
    if (!isMobile) return 1;
    
    // モバイルでのスケール計算
    if (orientation === 'portrait') {
      // 縦向き: 画面幅に合わせる
      return Math.min(1, (window.innerWidth - 32) / 600);
    } else {
      // 横向き: 画面高さに合わせる
      return Math.min(1, (window.innerHeight - 128) / 600);
    }
  }, [isMobile, orientation]);

  return (
    <div className={containerClass}>
      <div 
        style={{
          transform: `scale(${boardScale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
      
      {/* モバイル用のジェスチャーヒント */}
      {isMobile && (
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <p className="text-xs text-gray-500 animate-pulse">
            タップして駒を選択・移動
          </p>
        </div>
      )}
    </div>
  );
};