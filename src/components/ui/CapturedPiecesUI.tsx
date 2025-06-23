'use client'

import { PieceType, Player } from '@/domain/models/piece/types'

import type { CapturedPiecesUIProps } from './types'

/**
 * 駒の種類を日本語表記に変換
 */
const pieceTypeToKanji: Record<PieceType, string> = {
  [PieceType.KING]: '玉',
  [PieceType.ROOK]: '飛',
  [PieceType.BISHOP]: '角',
  [PieceType.GOLD]: '金',
  [PieceType.SILVER]: '銀',
  [PieceType.KNIGHT]: '桂',
  [PieceType.LANCE]: '香',
  [PieceType.PAWN]: '歩',
  [PieceType.DRAGON]: '竜',
  [PieceType.HORSE]: '馬',
  [PieceType.PROMOTED_SILVER]: '成銀',
  [PieceType.PROMOTED_KNIGHT]: '成桂',
  [PieceType.PROMOTED_LANCE]: '成香',
  [PieceType.TOKIN]: 'と',
}

/**
 * 駒の表示順序（歩→香→桂→銀→金→角→飛）
 */
const pieceOrder: PieceType[] = [
  PieceType.PAWN,
  PieceType.LANCE,
  PieceType.KNIGHT,
  PieceType.SILVER,
  PieceType.GOLD,
  PieceType.BISHOP,
  PieceType.ROOK,
]

/**
 * 持ち駒エリアコンポーネント
 */
export function CapturedPiecesUI({
  capturedPieces,
  player,
  isMyTurn,
  selectedPiece,
  onPieceClick,
}: CapturedPiecesUIProps) {
  // 駒を正しい順序にソート
  const sortedPieces = [...capturedPieces].sort((a, b) => {
    const aIndex = pieceOrder.indexOf(a.type)
    const bIndex = pieceOrder.indexOf(b.type)
    return aIndex - bIndex
  })

  // プレイヤーごとの背景色
  const bgColor = player === Player.SENTE ? 'bg-blue-50' : 'bg-red-50'
  const borderColor = player === Player.SENTE ? 'border-blue-200' : 'border-red-200'

  return (
    <div
      data-testid="captured-pieces-area"
      className={`p-2 sm:p-3 md:p-4 rounded-lg border-2 ${bgColor} ${borderColor}`}
    >
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {sortedPieces.map((piece) => (
          <button
            key={piece.type}
            data-testid="captured-piece"
            onClick={() => onPieceClick(piece.type)}
            disabled={!isMyTurn}
            className={`
              relative
              w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16
              bg-white rounded shadow-md
              flex items-center justify-center
              text-lg sm:text-xl md:text-2xl font-bold
              transition-all duration-200
              ${isMyTurn ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : 'opacity-60 cursor-not-allowed'}
              ${selectedPiece === piece.type ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            `}
          >
            <span className="select-none">
              {pieceTypeToKanji[piece.type]}
            </span>
            {piece.count > 1 && (
              <span className="absolute bottom-0 right-0 text-xs sm:text-sm bg-gray-700 text-white rounded-tl px-1">
                {piece.count}
              </span>
            )}
          </button>
        ))}
        {sortedPieces.length === 0 && (
          <div className="text-gray-400 text-sm sm:text-base p-2">
            持ち駒なし
          </div>
        )}
      </div>
    </div>
  )
}