import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { BoardUI } from './BoardUI'

describe('BoardUI', () => {
  it('renders a 9x9 grid', () => {
    render(<BoardUI />)
    
    // 9x9 = 81 squares
    const squares = screen.getAllByRole('button', { name: /square/i })
    expect(squares).toHaveLength(81)
  })

  it('displays column coordinates (1-9)', () => {
    render(<BoardUI />)
    
    // Check column numbers
    for (let i = 1; i <= 9; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument()
    }
  })

  it('displays row coordinates (一-九)', () => {
    render(<BoardUI />)
    
    const japaneseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
    
    // Check row labels
    japaneseNumbers.forEach(num => {
      expect(screen.getByText(num)).toBeInTheDocument()
    })
  })

  it('handles square click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<BoardUI onSquareClick={handleClick} />)
    
    const firstSquare = screen.getAllByRole('button', { name: /square/i })[0]
    await user.click(firstSquare)
    
    expect(handleClick).toHaveBeenCalledWith({ row: 0, col: 0 })
  })

  it('highlights selected square', async () => {
    const user = userEvent.setup()
    
    render(<BoardUI />)
    
    const targetSquare = screen.getAllByRole('button', { name: /square/i })[0]
    await user.click(targetSquare)
    
    expect(targetSquare).toHaveClass('bg-blue-200')
  })

  it('highlights movable squares', () => {
    const movableSquares = [
      { row: 1, col: 1 },
      { row: 2, col: 2 }
    ]
    
    render(<BoardUI movableSquares={movableSquares} />)
    
    const allSquares = screen.getAllByRole('button', { name: /square/i })
    
    // Check that movable squares have highlight class
    const square1 = allSquares[1 * 9 + 1] // row 1, col 1
    const square2 = allSquares[2 * 9 + 2] // row 2, col 2
    
    expect(square1).toHaveClass('bg-green-200')
    expect(square2).toHaveClass('bg-green-200')
  })

  it('maintains responsive square aspect ratio', () => {
    render(<BoardUI />)
    
    const board = screen.getByTestId('shogi-board')
    expect(board).toHaveClass('aspect-square')
  })
})