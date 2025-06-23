export type PieceType = '歩' | '香' | '桂' | '銀' | '金' | '角' | '飛'
export type Player = 'sente' | 'gote'
export type CapturedPieces = Partial<Record<PieceType, number>>