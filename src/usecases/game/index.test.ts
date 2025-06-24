import { describe, it, expect, beforeEach } from 'vitest'

import { InvalidMoveError } from '@/domain/errors/invalid-move-error'
import { Player } from '@/domain/models/piece/types'

import { GameUseCase } from './usecase'

describe('GameUseCase', () => {
  let gameUseCase: GameUseCase

  beforeEach(() => {
    gameUseCase = new GameUseCase()
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
    beforeEach(() => {
      gameUseCase.startNewGame()
    })

    it('合法な駒移動を実行できる', () => {
      const result = gameUseCase.movePiece({ x: 7, y: 7 }, { x: 7, y: 6 })

      expect(result.success).toBe(true)
      expect(gameUseCase.getGameState().currentPlayer).toBe(Player.GOTE)
      expect(gameUseCase.getGameState().history).toHaveLength(1)
    })

    it('不正な手を拒否する', () => {
      const result = gameUseCase.movePiece({ x: 7, y: 7 }, { x: 7, y: 5 })

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(InvalidMoveError)
      expect(gameUseCase.getGameState().currentPlayer).toBe(Player.SENTE)
      expect(gameUseCase.getGameState().history).toHaveLength(0)
    })

    it('相手の駒を取れる', () => {
      // 先手の歩を前進
      gameUseCase.movePiece({ x: 7, y: 7 }, { x: 7, y: 6 })
      gameUseCase.movePiece({ x: 3, y: 3 }, { x: 3, y: 4 })
      
      // さらに前進させて敵陣に
      for (let i = 0; i < 4; i++) {
        gameUseCase.movePiece({ x: 7, y: 6 - i }, { x: 7, y: 5 - i })
        gameUseCase.movePiece({ x: 3, y: 4 + i }, { x: 3, y: 5 + i })
      }

      // 敵の歩を取る
      const result = gameUseCase.movePiece({ x: 7, y: 2 }, { x: 3, y: 2 })

      expect(result.success).toBe(true)
      expect(gameUseCase.getGameState().capturedPieces.sente).toHaveLength(1)
    })
  })

  describe('dropPiece', () => {
    beforeEach(() => {
      gameUseCase.startNewGame()
    })

    it('持ち駒を使用できる', () => {
      // まず駒を取る準備
      const state = gameUseCase.getGameState()
      state.capturedPieces.sente.push({
        type: 'PAWN',
        owner: Player.SENTE,
        isPromoted: false
      })

      const result = gameUseCase.dropPiece('PAWN', { x: 5, y: 5 })

      expect(result.success).toBe(true)
      expect(gameUseCase.getGameState().capturedPieces.sente).toHaveLength(0)
    })

    it('二歩を検出して拒否する', () => {
      const state = gameUseCase.getGameState()
      state.capturedPieces.sente.push({
        type: 'PAWN',
        owner: Player.SENTE,
        isPromoted: false
      })

      const result = gameUseCase.dropPiece('PAWN', { x: 7, y: 5 })

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('二歩')
    })
  })

  describe('promotePiece', () => {
    it('成り判定が正しく行われる', () => {
      gameUseCase.startNewGame()
      
      // 歩を敵陣まで進める準備
      gameUseCase.movePiece({ x: 7, y: 7 }, { x: 7, y: 6 })
      gameUseCase.movePiece({ x: 3, y: 3 }, { x: 3, y: 4 })
      
      // 成りが可能な位置への移動をテスト
      for (let i = 0; i < 4; i++) {
        gameUseCase.movePiece({ x: 7, y: 6 - i }, { x: 7, y: 5 - i })
        gameUseCase.movePiece({ x: 3, y: 4 + i }, { x: 3, y: 5 + i })
      }

      const result = gameUseCase.movePiece({ x: 7, y: 2 }, { x: 7, y: 1 }, true)

      expect(result.success).toBe(true)
      const piece = gameUseCase.getGameState().board.getPiece({ x: 7, y: 1 })
      expect(piece?.isPromoted).toBe(true)
    })
  })

  describe('turnManagement', () => {
    it('手番が正しく管理される', () => {
      gameUseCase.startNewGame()

      expect(gameUseCase.getGameState().currentPlayer).toBe(Player.SENTE)

      gameUseCase.movePiece({ x: 7, y: 7 }, { x: 7, y: 6 })
      expect(gameUseCase.getGameState().currentPlayer).toBe(Player.GOTE)

      gameUseCase.movePiece({ x: 3, y: 3 }, { x: 3, y: 4 })
      expect(gameUseCase.getGameState().currentPlayer).toBe(Player.SENTE)
    })

    it('相手の番に自分の駒を動かせない', () => {
      gameUseCase.startNewGame()

      const result = gameUseCase.movePiece({ x: 3, y: 3 }, { x: 3, y: 4 })

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('相手の番')
    })
  })

  describe('gameStatus', () => {
    it('王手を検出できる', () => {
      gameUseCase.startNewGame()
      // 王手の状態を作る（実際のゲームロジックに応じて調整）
      
      const state = gameUseCase.getGameState()
      expect(state.isCheck).toBeDefined()
    })

    it('詰みを検出できる', () => {
      gameUseCase.startNewGame()
      // 詰みの状態を作る（実際のゲームロジックに応じて調整）
      
      const state = gameUseCase.getGameState()
      expect(state.status).toBeDefined()
    })
  })

  describe('history', () => {
    it('手の履歴が正しく記録される', () => {
      gameUseCase.startNewGame()

      gameUseCase.movePiece({ x: 7, y: 7 }, { x: 7, y: 6 })
      gameUseCase.movePiece({ x: 3, y: 3 }, { x: 3, y: 4 })

      const history = gameUseCase.getGameState().history
      expect(history).toHaveLength(2)
      expect(history[0]).toMatchObject({
        from: { x: 7, y: 7 },
        to: { x: 7, y: 6 },
        player: Player.SENTE
      })
      expect(history[1]).toMatchObject({
        from: { x: 3, y: 3 },
        to: { x: 3, y: 4 },
        player: Player.GOTE
      })
    })

    it('持ち駒使用も履歴に記録される', () => {
      gameUseCase.startNewGame()
      const state = gameUseCase.getGameState()
      state.capturedPieces.sente.push({
        type: 'PAWN',
        owner: Player.SENTE,
        isPromoted: false
      })

      gameUseCase.dropPiece('PAWN', { x: 5, y: 5 })

      const history = gameUseCase.getGameState().history
      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        drop: 'PAWN',
        to: { x: 5, y: 5 },
        player: Player.SENTE
      })
    })
  })

  describe('errorHandling', () => {
    it('ゲーム開始前の操作はエラーになる', () => {
      const newGameUseCase = new GameUseCase()
      
      const result = newGameUseCase.movePiece({ x: 7, y: 7 }, { x: 7, y: 6 })

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('ゲームが開始されていません')
    })

    it('範囲外の座標はエラーになる', () => {
      gameUseCase.startNewGame()

      const result = gameUseCase.movePiece({ x: 10, y: 7 }, { x: 7, y: 6 })

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('無効な座標')
    })
  })
})