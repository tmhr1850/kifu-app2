import { InvalidMoveError } from '@/domain/errors/invalid-move-error'
import { Board } from '@/domain/models/board/board'
import { createPiece } from '@/domain/models/piece/factory'
import { IPiece } from '@/domain/models/piece/interface'
import { Player, PieceType, Move } from '@/domain/models/piece/types'
import { Position } from '@/domain/models/position/position'
import { GameRules } from '@/domain/services/game-rules'

import {
  GameState,
  GameMove,
  MoveResult,
  IGameUseCase,
  UIPosition
} from './types'

export class GameUseCase implements IGameUseCase {
  private gameState: GameState | null = null
  private gameRules: GameRules

  constructor() {
    this.gameRules = new GameRules()
  }

  // UIとドメインの座標変換
  private toDomainPos(pos: UIPosition): Position {
    if (pos.row < 1 || pos.row > 9 || pos.column < 1 || pos.column > 9) {
      throw new Error('範囲外の座標です')
    }
    return new Position(pos.row - 1, pos.column - 1)
  }

  private toUIPos(pos: Position): UIPosition {
    return { row: pos.row + 1, column: pos.column + 1 }
  }

  startNewGame(): GameState {
    const board = Board.createInitialBoard()
    
    this.gameState = {
      board: board as Board,
      currentPlayer: Player.SENTE,
      history: [],
      capturedPieces: {
        sente: [],
        gote: []
      },
      status: 'playing',
      isCheck: false
    }

    return this.gameState
  }

  movePiece(fromUI: UIPosition, toUI: UIPosition, isPromotion: boolean = false): MoveResult {
    if (!this.gameState) {
      return {
        success: false,
        error: new Error('ゲームが開始されていません')
      }
    }

    let from: Position
    let to: Position
    try {
      from = this.toDomainPos(fromUI)
      to = this.toDomainPos(toUI)
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Invalid arguments')
      return { success: false, error: err }
    }

    const piece = this.gameState.board.getPiece(from)
    if (!piece) {
      return {
        success: false,
        error: new InvalidMoveError('移動する駒が存在しません')
      }
    }
    if (piece.player !== this.gameState.currentPlayer) {
      return {
        success: false,
        error: new InvalidMoveError('自分の駒しか動かせません')
      }
    }

    const legalMoves = this.gameRules.generateLegalMoves(
      this.gameState.board,
      this.gameState.currentPlayer,
    )

    const isLegalMove = legalMoves.some(
      (move) =>
        move.from.row === from.row &&
        move.from.column === from.column &&
        move.to.row === to.row &&
        move.to.column === to.column,
    )

    if (!isLegalMove) {
      return {
        success: false,
        error: new InvalidMoveError('その手は指せません')
      }
    }

    // 成り処理のチェック
    if (isPromotion && !this.canPromote(piece, to)) {
      return {
        success: false,
        error: new InvalidMoveError('この駒は成ることができません')
      }
    }

    const capturedPiece = this.gameState.board.getPiece(to)
    if (capturedPiece) {
      const capturedList = this.gameState.currentPlayer === Player.SENTE
        ? this.gameState.capturedPieces.sente
        : this.gameState.capturedPieces.gote
      
      const unpromotedType = this.getUnpromotedType(capturedPiece.type)
      const newCapturedPiece = createPiece(
        unpromotedType,
        this.gameState.currentPlayer,
        null, // 持ち駒は位置情報なし
      )
      capturedList.push(newCapturedPiece)
    }

    const moveDefinition: Move = { from, to, isPromotion }
    const newBoard = this.gameState.board.applyMove(moveDefinition)
    this.gameState.board = newBoard as Board

    const gameMove: GameMove = {
      from: fromUI,
      to: toUI,
      player: this.gameState.currentPlayer,
      piece: { type: piece.type, owner: piece.player },
      captured: capturedPiece ? { type: capturedPiece.type, owner: capturedPiece.player } : undefined,
      isPromotion,
      timestamp: new Date()
    }
    this.gameState.history.push(gameMove)

    this.gameState.currentPlayer = this.gameState.currentPlayer === Player.SENTE
      ? Player.GOTE
      : Player.SENTE

    this.updateGameStatus()

    return {
      success: true,
      gameState: this.gameState
    }
  }

  dropPiece(pieceType: PieceType, toUI: UIPosition): MoveResult {
    if (!this.gameState) {
      return {
        success: false,
        error: new Error('ゲームが開始されていません')
      }
    }

    const to = this.toDomainPos(toUI)

    const capturedList = this.gameState.currentPlayer === Player.SENTE
      ? this.gameState.capturedPieces.sente
      : this.gameState.capturedPieces.gote

    const pieceIndex = capturedList.findIndex((p) => p.type === pieceType && !p.position)
    if (pieceIndex === -1) {
      return {
        success: false,
        error: new InvalidMoveError('その駒を持っていません')
      }
    }

    if (this.gameState.board.getPiece(to)) {
      return {
        success: false,
        error: new InvalidMoveError('その場所には既に駒があります')
      }
    }

    if (pieceType === PieceType.PAWN && this.gameRules.isNifu(this.gameState.board, to.column, this.gameState.currentPlayer)) {
      return {
        success: false,
        error: new InvalidMoveError('二歩です')
      }
    }

    const pieceToDrop = capturedList[pieceIndex]
    const newPiece = pieceToDrop.clone(to) // 新しい位置で駒をクローン
    capturedList.splice(pieceIndex, 1) // 配列から安全に削除
    this.gameState.board.setPiece(to, newPiece)

    const gameMove: GameMove = {
      drop: pieceType,
      to: toUI,
      player: this.gameState.currentPlayer,
      timestamp: new Date()
    }
    this.gameState.history.push(gameMove)

    this.gameState.currentPlayer = this.gameState.currentPlayer === Player.SENTE
      ? Player.GOTE
      : Player.SENTE

    this.updateGameStatus()

    return {
      success: true,
      gameState: this.gameState
    }
  }

  getGameState(): GameState {
    if (!this.gameState) {
      throw new Error('ゲームが開始されていません')
    }
    return this.gameState
  }

  getLegalMoves(fromUI?: UIPosition): UIPosition[] {
    if (!this.gameState || !fromUI) {
      return []
    }
    const from = this.toDomainPos(fromUI)
    const legalMoves = this.gameRules
      .generateLegalMoves(this.gameState.board, this.gameState.currentPlayer)
      .filter((move) => move.from.row === from.row && move.from.column === from.column)
    return legalMoves.map((m) => this.toUIPos(new Position(m.to.row, m.to.column)))
  }

  canPromote(piece: IPiece, to: Position): boolean {
    // 金、王、すでに成ってる駒は成れない
    const unpromotablePieces: PieceType[] = [
      PieceType.GOLD,
      PieceType.KING,
    ]
    if (unpromotablePieces.includes(piece.type) || piece.isPromoted()) {
      return false
    }

    const player = piece.player
    const promotionZoneStart = player === Player.SENTE ? 0 : 6
    const promotionZoneEnd = player === Player.SENTE ? 2 : 8

    const from = piece.position
    if (!from) return false // 持ち駒は成れない

    const isMovingToPromotionZone =
      to.row >= promotionZoneStart && to.row <= promotionZoneEnd
    const isMovingFromPromotionZone =
      from.row >= promotionZoneStart && from.row <= promotionZoneEnd

    return isMovingToPromotionZone || isMovingFromPromotionZone
  }

  resign(_player: Player): void {
    if (!this.gameState) {
      throw new Error('ゲームが開始されていません')
    }

    this.gameState.status = 'resigned'
    // TODO: 勝者を記録するなどの処理
  }


  private updateGameStatus(): void {
    if (!this.gameState) {
      return
    }

    // 王手チェック：現在のプレイヤー（次に指す番の人）が王手されているかチェック
    const nextPlayer = this.gameState.currentPlayer
    this.gameState.isCheck = this.gameRules.isInCheck(
      this.gameState.board,
      nextPlayer
    )

    // 詰みチェック
    if (this.gameState.isCheck) {
      const isCheckmate = this.gameRules.isCheckmate(
        this.gameState.board,
        nextPlayer
      )
      
      if (isCheckmate) {
        this.gameState.status = 'checkmate'
      } else {
        this.gameState.status = 'check'
      }
    } else {
      this.gameState.status = 'playing'
    }
  }


  private getUnpromotedType(type: PieceType): PieceType {
    switch (type) {
      case PieceType.TOKIN:
        return PieceType.PAWN
      case PieceType.PROMOTED_LANCE:
        return PieceType.LANCE
      case PieceType.PROMOTED_KNIGHT:
        return PieceType.KNIGHT
      case PieceType.PROMOTED_SILVER:
        return PieceType.SILVER
      case PieceType.HORSE:
        return PieceType.BISHOP
      case PieceType.DRAGON:
        return PieceType.ROOK
      default:
        return type // 元から成り駒でなければそのまま返す
    }
  }
}