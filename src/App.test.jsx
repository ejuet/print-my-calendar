import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Credits } from "./calendar";

test('renders the credits page heading', () => {
  render(<Credits />);
  expect(screen.getByText(/info & credits/i)).toBeInTheDocument();
});
