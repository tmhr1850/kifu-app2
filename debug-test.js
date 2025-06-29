const { GameRules } = require('./src/domain/services/game-rules.ts');
const { Board } = require('./src/domain/models/board/board.ts');
const { Player } = require('./src/domain/models/piece/types.ts');

// 初期配置ボードでの合法手を確認
const board = Board.createInitialBoard();
const gameRules = new GameRules();

console.log('🎮 Initial board created');
console.log('🔢 Board size:', Board.SIZE);

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
});

// 合法手を生成
const legalMoves = gameRules.generateLegalMoves(board, Player.SENTE);
console.log('🎯 Legal moves count:', legalMoves.length);

// 先頭10手を表示
console.log('📝 First 10 moves:');
legalMoves.slice(0, 10).forEach((move, index) => {
  console.log(`${index + 1}:`, {
    from: { row: move.from.row, column: move.from.column },
    to: { row: move.to.row, column: move.to.column },
    isPromotion: move.isPromotion
  });
});