// __tests__/simple.test.tsx
import { render, screen } from '@testing-library/react';

test('renders basic JSX', () => {
  render(<div>Hello World</div>);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});