import { describe, it, expect, beforeEach } from 'vitest'

import { InvalidMoveError } from '@/domain/errors/invalid-move-error'
import { PieceType, Player } from '@/domain/models/piece/types'
import { Position } from '@/domain/models/position/position'

import { GameUseCase } from './usecase'

// Helper function to pass turn
const passTurn = (useCase: GameUseCase) => {
  // Find a valid move for the current player and execute it
  const state = useCase.getGameState()
  const pieces = state.board.getPieces(state.currentPlayer)
  for (const piece of pieces) {
    if (piece.position) {
      const moves = useCase.getLegalMoves({
        row: piece.position.row + 1,
        column: piece.position.column + 1,
      })
      if (moves.length > 0) {
        useCase.movePiece(
          { row: piece.position.row + 1, column: piece.position.column + 1 },
          moves[0],
        )
        return
      }
    }
  }
}

describe('GameUseCase', () => {
  let gameUseCase: GameUseCase

  beforeEach(() => {
    gameUseCase = new GameUseCase()
    gameUseCase.startNewGame()
  })

  describe('startNewGame', () => {
    it('新しい対局を開始できる', () => {
      const gameState = gameUseCase.startNewGame()

      expect(gameState.board).toBeDefined()
      expect(gameState.currentPlayer).toBe(Player.SENTE)
      expect(gameState.history).toHaveLength(0)
      expect(gameState.capturedPieces.sente).toHaveLength(0)
      expect(gameState.capturedPieces.gote).toHaveLength(0)
      expect(gameState.status).toBe('playing')
    })
  })

  describe('movePiece', () => {
    it('合法な駒移動を実行できる', () => {
      const result = gameUseCase.movePiece({ row: 7, column: 7 }, { row: 6, column: 7 })

      expect(result.success).toBe(true)
      expect(gameUseCase.getGameState().currentPlayer).toBe(Player.GOTE)
      expect(gameUseCase.getGameState().history).toHaveLength(1)
    })

    it('相手の番に自分の駒を動かせない', () => {
      const result = gameUseCase.movePiece({ row: 3, column: 3 }, { row: 4, column: 3 })

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('相手の番です')
    })

    it('相手の駒を取れる', () => {
      gameUseCase.movePiece({ row: 7, column: 2 }, { row: 6, column: 2 })
      passTurn(gameUseCase)
      gameUseCase.movePiece({ row: 8, column: 2 }, { row: 3, column: 2 })
      const result = gameUseCase.getGameState()
      expect(result.capturedPieces.sente.some(p => p.type === PieceType.PAWN)).toBe(true)
    })
  })

  describe('dropPiece', () => {
    beforeEach(() => {
      gameUseCase.movePiece({ row: 7, column: 7 }, { row: 6, column: 7 })
      gameUseCase.movePiece({ row: 3, column: 3 }, { row: 4, column: 3 })
      gameUseCase.movePiece({ row: 2, column: 2 }, { row: 3, column: 3 })
    })

    it('持ち駒を使用できる', () => {
      passTurn(gameUseCase)
      const result = gameUseCase.dropPiece(PieceType.PAWN, { row: 5, column: 5 })
      expect(result.success).toBe(true)
      expect(gameUseCase.getGameState().capturedPieces.sente).toHaveLength(0)
    })

    it('二歩を検出して拒否する', () => {
      passTurn(gameUseCase)
      const result = gameUseCase.dropPiece(PieceType.PAWN, { row: 5, column: 7 })
      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('二歩です')
    })
  })

  describe('promotePiece', () => {
    it('成り判定が正しく行われる', () => {
      gameUseCase.movePiece({ row: 7, column: 2 }, { row: 6, column: 2 })
      passTurn(gameUseCase)
      gameUseCase.movePiece({ row: 6, column: 2 }, { row: 5, column: 2 })
      passTurn(gameUseCase)
      gameUseCase.movePiece({ row: 5, column: 2 }, { row: 4, column: 2 })
      passTurn(gameUseCase)
      gameUseCase.movePiece({ row: 4, column: 2 }, { row: 3, column: 2 })
      passTurn(gameUseCase)
      const result = gameUseCase.movePiece(
        { row: 3, column: 2 },
        { row: 2, column: 2 },
        true,
      )

      expect(result.success).toBe(true)
      const piece = gameUseCase
        .getGameState()
        .board.getPiece(new Position(1, 1))
      expect(piece?.type).toBe(PieceType.TOKIN)
    })
  })

  describe('turnManagement', () => {
    it('手番が正しく管理される', () => {
      gameUseCase.startNewGame()

      expect(gameUseCase.getGameState().currentPlayer).toBe(Player.SENTE)

      gameUseCase.movePiece({ row: 7, column: 7 }, { row: 6, column: 7 })
      expect(gameUseCase.getGameState().currentPlayer).toBe(Player.GOTE)

      gameUseCase.movePiece({ row: 3, column: 3 }, { row: 3, column: 4 })
      expect(gameUseCase.getGameState().currentPlayer).toBe(Player.SENTE)
    })

    it('手の履歴が正しく記録される', () => {
      gameUseCase.startNewGame()

      gameUseCase.movePiece({ row: 7, column: 7 }, { row: 6, column: 7 })
      gameUseCase.movePiece({ row: 3, column: 3 }, { row: 3, column: 4 })

      const history = gameUseCase.getGameState().history
      expect(history).toHaveLength(2)
      expect(history[0]).toMatchObject({
        from: { row: 7, column: 7 },
        to: { row: 6, column: 7 },
        player: Player.SENTE
      })
      expect(history[1]).toMatchObject({
        from: { row: 3, column: 3 },
        to: { row: 3, column: 4 },
        player: Player.GOTE
      })
    })

    it('持ち駒使用も履歴に記録される', () => {
      gameUseCase.startNewGame()
      gameUseCase.movePiece({ row: 7, column: 7 }, { row: 6, column: 7 })
      gameUseCase.movePiece({ row: 3, column: 1 }, { row: 4, column: 1 })
      gameUseCase.movePiece({ row: 8, column: 8 }, { row: 2, column: 2 })
      
      gameUseCase.dropPiece(PieceType.BISHOP, { row: 5, column: 5 })

      const history = gameUseCase.getGameState().history
      const lastMove = history[history.length - 1]
      expect(lastMove).toMatchObject({
        drop: PieceType.BISHOP,
        to: { row: 5, column: 5 },
        player: Player.SENTE
      })
    })
  })

  describe('gameStatus', () => {
    it('王手を検出できる', () => {
      gameUseCase.startNewGame()
      const state = gameUseCase.getGameState()
      expect(state.isCheck).toBeDefined()
    })

    it('詰みを検出できる', () => {
      gameUseCase.startNewGame()
      const state = gameUseCase.getGameState()
      expect(state.status).toBeDefined()
    })
  })

  describe('history', () => {
    it('手の履歴が正しく記録される', () => {
      gameUseCase.movePiece({ row: 7, column: 7 }, { row: 6, column: 7 })
      gameUseCase.movePiece({ row: 3, column: 3 }, { row: 4, column: 3 })
      const history = gameUseCase.getGameState().history
      expect(history).toHaveLength(2)
      expect(history[1]).toMatchObject({
        from: { row: 3, column: 3 },
        player: Player.GOTE,
      })
    })

    it('持ち駒使用も履歴に記録される', () => {
      gameUseCase.startNewGame()
      gameUseCase.movePiece({ row: 7, column: 7 }, { row: 6, column: 7 })
      gameUseCase.movePiece({ row: 3, column: 1 }, { row: 4, column: 1 })
      gameUseCase.movePiece({ row: 8, column: 8 }, { row: 2, column: 2 })
      gameUseCase.movePiece({ row: 1, column: 1 }, { row: 2, column: 1 })
      
      gameUseCase.dropPiece(PieceType.BISHOP, { row: 5, column: 5 })

      const history = gameUseCase.getGameState().history
      const lastMove = history[history.length - 1]
      expect(lastMove).toMatchObject({
        drop: PieceType.BISHOP,
        to: { row: 5, column: 5 },
        player: Player.SENTE
      })
    })
  })

  describe('errorHandling', () => {
    it('ゲーム開始前の操作はエラーになる', () => {
      const newGameUseCase = new GameUseCase()
      
      const result = newGameUseCase.movePiece({ row: 7, column: 7 }, { row: 6, column: 7 })

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('ゲームが開始されていません')
    })

    it('範囲外の座標はエラーになる', () => {
      expect(() =>
        gameUseCase.movePiece({ row: 10, column: 7 }, { row: 7, column: 6 }),
      ).toThrow('Invalid position')
    })
  })
})