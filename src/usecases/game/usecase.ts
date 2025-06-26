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

// シリアライズされたゲームデータの型定義
interface SerializedPiece {
  type: PieceType;
  player: Player;
}

interface SerializedBoard {
  squares: (SerializedPiece | null)[][];
}

export class GameUseCase implements IGameUseCase {
  private gameState!: GameState
  private gameRules: GameRules

  constructor() {
    this.gameRules = new GameRules()
    this._initializeState()
  }

  private _initializeState(): void {
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
    this._initializeState()
    return this.gameState
  }

  movePiece(fromUI: UIPosition, toUI: UIPosition, isPromotion: boolean = false): MoveResult {
    // console.log('🎯 movePiece開始:', { fromUI, toUI, isPromotion });
    
    if (!this.gameState) {
      return {
        success: false,
        error: new Error('ゲームが開始されていません')
      }
    }
    const currentGameState = this.gameState

    let from: Position
    let to: Position
    try {
      from = this.toDomainPos(fromUI)
      to = this.toDomainPos(toUI)
      // console.log('🔄 座標変換:', { 
      //   fromUI: `{row:${fromUI.row}, column:${fromUI.column}}`, 
      //   fromDomain: `{row:${from.row}, column:${from.column}}`,
      //   toUI: `{row:${toUI.row}, column:${toUI.column}}`,
      //   toDomain: `{row:${to.row}, column:${to.column}}`
      // });
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Invalid arguments')
      return { success: false, error: err }
    }

    const piece = currentGameState.board.getPiece(from)
    // console.log('🔍 移動する駒:', piece ? { type: piece.type, player: piece.player } : 'null');
    
    if (!piece) {
      return {
        success: false,
        error: new InvalidMoveError('移動する駒が存在しません')
      }
    }
    if (piece.player !== currentGameState.currentPlayer) {
      return {
        success: false,
        error: new InvalidMoveError('自分の駒しか動かせません')
      }
    }

    const legalMoves = this.gameRules.generateLegalMoves(
      currentGameState.board,
      currentGameState.currentPlayer,
    )
    
    // console.log('📋 全合法手の確認:', legalMoves.length, '手');
    // const relevantMoves = legalMoves.filter(move => 
    //   move.from.row === from.row && move.from.column === from.column
    // );
    // console.log('🎯 この駒の合法手:', relevantMoves.map(m => 
    //   `from(${m.from.row},${m.from.column}) to(${m.to.row},${m.to.column})`
    // ));

    const isLegalMove = legalMoves.some(
      (move) =>
        move.from.row === from.row &&
        move.from.column === from.column &&
        move.to.row === to.row &&
        move.to.column === to.column,
    )
    
    // console.log('✅ 移動可能判定:', { 
    //   isLegalMove, 
    //   tryingTo: `{row:${to.row}, column:${to.column}}`
    // });

    if (!isLegalMove) {
      return {
        success: false,
        error: new InvalidMoveError('その手は指せません')
      }
    }

    // 成り処理のチェック
    if (isPromotion && !this.canPromote(fromUI, toUI)) {
      return {
        success: false,
        error: new InvalidMoveError('この駒は成ることができません')
      }
    }

    const capturedPiece = currentGameState.board.getPiece(to)
    
    let newCapturedPieces = currentGameState.capturedPieces
    if (capturedPiece) {
      const capturedList = currentGameState.currentPlayer === Player.SENTE
        ? currentGameState.capturedPieces.sente
        : currentGameState.capturedPieces.gote
      
      const unpromotedType = this.getUnpromotedType(capturedPiece.type)
      const newCapturedPiece = createPiece(
        unpromotedType,
        currentGameState.currentPlayer,
        null, // 持ち駒は位置情報なし
      )
      
      const newCapturedList = [...capturedList, newCapturedPiece]
      newCapturedPieces = {
        ...currentGameState.capturedPieces,
        [currentGameState.currentPlayer]: newCapturedList,
      }
    }

    const moveDefinition: Move = { from, to, isPromotion }
    const newBoard = currentGameState.board.applyMove(moveDefinition)

    const gameMove: GameMove = {
      from: fromUI,
      to: toUI,
      player: currentGameState.currentPlayer,
      piece: { type: piece.type, owner: piece.player },
      captured: capturedPiece ? { type: capturedPiece.type, owner: capturedPiece.player } : undefined,
      isPromotion,
      timestamp: new Date()
    }

    const newGameState: GameState = {
      ...currentGameState,
      board: newBoard as Board,
      currentPlayer: currentGameState.currentPlayer === Player.SENTE ? Player.GOTE : Player.SENTE,
      history: [...currentGameState.history, gameMove],
      capturedPieces: newCapturedPieces,
    }
    
    this.gameState = this.updateGameStatus(newGameState)

    return {
      success: true,
      gameState: this.gameState
    }
  }

  dropPiece(pieceType: PieceType, toUI: UIPosition): MoveResult {
    const currentGameState = this.gameState
    if (!currentGameState) {
      return {
        success: false,
        error: new Error('ゲームが開始されていません')
      }
    }

    const to = this.toDomainPos(toUI)

    const capturedList = currentGameState.currentPlayer === Player.SENTE
      ? currentGameState.capturedPieces.sente
      : currentGameState.capturedPieces.gote

    const pieceIndex = capturedList.findIndex((p) => p.type === pieceType && !p.position)
    if (pieceIndex === -1) {
      return {
        success: false,
        error: new InvalidMoveError('その駒を持っていません')
      }
    }

    if (currentGameState.board.getPiece(to)) {
      return {
        success: false,
        error: new InvalidMoveError('その場所には既に駒があります')
      }
    }

    if (pieceType === PieceType.PAWN && this.gameRules.isNifu(currentGameState.board, to.column, currentGameState.currentPlayer)) {
      return {
        success: false,
        error: new InvalidMoveError('二歩です')
      }
    }

    const pieceToDrop = capturedList[pieceIndex]
    
    const newCapturedList = [...capturedList]
    newCapturedList.splice(pieceIndex, 1)
    const newCapturedPieces = {
      ...currentGameState.capturedPieces,
      [currentGameState.currentPlayer]: newCapturedList,
    }

    const newBoard = currentGameState.board.clone() as Board
    newBoard.setPiece(to, pieceToDrop.clone(to))

    const gameMove: GameMove = {
      drop: pieceType,
      to: toUI,
      player: currentGameState.currentPlayer,
      timestamp: new Date()
    }
    
    const newGameState: GameState = {
      ...currentGameState,
      board: newBoard,
      currentPlayer: currentGameState.currentPlayer === Player.SENTE ? Player.GOTE : Player.SENTE,
      history: [...currentGameState.history, gameMove],
      capturedPieces: newCapturedPieces,
    }

    this.gameState = this.updateGameStatus(newGameState)

    return {
      success: true,
      gameState: this.gameState
    }
  }

  getGameState(): GameState {
    return this.gameState
  }

  getBoardPieces(): { piece: IPiece; position: UIPosition }[] {
    if (!this.gameState) {
      return []
    }

    const pieces: { piece: IPiece; position: UIPosition }[] = []
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const domainPos = new Position(row, col)
        const piece = this.gameState.board.getPiece(domainPos)
        if (piece) {
          pieces.push({ piece, position: this.toUIPos(domainPos) })
        }
      }
    }
    return pieces
  }

  getLegalMoves(fromUI?: UIPosition): UIPosition[] {
    if (!this.gameState || !fromUI) {
      // console.log('❌ getLegalMoves: gameStateまたはfromUIがありません', { gameState: !!this.gameState, fromUI });
      return []
    }
    const from = this.toDomainPos(fromUI)
    // console.log('🔍 getLegalMoves:', { 
    //   fromUI, 
    //   from: { row: from.row, column: from.column }, 
    //   currentPlayer: this.gameState.currentPlayer 
    // });
    
    const allLegalMoves = this.gameRules.generateLegalMoves(this.gameState.board, this.gameState.currentPlayer);
    // console.log('📋 全ての合法手:', allLegalMoves.length, '手');
    // console.log('👀 先頭5手:', allLegalMoves.slice(0, 5).map(m => ({ 
    //   from: { row: m.from.row, column: m.from.column }, 
    //   to: { row: m.to.row, column: m.to.column } 
    // })));
    
    const legalMoves = allLegalMoves.filter((move) => move.from.row === from.row && move.from.column === from.column);
    // console.log('🎯 この駒の合法手:', legalMoves.length, '手');
    // console.log('🔍 フィルタ条件:', { targetRow: from.row, targetCol: from.column });
    
    const result = legalMoves.map((m) => this.toUIPos(new Position(m.to.row, m.to.column)));
    // console.log('✅ UI座標の合法手:', result);
    
    return result;
  }

  canPromote(from: UIPosition, to: UIPosition): boolean {
    if (!this.gameState) {
      return false
    }
    const fromDomain = this.toDomainPos(from)
    const toDomain = this.toDomainPos(to)
    const piece = this.gameState.board.getPiece(fromDomain)

    if (!piece) {
      return false
    }

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

    if (
      (toDomain.row >= promotionZoneStart && toDomain.row <= promotionZoneEnd) ||
      (fromDomain.row >= promotionZoneStart && fromDomain.row <= promotionZoneEnd)
    ) {
      return true
    }

    return false
  }

  getLegalDropPositions(
    pieceType: PieceType,
    player: Player,
  ): UIPosition[] {
    const state = this.gameState;
    if (!state) {
      return []
    }

    const emptyPositions: UIPosition[] = []
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const domainPos = new Position(row, col)
        if (!state.board.getPiece(domainPos)) {
          emptyPositions.push(this.toUIPos(domainPos))
        }
      }
    }

    return emptyPositions.filter((uiPos) => {
      const domainPos = this.toDomainPos(uiPos)
      // 歩、香車、桂馬の打てない段をチェック
      if (player === Player.SENTE) {
        if (
          (pieceType === PieceType.PAWN || pieceType === PieceType.LANCE) &&
          uiPos.row === 1
        )
          return false
        if (pieceType === PieceType.KNIGHT && uiPos.row <= 2) return false
      } else {
        if (
          (pieceType === PieceType.PAWN || pieceType === PieceType.LANCE) &&
          uiPos.row === 9
        )
          return false
        if (pieceType === PieceType.KNIGHT && uiPos.row >= 8) return false
      }

      // 二歩チェック
      if (
        pieceType === PieceType.PAWN &&
        this.gameRules.isNifu(state.board, domainPos.column, player)
      ) {
        return false
      }

      return true
    })
  }

  resign(_player: Player): void {
    if (this.gameState) {
      this.gameState = {
        ...this.gameState,
        status: 'resigned',
        winner: _player === Player.SENTE ? Player.GOTE : Player.SENTE
      }
    }
  }

  private updateGameStatus(gameState: GameState): GameState {
    const newGameState = { ...gameState }
    const currentPlayer = newGameState.currentPlayer
    const opponentPlayer = currentPlayer === Player.SENTE ? Player.GOTE : Player.SENTE
    
    newGameState.isCheck = this.gameRules.isInCheck(newGameState.board, currentPlayer)

    const legalMoves = this.gameRules.generateLegalMoves(newGameState.board, currentPlayer)
    if (legalMoves.length === 0) {
      if (newGameState.isCheck) {
        newGameState.status = 'checkmate'
        newGameState.winner = opponentPlayer
      } else {
        newGameState.status = 'stalemate'
      }
    }
    return newGameState
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

  loadGameState(savedState: GameState): void {
    // Boardインスタンスを再構築
    const board = new Board()
    
    // 保存された盤面データからBoardを復元
    if (savedState.board && 'squares' in savedState.board) {
      const serializedBoard = savedState.board as unknown as SerializedBoard
      const squares = serializedBoard.squares
      
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const piece = squares[row]?.[col]
          if (piece && piece.type && piece.player) {
            const pos = new Position(row, col)
            const newPiece = createPiece(piece.type, piece.player)
            board.setPiece(pos, newPiece)
          }
        }
      }
    }
    
    // 持ち駒を復元（capturedPiecesをそのまま使用）
    const capturedPieces = {
      sente: savedState.capturedPieces?.sente?.map(p => createPiece(p.type, Player.SENTE)) || [],
      gote: savedState.capturedPieces?.gote?.map(p => createPiece(p.type, Player.GOTE)) || []
    }
    
    // ゲーム状態を更新
    this.gameState = {
      ...savedState,
      board: board,
      capturedPieces: capturedPieces
    }
  }
}