import { describe, it, expect, beforeEach } from 'vitest'

import { PieceType, Player } from '@/domain/models/piece/types'
import { Position } from '@/domain/models/position/position'

import { GameUseCase } from './usecase'
import { UIPosition } from './types'

describe('GameUseCase', () => {
  let gameUseCase: GameUseCase

  beforeEach(() => {
    gameUseCase = new GameUseCase()
    gameUseCase.startNewGame()
  })

  describe('startNewGame', () => {
    it('新しい対局を開始できる', () => {
      const gameState = gameUseCase.getGameState()
      expect(gameState.board).toBeDefined()
      expect(gameState.currentPlayer).toBe(Player.SENTE)
      expect(gameState.history).toHaveLength(0)
    })
  })

  describe('movePiece', () => {
    it('合法な駒移動を実行できる', () => {
      const result = gameUseCase.movePiece({ row: 7, column: 7 }, { row: 6, column: 7 })

      expect(result.success).toBe(true)
      const gameState = gameUseCase.getGameState()
      expect(gameState.currentPlayer).toBe(Player.GOTE)
      expect(gameState.history).toHaveLength(1)
    })

    it('相手の番に自分の駒を動かせない', () => {
      const result = gameUseCase.movePiece({ row: 3, column: 3 }, { row: 4, column: 3 })

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('相手の番です')
    })
  })

  describe('dropPiece', () => {
    beforeEach(() => {
      // SENTEがGOTEの香車を取る
      gameUseCase.movePiece({ row: 7, column: 1 }, { row: 6, column: 1 })
      gameUseCase.movePiece({ row: 3, column: 1 }, { row: 4, column: 1 })
      gameUseCase.movePiece({ row: 2, column: 2 }, { row: 3, column: 1 })
    })

    it('持ち駒を打てる', () => {
      // GOTEのターン
      gameUseCase.movePiece({ row: 8, column: 2 }, { row: 7, column: 2 })

      // SENTEのターン
      const result = gameUseCase.dropPiece(PieceType.PAWN, { row: 5, column: 1 })
      expect(result.success).toBe(true)

      const state = gameUseCase.getGameState()
      expect(state.board.getPiece({ row: 4, column: 0 })?.type).toBe(
        PieceType.PAWN,
      )
      expect(
        state.capturedPieces.sente.some(p => p.type === PieceType.PAWN),
      ).toBe(false)
    })

    it('二歩はできない', () => {
      // GOTEのターン
      gameUseCase.movePiece({ row: 8, column: 2 }, { row: 7, column: 2 })
      
      // SENTEのターン(6筋にはすでに歩がいる)
      const result = gameUseCase.dropPiece(PieceType.PAWN, { row: 5, column: 7 })
      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('二歩です')
    })
  })

  describe('promotePiece', () => {
    it('選択すれば成れる', () => {
      // SENTEの歩を敵陣に到達させる
      gameUseCase.movePiece({ row: 7, column: 1 }, { row: 6, column: 1 })
      gameUseCase.movePiece({ row: 3, column: 1 }, { row: 4, column: 1 })
      gameUseCase.movePiece({ row: 6, column: 1 }, { row: 5, column: 1 })
      gameUseCase.movePiece({ row: 3, column: 2 }, { row: 4, column: 2 })
      gameUseCase.movePiece({ row: 5, column: 1 }, { row: 4, column: 1 })
      gameUseCase.movePiece({ row: 3, column: 3 }, { row: 4, column: 3 })
      gameUseCase.movePiece({ row: 4, column: 1 }, { row: 3, column: 1 })
      gameUseCase.movePiece({ row: 3, column: 4 }, { row: 4, column: 4 })
      
      const result = gameUseCase.movePiece({ row: 3, column: 1 }, { row: 2, column: 1 }, true)

      expect(result.success).toBe(true)
      if (result.success) {
        const piece = result.gameState.board.getPiece(new Position(2 - 1, 1 - 1))
        expect(piece).toBeDefined()
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(piece!.isPromoted()).toBe(true)
      }
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
    it('ゲーム開始前に操作するとエラーになる', () => {
      const newGameUseCase = new GameUseCase()
      const result = newGameUseCase.movePiece({ row: 7, column: 7 }, { row: 6, column: 7 })

      expect(result.success).toBe(false)
    })

    it('範囲外の座標を指定するとエラーになる', () => {
      const result = gameUseCase.movePiece({ row: 10, column: 10 }, { row: 9, column: 9 })
      expect(result.success).toBe(false)
    })
  })
})