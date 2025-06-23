import { render, screen, fireEvent } from '@testing-library/react'

import { PieceType, Player } from '@/domain/models/piece/types'

import { CapturedPiecesUI } from './CapturedPiecesUI'
import type { CapturedPiece } from './types'

describe('CapturedPiecesUI', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it('空の持ち駒エリアを表示する', () => {
    render(
      <CapturedPiecesUI
        capturedPieces={[]}
        player={Player.SENTE}
        isMyTurn={true}
        onPieceClick={mockOnClick}
      />
    )

    expect(screen.getByTestId('captured-pieces-area')).toBeInTheDocument()
    expect(screen.queryByTestId('captured-piece')).not.toBeInTheDocument()
  })

  it('持ち駒を正しく表示する', () => {
    const capturedPieces: CapturedPiece[] = [
      { type: PieceType.PAWN, count: 1 },
      { type: PieceType.SILVER, count: 2 },
      { type: PieceType.GOLD, count: 1 },
    ]

    render(
      <CapturedPiecesUI
        capturedPieces={capturedPieces}
        player={Player.SENTE}
        isMyTurn={true}
        onPieceClick={mockOnClick}
      />
    )

    expect(screen.getByText('歩')).toBeInTheDocument()
    expect(screen.getByText('銀')).toBeInTheDocument()
    expect(screen.getByText('金')).toBeInTheDocument()
  })

  it('2枚以上の駒は枚数を表示する', () => {
    const capturedPieces: CapturedPiece[] = [
      { type: PieceType.PAWN, count: 3 },
      { type: PieceType.SILVER, count: 1 },
    ]

    render(
      <CapturedPiecesUI
        capturedPieces={capturedPieces}
        player={Player.SENTE}
        isMyTurn={true}
        onPieceClick={mockOnClick}
      />
    )

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })

  it('自分の手番の時はクリック可能', () => {
    const capturedPieces: CapturedPiece[] = [
      { type: PieceType.PAWN, count: 1 },
    ]

    render(
      <CapturedPiecesUI
        capturedPieces={capturedPieces}
        player={Player.SENTE}
        isMyTurn={true}
        onPieceClick={mockOnClick}
      />
    )

    const piece = screen.getByText('歩').closest('button')
    expect(piece).not.toBeDisabled()
    
    fireEvent.click(piece!)
    expect(mockOnClick).toHaveBeenCalledWith(PieceType.PAWN)
  })

  it('相手の手番の時はクリック不可', () => {
    const capturedPieces: CapturedPiece[] = [
      { type: PieceType.PAWN, count: 1 },
    ]

    render(
      <CapturedPiecesUI
        capturedPieces={capturedPieces}
        player={Player.SENTE}
        isMyTurn={false}
        onPieceClick={mockOnClick}
      />
    )

    const piece = screen.getByText('歩').closest('button')
    expect(piece).toBeDisabled()
    
    fireEvent.click(piece!)
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('選択中の駒をハイライト表示する', () => {
    const capturedPieces: CapturedPiece[] = [
      { type: PieceType.PAWN, count: 1 },
      { type: PieceType.SILVER, count: 1 },
    ]

    render(
      <CapturedPiecesUI
        capturedPieces={capturedPieces}
        player={Player.SENTE}
        isMyTurn={true}
        selectedPiece={PieceType.PAWN}
        onPieceClick={mockOnClick}
      />
    )

    const selectedPiece = screen.getByText('歩').closest('button')
    const unselectedPiece = screen.getByText('銀').closest('button')

    expect(selectedPiece).toHaveClass('ring-2')
    expect(unselectedPiece).not.toHaveClass('ring-2')
  })

  it('先手と後手で異なる背景色を表示する', () => {
    const capturedPieces: CapturedPiece[] = [
      { type: PieceType.PAWN, count: 1 },
    ]

    const { rerender } = render(
      <CapturedPiecesUI
        capturedPieces={capturedPieces}
        player={Player.SENTE}
        isMyTurn={true}
        onPieceClick={mockOnClick}
      />
    )

    const senteArea = screen.getByTestId('captured-pieces-area')
    expect(senteArea).toHaveClass('bg-blue-50')

    rerender(
      <CapturedPiecesUI
        capturedPieces={capturedPieces}
        player={Player.GOTE}
        isMyTurn={true}
        onPieceClick={mockOnClick}
      />
    )

    const goteArea = screen.getByTestId('captured-pieces-area')
    expect(goteArea).toHaveClass('bg-red-50')
  })

  it('駒を正しい順序で表示する（歩→香→桂→銀→金→角→飛）', () => {
    const capturedPieces: CapturedPiece[] = [
      { type: PieceType.ROOK, count: 1 },
      { type: PieceType.GOLD, count: 1 },
      { type: PieceType.PAWN, count: 1 },
      { type: PieceType.LANCE, count: 1 },
      { type: PieceType.BISHOP, count: 1 },
      { type: PieceType.SILVER, count: 1 },
      { type: PieceType.KNIGHT, count: 1 },
    ]

    render(
      <CapturedPiecesUI
        capturedPieces={capturedPieces}
        player={Player.SENTE}
        isMyTurn={true}
        onPieceClick={mockOnClick}
      />
    )

    const pieces = screen.getAllByTestId('captured-piece')
    const pieceTexts = pieces.map(p => p.textContent?.replace(/\d+/, ''))

    expect(pieceTexts).toEqual(['歩', '香', '桂', '銀', '金', '角', '飛'])
  })

  it('レスポンシブデザインで適切なサイズになる', () => {
    const capturedPieces: CapturedPiece[] = [
      { type: PieceType.PAWN, count: 1 },
    ]

    render(
      <CapturedPiecesUI
        capturedPieces={capturedPieces}
        player={Player.SENTE}
        isMyTurn={true}
        onPieceClick={mockOnClick}
      />
    )

    const piece = screen.getByText('歩').closest('button')
    expect(piece).toHaveClass('w-10', 'h-12', 'sm:w-12', 'sm:h-14', 'md:w-14', 'md:h-16')
  })
})