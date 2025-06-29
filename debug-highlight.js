// デバッグ用のスクリプト：緑色ハイライト問題を調査
// ブラウザのコンソールで実行して問題を特定する

console.log('🔧 デバッグスクリプト開始');

// GameManagerの状態を確認
setTimeout(() => {
  console.log('🔍 ページ読み込み後の状態確認');
  
  // 先手の歩（七5の位置）を探す
  const pawnButton = document.querySelector('[aria-label="先手の歩"]');
  if (pawnButton) {
    console.log('✅ 先手の歩を発見:', pawnButton);
    
    // クリックイベントをシミュレート
    console.log('🎯 駒をクリックします...');
    pawnButton.click();
    
    // 少し待ってからハイライト状態を確認
    setTimeout(() => {
      console.log('🔍 ハイライト状態を確認中...');
      
      // 緑色ハイライトを探す
      const greenCells = document.querySelectorAll('.bg-green-500');
      console.log('🟢 緑色ハイライトされたセル数:', greenCells.length);
      
      if (greenCells.length === 0) {
        console.log('❌ 緑色ハイライトが見つかりません');
        
        // 選択状態（青色）は確認できるか？
        const blueCells = document.querySelectorAll('.bg-blue-500');
        console.log('🔵 青色（選択状態）のセル数:', blueCells.length);
        
        // ハイライト用のクラスが存在するか確認
        const allCells = document.querySelectorAll('[data-testid^="cell-"]');
        console.log('📋 全セル数:', allCells.length);
        
        // 各セルのクラスを確認
        allCells.forEach((cell, index) => {
          if (index < 5) { // 最初の5個だけ表示
            console.log(`セル${index}のクラス:`, cell.className);
          }
        });
      } else {
        console.log('✅ 緑色ハイライトが見つかりました!');
        greenCells.forEach((cell, index) => {
          console.log(`緑色セル${index}:`, cell);
        });
      }
    }, 500);
  } else {
    console.log('❌ 先手の歩が見つかりません');
    
    // どんな駒ボタンがあるか確認
    const allPieceButtons = document.querySelectorAll('button[aria-label*="の"]');
    console.log('📋 発見された駒ボタン:', allPieceButtons.length);
    allPieceButtons.forEach((button, index) => {
      if (index < 10) { // 最初の10個だけ表示
        console.log(`駒${index}:`, button.getAttribute('aria-label'));
      }
    });
  }
}, 2000); // 2秒待ってから実行