import { render, screen, fireEvent } from '@testing-library/react'

import { CapturedPiecesUI } from './CapturedPiecesUI'

describe('CapturedPiecesUI', () => {
  const mockOnPieceClick = jest.fn()

  beforeEach(() => {
    mockOnPieceClick.mockClear()
  })

  it('空の持ち駒エリアが表示される', () => {
    render(
      <CapturedPiecesUI
        pieces={{}}
        isPlayerTurn={true}
        selectedPiece={null}
        onPieceClick={mockOnPieceClick}
        player="sente"
      />
    )

    const container = screen.getByTestId('captured-pieces-sente')
    expect(container).toBeInTheDocument()
  })

  it('持ち駒が正しく表示される', () => {
    const pieces = {
      '歩': 3,
      '香': 1,
      '桂': 2,
    }

    render(
      <CapturedPiecesUI
        pieces={pieces}
        isPlayerTurn={true}
        selectedPiece={null}
        onPieceClick={mockOnPieceClick}
        player="sente"
      />
    )

    expect(screen.getByText('歩')).toBeInTheDocument()
    expect(screen.getByText('×3')).toBeInTheDocument()
    expect(screen.getByText('香')).toBeInTheDocument()
    expect(screen.getByText('桂')).toBeInTheDocument()
    expect(screen.getByText('×2')).toBeInTheDocument()
  })

  it('手番でない場合、駒が暗く表示される', () => {
    const pieces = { '歩': 1 }

    render(
      <CapturedPiecesUI
        pieces={pieces}
        isPlayerTurn={false}
        selectedPiece={null}
        onPieceClick={mockOnPieceClick}
        player="sente"
      />
    )

    const pieceElement = screen.getByTestId('captured-piece-歩')
    expect(pieceElement).toHaveClass('opacity-50')
  })

  it('駒をクリックできる', () => {
    const pieces = { '歩': 1 }

    render(
      <CapturedPiecesUI
        pieces={pieces}
        isPlayerTurn={true}
        selectedPiece={null}
        onPieceClick={mockOnPieceClick}
        player="sente"
      />
    )

    const pieceElement = screen.getByTestId('captured-piece-歩')
    fireEvent.click(pieceElement)

    expect(mockOnPieceClick).toHaveBeenCalledWith('歩')
  })

  it('手番でない場合、駒をクリックできない', () => {
    const pieces = { '歩': 1 }

    render(
      <CapturedPiecesUI
        pieces={pieces}
        isPlayerTurn={false}
        selectedPiece={null}
        onPieceClick={mockOnPieceClick}
        player="sente"
      />
    )

    const pieceElement = screen.getByTestId('captured-piece-歩')
    fireEvent.click(pieceElement)

    expect(mockOnPieceClick).not.toHaveBeenCalled()
  })

  it('選択された駒がハイライトされる', () => {
    const pieces = { '歩': 1, '香': 1 }

    render(
      <CapturedPiecesUI
        pieces={pieces}
        isPlayerTurn={true}
        selectedPiece='歩'
        onPieceClick={mockOnPieceClick}
        player="sente"
      />
    )

    const selectedPiece = screen.getByTestId('captured-piece-歩')
    const unselectedPiece = screen.getByTestId('captured-piece-香')

    expect(selectedPiece).toHaveClass('ring-2')
    expect(unselectedPiece).not.toHaveClass('ring-2')
  })

  it('後手の持ち駒エリアが正しく表示される', () => {
    render(
      <CapturedPiecesUI
        pieces={{}}
        isPlayerTurn={true}
        selectedPiece={null}
        onPieceClick={mockOnPieceClick}
        player="gote"
      />
    )

    const container = screen.getByTestId('captured-pieces-gote')
    expect(container).toBeInTheDocument()
  })

  it('駒の順序が正しい（歩、香、桂、銀、金、角、飛）', () => {
    const pieces = {
      '飛': 1,
      '歩': 1,
      '金': 1,
      '香': 1,
      '角': 1,
      '銀': 1,
      '桂': 1,
    }

    render(
      <CapturedPiecesUI
        pieces={pieces}
        isPlayerTurn={true}
        selectedPiece={null}
        onPieceClick={mockOnPieceClick}
        player="sente"
      />
    )

    const pieceElements = screen.getAllByTestId(/captured-piece-/)
    const pieceTexts = pieceElements.map(el => el.textContent?.replace(/×\d+/, '').trim())

    expect(pieceTexts).toEqual(['歩', '香', '桂', '銀', '金', '角', '飛'])
  })

  it('1枚の場合は枚数表示がない', () => {
    const pieces = { '歩': 1 }

    render(
      <CapturedPiecesUI
        pieces={pieces}
        isPlayerTurn={true}
        selectedPiece={null}
        onPieceClick={mockOnPieceClick}
        player="sente"
      />
    )

    expect(screen.queryByText('×1')).not.toBeInTheDocument()
  })

  it('レスポンシブデザインで小画面でも適切に表示される', () => {
    const pieces = {
      '歩': 3,
      '香': 1,
      '桂': 2,
      '銀': 1,
      '金': 1,
    }

    render(
      <CapturedPiecesUI
        pieces={pieces}
        isPlayerTurn={true}
        selectedPiece={null}
        onPieceClick={mockOnPieceClick}
        player="sente"
      />
    )

    const container = screen.getByTestId('captured-pieces-sente')
    expect(container).toHaveClass('flex-wrap')
  })
})