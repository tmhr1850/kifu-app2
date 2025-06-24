import { IPiece } from '@/domain/models/piece/interface'
import { PieceType, Player } from '@/domain/models/piece/types'
import { UIPosition } from '@/types/common'

/**
 * 将棋盤コンポーネントのProps
 */
export interface BoardUIProps {
  pieces: { piece: IPiece; position: UIPosition }[]
  onCellClick: (position: UIPosition) => void
  onPieceClick: (piece: IPiece) => void
  highlightedCells: UIPosition[]
  selectedCell?: UIPosition | null
}

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
  selectedPiece?: PieceType | null
  onPieceClick: (pieceType: PieceType) => void
}