'use client';

import React from 'react';

interface PromotionDialogProps {
  onChoice: (promote: boolean) => void;
  onCancel: () => void;
}

export const PromotionDialog: React.FC<PromotionDialogProps> = ({ onChoice, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">成りますか？</h2>
        <div className="flex gap-4">
          <button
            onClick={() => onChoice(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            成る
          </button>
          <button
            onClick={() => onChoice(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            成らない
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};