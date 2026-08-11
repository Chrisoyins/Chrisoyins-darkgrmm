// src/mocks/demoData.ts
import { v4 as uuidv4 } from 'uuid';

export const demoSeed = () => {
  const adminId = uuidv4();
  const userA = uuidv4();
  const userB = uuidv4();
  const accountA = uuidv4();
  const accountB = uuidv4();

  const now = new Date().toISOString();

  const store: any = {
    users: {
      [adminId]: { id: adminId, email: 'admin@example.com', fullName: 'Admin User', role: 'admin', emailVerified: true, createdAt: now, updatedAt: now },
      [userA]: { id: userA, email: 'alice@example.com', fullName: 'Alice Customer', role: 'user', emailVerified: true, createdAt: now, updatedAt: now },
      [userB]: { id: userB, email: 'bob@example.com', fullName: 'Bob Customer', role: 'user', emailVerified: true, createdAt: now, updatedAt: now },
    },
    accounts: {
      [accountA]: {
        id: accountA,
        userId: userA,
        accountNumberMasked: '****1234',
        routingNumberMasked: '***000',
        currency: 'USD',
        availableCents: 500000,
        currentCents: 500000,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      [accountB]: {
        id: accountB,
        userId: userB,
        accountNumberMasked: '****5678',
        routingNumberMasked: '***000',
        currency: 'USD',
        availableCents: 150000,
        currentCents: 150000,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    },
    transactions: {},
    cardApplications: {},
    cards: {},
    supportTickets: {},
    notifications: {},
    auditLogs: {},
  };

  return store;
};
