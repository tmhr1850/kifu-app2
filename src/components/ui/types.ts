import { PieceType, Player } from '@/domain/models/piece/types'

/**
 * 持ち駒の情報
 */
export interface CapturedPiece {
  type: PieceType
  count: number
}

/**
 * CapturedPiecesUIコンポーネントのProps
 */
export interface CapturedPiecesUIProps {
  capturedPieces: CapturedPiece[]
  player: Player
  isMyTurn: boolean
  selectedPiece?: PieceType
  onPieceClick: (pieceType: PieceType) => void
}