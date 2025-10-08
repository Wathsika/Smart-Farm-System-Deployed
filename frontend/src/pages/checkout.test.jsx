import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutPage from './checkout.jsx';
import { CartProvider } from '../context/CartContext.jsx';

vi.mock('../lib/api', () => ({
  api: {
    post: vi.fn(async () => ({ data: { url: 'http://stripe' } }))
  }
}));

// Helper to render with cart preloaded in localStorage
function renderWithCart() {
  window.localStorage.setItem(
    'smartfarm_cart_items',
    JSON.stringify([{ _id: 'p1', name: 'Prod', price: 10, quantity: 1 }])
  );
  return render(
    <CartProvider>
      <CheckoutPage />
    </CartProvider>
  );
}

test('user can proceed to checkout', async () => {
  // Mock location
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true
  });

  renderWithCart();

  await userEvent.type(screen.getByLabelText(/Name/i), 'Alice');
  await userEvent.type(screen.getByLabelText(/Phone Number/i), '123');
  await userEvent.type(screen.getByLabelText(/Email Address/i), 'a@test.com');
  await userEvent.type(screen.getByLabelText(/Street Address/i), 'Street');
  await userEvent.type(screen.getByLabelText(/City/i), 'Town');
  await userEvent.type(screen.getByLabelText(/Postal Code/i), '80250');

  await userEvent.click(screen.getByText(/Proceed to Payment/i));

  const { api } = await import('../lib/api');
  expect(api.post).toHaveBeenCalledWith(
    '/orders/create-checkout-session',
    expect.any(Object)
  );
  expect(window.location.href).toBe('http://stripe');
});