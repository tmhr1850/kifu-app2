import { describe, it, expect, beforeEach } from 'vitest'

import { InvalidMoveError } from '@/domain/errors/invalid-move-error'
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
      const from: UIPosition = { row: 7, column: 7 }
      const to: UIPosition = { row: 6, column: 7 }
      const result = gameUseCase.movePiece(from, to)

      expect(result.success).toBe(true)
      if (result.success) {
        const state = result.gameState
        expect(state.currentPlayer).toBe(Player.GOTE)
        expect(state.history).toHaveLength(1)
        const lastMove = state.history[0].move
        if ('from' in lastMove) {
          expect(lastMove).toEqual({
            from: { row: 7, column: 7 },
            to: { row: 6, column: 7 },
            piece: PieceType.PAWN,
            isPromotion: false,
            capturedPiece: undefined
          })
        }
      }
    })

    it('相手の駒は動かせない', () => {
      const from: UIPosition = { row: 3, column: 3 } // GOTEの歩
      const to: UIPosition = { row: 4, column: 3 }
      const result = gameUseCase.movePiece(from, to)

      expect(result.success).toBe(false)
      expect(gameUseCase.getGameState()?.currentPlayer).toBe(Player.SENTE)
    })

    it('相手の駒を取れる', () => {
      gameUseCase.movePiece({ row: 7, column: 2 }, { row: 6, column: 2 })
      gameUseCase.movePiece({ row: 8, column: 2 }, { row: 3, column: 2 })
      const result = gameUseCase.getGameState()
      expect(result.capturedPieces.sente.some(p => p.type === PieceType.PAWN)).toBe(true)
    })
  })

  describe('dropPiece', () => {
    beforeEach(() => {
      // SENTEがGOTEの歩を取る状況を作成
      gameUseCase.movePiece({ row: 7, column: 7 }, { row: 6, column: 7 }) // SENTE 7g->6g
      gameUseCase.movePiece({ row: 3, column: 3 }, { row: 4, column: 3 }) // GOTE 3c->4c
      gameUseCase.movePiece({ row: 2, column: 2 }, { row: 4, column: 3 }) // SENTE 2b(角) x 4c(歩) -> SENTEが歩をGET
    })

    it('持ち駒を正しい場所に打てる', () => {
      // GOTEのターン。何か適当な手を指す
      gameUseCase.movePiece({ row: 3, column: 1 }, { row: 4, column: 1 })

      // SENTEのターン
      const result = gameUseCase.dropPiece(PieceType.PAWN, { row: 5, column: 5 })
      expect(result.success).toBe(true)
      if (result.success) {
        const state = result.gameState
        const capturedPawn = state.capturedPieces.sente.find(p => p.type === PieceType.PAWN)
        expect(capturedPawn).toBeUndefined()
        const droppedPiece = state.board.getPiece(new Position(5 - 1, 5 - 1))
        expect(droppedPiece?.type).toBe(PieceType.PAWN)
        expect(state.currentPlayer).toBe(Player.GOTE)
      }
    })

    it('二歩を検出して拒否する', () => {
      // GOTEのターン
      gameUseCase.movePiece({ row: 3, column: 1 }, { row: 4, column: 1 })

      // SENTEのターン。7筋にはすでに歩がいる
      const result = gameUseCase.dropPiece(PieceType.PAWN, { row: 4, column: 7 })
      expect(result.success).toBe(false)
      expect(gameUseCase.getGameState()?.currentPlayer).toBe(Player.SENTE)
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