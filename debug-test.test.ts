import { describe, it, expect } from 'vitest';
import { GameRules } from './src/domain/services/game-rules';
import { Board } from './src/domain/models/board/board';
import { Player } from './src/domain/models/piece/types';

describe('Debug GameRules', () => {
  it('should debug generateLegalMoves in detail', () => {
    const gameRules = new GameRules();
    const board = Board.createInitialBoard();
    console.log('Board created');

    const pieces = board.getPieces(Player.SENTE);
    console.log('SENTE pieces count:', pieces.length);
    
    // 先手の全ての駒の詳細
    pieces.forEach((piece, index) => {
      console.log(`Piece ${index}:`, piece.type, 'at', piece.position);
      const moves = piece.getValidMoves(board);
      console.log(`  Valid moves for ${piece.type}:`, moves.length);
    });

    const moves = gameRules.generateLegalMoves(board, Player.SENTE);
    console.log('\n=== LEGAL MOVES BREAKDOWN ===');
    console.log('Generated moves:', moves.length);
    
    // 各駒タイプ別の合法手数をカウント
    const movesByPieceType = new Map();
    moves.forEach(move => {
      const piece = board.getPiece(move.from);
      if (piece) {
        const type = piece.type;
        movesByPieceType.set(type, (movesByPieceType.get(type) || 0) + 1);
      }
    });
    
    console.log('Moves by piece type:');
    movesByPieceType.forEach((count, type) => {
      console.log(`  ${type}: ${count} moves`);
    });
    
    console.log('Expected: around 30 moves (20 pawn moves + 4 knight moves + other pieces)');
    
    expect(moves.length).toBeGreaterThan(0);
  });

  it('should test empty board scenario', () => {
    const gameRules = new GameRules();
    const emptyBoard = new Board(); // 空の盤面
    
    const moves = gameRules.generateLegalMoves(emptyBoard, Player.SENTE);
    console.log('Empty board moves:', moves.length);
    expect(moves.length).toBe(0);
  });
  
  it('should test knight moves in detail', () => {
    const gameRules = new GameRules();
    const board = Board.createInitialBoard();
    
    // 桂馬の詳細チェック
    const knights = board.getPieces(Player.SENTE).filter(p => p.type === 'KNIGHT');
    console.log('\n=== KNIGHT ANALYSIS ===');
    console.log('Knight count:', knights.length);
    
    // 将棋の初期配置を確認
    console.log('Initial board layout (some key positions):');
    for (let row = 6; row <= 8; row++) {
      for (let col = 0; col <= 8; col++) {
        const piece = board.getPiece({ row, column: col });
        if (piece) {
          console.log(`  (${row}, ${col}): ${piece.type} (${piece.player})`);
        }
      }
    }
    
    knights.forEach((knight, index) => {
      console.log(`\nKnight ${index}:`, knight.position);
      const moves = knight.getValidMoves(board);
      console.log(`  Knight moves:`, moves);
      
      // 桂馬が移動しようとする位置をチェック
      if (knight.position) {
        const targetRow = knight.position.row - 2; // 先手桂馬は前に2マス
        const target1 = { row: targetRow, column: knight.position.column - 1 };
        const target2 = { row: targetRow, column: knight.position.column + 1 };
        
        console.log(`  Target positions: (${target1.row}, ${target1.column}) and (${target2.row}, ${target2.column})`);
        
        if (board.isValidPosition(target1)) {
          const piece1 = board.getPiece(target1);
          console.log(`    Target 1 (${target1.row}, ${target1.column}):`, piece1 ? `${piece1.type} (${piece1.player})` : 'empty');
        } else {
          console.log(`    Target 1 is invalid position`);
        }
        
        if (board.isValidPosition(target2)) {
          const piece2 = board.getPiece(target2);
          console.log(`    Target 2 (${target2.row}, ${target2.column}):`, piece2 ? `${piece2.type} (${piece2.player})` : 'empty');
        } else {
          console.log(`    Target 2 is invalid position`);
        }
      }
    });
  });
});