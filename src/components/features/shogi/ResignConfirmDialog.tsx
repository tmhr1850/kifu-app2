'use client';

import React from 'react';

interface ResignConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResignConfirmDialog: React.FC<ResignConfirmDialogProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">本当に投了しますか？</h2>
        <p className="mb-6 text-gray-600">この操作は取り消せません。</p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            投了する
          </button>
        </div>
      </div>
    </div>
  );
};