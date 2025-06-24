import { InvalidMoveError } from '@/domain/errors/invalid-move-error'
import { Board } from '@/domain/models/board/board'
import { PieceFactory } from '@/domain/models/piece/factory'
import { Player, PieceType } from '@/domain/models/piece/types'
import { Position } from '@/domain/models/position/types'
import { GameRulesService } from '@/domain/services/game-rules'

import {
  GameState,
  GameMove,
  MoveResult,
  IGameUseCase
} from './types'

export class GameUseCase implements IGameUseCase {
  private gameState: GameState | null = null
  private gameRules: GameRulesService

  constructor() {
    this.gameRules = new GameRulesService()
  }

  startNewGame(): GameState {
    const board = Board.createInitialBoard()
    
    this.gameState = {
      board,
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

  movePiece(from: Position, to: Position, isPromotion: boolean = false): MoveResult {
    if (!this.gameState) {
      return {
        success: false,
        error: new Error('ゲームが開始されていません')
      }
    }

    // 座標の妥当性チェック
    if (!this.isValidPosition(from) || !this.isValidPosition(to)) {
      return {
        success: false,
        error: new Error('無効な座標です')
      }
    }

    const piece = this.gameState.board.getPiece(from)
    if (!piece) {
      return {
        success: false,
        error: new InvalidMoveError('移動元に駒がありません')
      }
    }

    // 手番チェック
    if (piece.owner !== this.gameState.currentPlayer) {
      return {
        success: false,
        error: new InvalidMoveError('相手の番です')
      }
    }

    // 合法手チェック
    const legalMoves = this.gameRules.generateLegalMoves(
      this.gameState.board,
      from,
      this.gameState.currentPlayer
    )
    
    const isLegalMove = legalMoves.some(move => 
      move.to.x === to.x && move.to.y === to.y
    )

    if (!isLegalMove) {
      return {
        success: false,
        error: new InvalidMoveError('その手は指せません')
      }
    }

    // 駒を取る場合の処理
    const capturedPiece = this.gameState.board.getPiece(to)
    if (capturedPiece) {
      const capturedList = this.gameState.currentPlayer === Player.SENTE
        ? this.gameState.capturedPieces.sente
        : this.gameState.capturedPieces.gote
      
      // 持ち駒は成っていない状態で追加
      const unpromoted = PieceFactory.create(
        capturedPiece.type,
        this.gameState.currentPlayer,
        false
      )
      capturedList.push(unpromoted)
    }

    // 成り判定と処理
    let movedPiece = piece
    if (isPromotion && this.canPromote(from, to)) {
      movedPiece = PieceFactory.create(piece.type, piece.owner, true)
    }

    // 手を適用
    this.gameState.board.applyMove({
      from,
      to,
      isPromotion: movedPiece.isPromoted
    })

    // 履歴に追加
    const move: GameMove = {
      from,
      to,
      player: this.gameState.currentPlayer,
      piece: piece,
      captured: capturedPiece || undefined,
      isPromotion,
      timestamp: new Date()
    }
    this.gameState.history.push(move)

    // 手番交代
    this.gameState.currentPlayer = this.gameState.currentPlayer === Player.SENTE
      ? Player.GOTE
      : Player.SENTE

    // 王手・詰みチェック
    this.updateGameStatus()

    return {
      success: true,
      gameState: this.gameState
    }
  }

  dropPiece(pieceType: PieceType, to: Position): MoveResult {
    if (!this.gameState) {
      return {
        success: false,
        error: new Error('ゲームが開始されていません')
      }
    }

    // 座標の妥当性チェック
    if (!this.isValidPosition(to)) {
      return {
        success: false,
        error: new Error('無効な座標です')
      }
    }

    // 持ち駒チェック
    const capturedList = this.gameState.currentPlayer === Player.SENTE
      ? this.gameState.capturedPieces.sente
      : this.gameState.capturedPieces.gote

    const pieceIndex = capturedList.findIndex(p => p.type === pieceType)
    if (pieceIndex === -1) {
      return {
        success: false,
        error: new InvalidMoveError('その駒を持っていません')
      }
    }

    // 打つ場所が空いているかチェック
    if (this.gameState.board.getPiece(to)) {
      return {
        success: false,
        error: new InvalidMoveError('その場所には既に駒があります')
      }
    }

    // 二歩チェック
    if (pieceType === 'PAWN') {
      const piece = PieceFactory.create(pieceType, this.gameState.currentPlayer, false)
      if (this.gameRules.isNifu(this.gameState.board, to, piece)) {
        return {
          success: false,
          error: new InvalidMoveError('二歩です')
        }
      }
    }

    // 駒を打つ
    const piece = capturedList.splice(pieceIndex, 1)[0]
    this.gameState.board.setPiece(to, piece)

    // 履歴に追加
    const move: GameMove = {
      drop: pieceType,
      to,
      player: this.gameState.currentPlayer,
      timestamp: new Date()
    }
    this.gameState.history.push(move)

    // 手番交代
    this.gameState.currentPlayer = this.gameState.currentPlayer === Player.SENTE
      ? Player.GOTE
      : Player.SENTE

    // 王手・詰みチェック
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

  getLegalMoves(from?: Position): Position[] {
    if (!this.gameState) {
      return []
    }

    if (!from) {
      // 全ての合法手を返す
      const allMoves: Position[] = []
      for (let x = 1; x <= 9; x++) {
        for (let y = 1; y <= 9; y++) {
          const pos = { x, y }
          const piece = this.gameState.board.getPiece(pos)
          if (piece && piece.owner === this.gameState.currentPlayer) {
            const moves = this.gameRules.generateLegalMoves(
              this.gameState.board,
              pos,
              this.gameState.currentPlayer
            )
            allMoves.push(...moves.map(m => m.to))
          }
        }
      }
      return allMoves
    }

    const moves = this.gameRules.generateLegalMoves(
      this.gameState.board,
      from,
      this.gameState.currentPlayer
    )
    return moves.map(m => m.to)
  }

  canPromote(from: Position, to: Position): boolean {
    if (!this.gameState) {
      return false
    }

    const piece = this.gameState.board.getPiece(from)
    if (!piece || piece.isPromoted) {
      return false
    }

    // 成れる駒かチェック
    const promotablePieces: PieceType[] = ['PAWN', 'LANCE', 'KNIGHT', 'SILVER', 'BISHOP', 'ROOK']
    if (!promotablePieces.includes(piece.type)) {
      return false
    }

    // 敵陣チェック
    if (piece.owner === Player.SENTE) {
      return to.y <= 3 || from.y <= 3
    } else {
      return to.y >= 7 || from.y >= 7
    }
  }

  resign(player: Player): void {
    if (!this.gameState) {
      throw new Error('ゲームが開始されていません')
    }

    this.gameState.status = 'checkmate'
    this.gameState.winner = player === Player.SENTE ? Player.GOTE : Player.SENTE
  }

  private isValidPosition(pos: Position): boolean {
    return pos.x >= 1 && pos.x <= 9 && pos.y >= 1 && pos.y <= 9
  }

  private updateGameStatus(): void {
    if (!this.gameState) {
      return
    }

    // 王手チェック
    this.gameState.isCheck = this.gameRules.isInCheck(
      this.gameState.board,
      this.gameState.currentPlayer
    )

    // 詰みチェック
    if (this.gameState.isCheck) {
      const isCheckmate = this.gameRules.isCheckmate(
        this.gameState.board,
        this.gameState.currentPlayer
      )
      
      if (isCheckmate) {
        this.gameState.status = 'checkmate'
        this.gameState.winner = this.gameState.currentPlayer === Player.SENTE
          ? Player.GOTE
          : Player.SENTE
      } else {
        this.gameState.status = 'check'
      }
    } else {
      this.gameState.status = 'playing'
    }
  }
}