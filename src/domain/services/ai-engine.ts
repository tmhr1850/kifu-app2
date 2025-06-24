import { IBoard } from '../models/piece/interface';
import { Player, Move } from '../models/piece/types';

/**
 * AIエンジンのインターフェース
 * コンピューター対戦用のAIが実装すべきインターフェース
 */
export interface IAIEngine {
  /**
   * 現在の盤面から最適な手を選択する
   * @param board - 現在の盤面
   * @param player - AIが操作するプレイヤー
   * @param timeLimit - 思考時間制限（ミリ秒）
   * @returns 選択された手
   */
  selectMove(board: IBoard, player: Player, timeLimit?: number): Promise<Move>;

  /**
   * AIエンジンの名前を取得
   * @returns エンジン名
   */
  getName(): string;

  /**
   * AIエンジンの強さレベルを取得（1-10）
   * @returns 強さレベル
   */
  getStrengthLevel(): number;
}