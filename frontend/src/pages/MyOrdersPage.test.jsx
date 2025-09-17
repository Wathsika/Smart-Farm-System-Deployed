import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyOrdersPage from './MyOrdersPage.jsx';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn((url) => {
      if (url === '/orders/myorders') {
        return Promise.resolve({
          data: [
            {
              _id: 'o1',
              orderNumber: 'ORD-2024-01-001',
              stripeSessionId: 'sess_123',
              createdAt: new Date().toISOString(),
              totalPrice: 20,
              status: 'PROCESSING',
              orderItems: [{ product: 'p1', name: 'Prod', qty: 1 }]
            }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    })
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'a@test.com' } })
}));

vi.mock('../components/common/InvoiceModal', () => ({
  default: () => <div />
}));

test('user can view orders', async () => {
  const client = new QueryClient();
  render(
    <QueryClientProvider client={client}>
      <MyOrdersPage />
    </QueryClientProvider>
  );

expect(await screen.findByText(/Order ORD-2024-01-001/)).toBeInTheDocument();
});