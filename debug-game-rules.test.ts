import { describe, it, expect } from 'vitest';
import { GameRules } from './src/domain/services/game-rules';
import { Board } from './src/domain/models/board/board';
import { Player } from './src/domain/models/piece/types';

describe('GameRules Debug', () => {
  it('should generate legal moves from initial board', () => {
    const board = Board.createInitialBoard();
    const gameRules = new GameRules();
    
    console.log('🎮 Initial board created');
    
    // 先手の駒を取得
    const sentePieces = board.getPieces(Player.SENTE);
    console.log('👑 Sente pieces:', sentePieces.length);
    
    // 各駒の詳細をログ
    sentePieces.forEach((piece, index) => {
      console.log(`駒${index + 1}:`, {
        type: piece.type,
        player: piece.player,
        position: piece.position ? { row: piece.position.row, column: piece.position.column } : null
      });
      
      // 各駒の有効手も確認
      if (piece.position) {
        const validMoves = piece.getValidMoves(board);
        console.log(`  └─ Valid moves: ${validMoves.length} 手`);
        if (validMoves.length > 0) {
          console.log(`     例: ${validMoves.slice(0, 3).map(m => `(${m.row},${m.column})`).join(', ')}`);
        }
      }
    });
    
    // 合法手を生成
    console.log('\n🔍 Generating legal moves...');
    const legalMoves = gameRules.generateLegalMoves(board, Player.SENTE);
    console.log('🎯 Legal moves count:', legalMoves.length);
    
    // 先頭10手を表示
    if (legalMoves.length > 0) {
      console.log('\n📝 First 10 moves:');
      legalMoves.slice(0, 10).forEach((move, index) => {
        console.log(`${index + 1}:`, {
          from: { row: move.from.row, column: move.from.column },
          to: { row: move.to.row, column: move.to.column },
          isPromotion: move.isPromotion
        });
      });
    } else {
      console.log('❌ No legal moves found!');
    }
    
    expect(legalMoves.length).toBeGreaterThan(0);
  });
});