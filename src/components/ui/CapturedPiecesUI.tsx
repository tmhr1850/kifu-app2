'use client'

import { MouseEvent } from 'react'

import type { PieceType, Player, CapturedPieces } from './types'

interface CapturedPiecesUIProps {
  pieces: CapturedPieces
  isPlayerTurn: boolean
  selectedPiece: PieceType | null
  onPieceClick: (piece: PieceType) => void
  player: Player
}

const PIECE_ORDER: PieceType[] = ['歩', '香', '桂', '銀', '金', '角', '飛']

export function CapturedPiecesUI({
  pieces,
  isPlayerTurn,
  selectedPiece,
  onPieceClick,
  player,
}: CapturedPiecesUIProps) {
  const handlePieceClick = (piece: PieceType) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isPlayerTurn) {
      onPieceClick(piece)
    }
  }

  const sortedPieces = PIECE_ORDER.filter(piece => pieces[piece])

  return (
    <div
      data-testid={`captured-pieces-${player}`}
      className={`
        flex flex-wrap gap-2 p-3 rounded-lg
        ${player === 'sente' ? 'bg-blue-50' : 'bg-red-50'}
        border-2 ${player === 'sente' ? 'border-blue-200' : 'border-red-200'}
        min-h-[80px]
      `}
    >
      {sortedPieces.map((piece) => {
        const count = pieces[piece] || 0
        const isSelected = selectedPiece === piece
        const isClickable = isPlayerTurn && count > 0

        return (
          <button
            key={piece}
            data-testid={`captured-piece-${piece}`}
            onClick={handlePieceClick(piece)}
            disabled={!isClickable}
            className={`
              relative flex items-center justify-center
              w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
              rounded-lg transition-all duration-200
              ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
              ${isPlayerTurn ? 'bg-white shadow-md' : 'bg-gray-100 opacity-50'}
              ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              ${isClickable && !isSelected ? 'hover:shadow-lg' : ''}
              border border-gray-300
            `}
          >
            <span className={`
              text-xl md:text-2xl lg:text-3xl font-bold
              ${player === 'sente' ? 'text-black' : 'text-black'}
            `}>
              {piece}
            </span>
            {count > 1 && (
              <span className="absolute bottom-0 right-0 text-xs md:text-sm bg-gray-700 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center transform translate-x-1 translate-y-1">
                ×{count}
              </span>
            )}
          </button>
        )
      })}
      {sortedPieces.length === 0 && (
        <div className="text-gray-400 text-sm md:text-base flex items-center justify-center w-full">
          持ち駒なし
        </div>
      )}
    </div>
  )
}