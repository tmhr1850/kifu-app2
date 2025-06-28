// デバッグ用テスト：getLegalMovesの動作確認
import { GameUseCase } from './src/usecases/game/usecase';
import { Player } from './src/domain/models/piece/types';

describe('デバッグ: getLegalMoves', () => {
  test('初期状態で先手の合法手を取得', () => {
    const gameUseCase = new GameUseCase();
    gameUseCase.startNewGame();
    
    // 七九の歩の合法手を取得
    const legalMoves = gameUseCase.getLegalMoves({ row: 7, column: 9 });
    
    console.log('🎯 七九の歩の合法手:', legalMoves);
    
    // 最低でも1手はあるはず（六九への移動）
    expect(legalMoves.length).toBeGreaterThan(0);
  });
  
  test('初期状態で全ての合法手を取得', () => {
    const gameUseCase = new GameUseCase();
    gameUseCase.startNewGame();
    
    // 全駒の情報を確認
    const boardPieces = gameUseCase.getBoardPieces();
    console.log('🎮 盤面の駒数:', boardPieces.length);
    
    const sentePieces = boardPieces.filter(p => p.piece.player === Player.SENTE);
    console.log('👑 先手の駒数:', sentePieces.length);
    
    // 各駒の位置を確認
    sentePieces.forEach((p, i) => {
      if (i < 5) { // 最初の5個だけ表示
        console.log(`駒${i}: ${p.piece.type} at (${p.position.row}, ${p.position.column})`);
      }
    });
  });
});