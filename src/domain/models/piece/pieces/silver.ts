import { IBoard } from '../interface';
import { Piece } from '../piece';
import { PieceType, Player, Position, Move } from '../types';

/**
 * 銀クラス
 */
export class Silver extends Piece {
  constructor(player: Player, position: Position | null = null) {
    super(PieceType.SILVER, player, position);
  }

  /**
   * 銀の移動可能な位置を計算
   * 前方3マス、斜め後ろ2マスに移動可能
   * @param board 現在の盤面状態
   * @returns 移動可能な位置の配列
   */
  getValidMoves(board: IBoard): Move[] {
    if (!this.position) {
      return [];
    }

    const moves: Move[] = [];
    const forward = this.player === Player.SENTE ? -1 : 1;
    
    // 移動可能な相対位置
    const directions = [
      // 前方3マス
      { dr: forward, dc: -1 },
      { dr: forward, dc: 0 },
      { dr: forward, dc: 1 },
      // 斜め後ろ2マス
      { dr: -forward, dc: -1 },
      { dr: -forward, dc: 1 },
    ];

    for (const { dr, dc } of directions) {
      const newPosition: Position = {
        row: this.position.row + dr,
        column: this.position.column + dc,
      };

      if (!board.isValidPosition(newPosition)) {
        continue;
      }

      const pieceAtDestination = board.getPieceAt(newPosition);
      
      // 移動先に味方の駒がある場合は移動不可
      if (pieceAtDestination && pieceAtDestination.player === this.player) {
        continue;
      }

      moves.push({
        from: this.position,
        to: newPosition,
        isPromotion: this.canPromote(newPosition),
      });
    }

    return moves;
  }
}