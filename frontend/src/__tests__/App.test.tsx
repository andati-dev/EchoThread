import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Provide explicit mock implementation for the axios instance
vi.mock('../api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
  }
})

test('renders and demo button registers', async () => {
  // Import the (mocked) api dynamically so we get the mocked functions
  const { default: api } = await import('../api')

  // Replace the mocked functions' resolved values
  (api.post as any).mockResolvedValue({ data: { token: 'tok' } })
  (api.get as any).mockResolvedValue({ data: [] })

  render(<App />)
  expect(screen.getByText(/Reddit Clone/i)).toBeInTheDocument()
  const demo = screen.getByText('Demo')
  await userEvent.click(demo)
  // token stored in localStorage
  expect(localStorage.getItem('token')).toBeTruthy()
})
