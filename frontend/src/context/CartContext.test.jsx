import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

function TestComponent() {
  const { cartItems, addToCart } = useCart();
  return (
    <div>
      <button onClick={() => addToCart({ _id: '1', name: 'Apple', price: 1 })}>
        Add
      </button>
      <span data-testid="count">{cartItems.length}</span>
    </div>
  );
}

test('user can add items to cart', () => {
  render(
    <CartProvider>
      <TestComponent />
    </CartProvider>
  );
  const count = screen.getByTestId('count');
  expect(count.textContent).toBe('0');
  fireEvent.click(screen.getByText('Add'));
  expect(count.textContent).toBe('1');
});