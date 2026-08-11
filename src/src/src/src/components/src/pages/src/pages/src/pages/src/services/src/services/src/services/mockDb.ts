// src/services/mockDb.ts
import { v4 as uuidv4 } from 'uuid';

const STORE_KEY = 'mock_db_store';

function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
}
function saveStore(s: any) { localStorage.setItem(STORE_KEY, JSON.stringify(s)); }

function ensureCollection(store: any, name: string) {
  if (!store[name]) store[name] = {};
}

const mockDb = {
  async getDoc(collection: string, id: string) {
    const store = loadStore();
    ensureCollection(store, collection);
    return store[collection][id] || null;
  },

  async setDoc(collection: string, id: string, data: any) {
    const store = loadStore();
    ensureCollection(store, collection);
    store[collection][id] = {
      ...data,
      id,
      createdAt: store[collection][id]?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveStore(store);
    return store[collection][id];
  },

  async addDoc(collection: string, data: any) {
    const id = uuidv4();
    return this.setDoc(collection, id, { ...data, id });
  },

  async query(collection: string, predicate?: (doc: any) => boolean) {
    const store = loadStore();
    ensureCollection(store, collection);
    const docs = Object.values(store[collection]);
    return predicate ? docs.filter(predicate) : docs;
  },

  async updateDoc(collection: string, id: string, patch: any) {
    const store = loadStore();
    ensureCollection(store, collection);
    if (!store[collection][id]) throw new Error('document not found');
    store[collection][id] = { ...store[collection][id], ...patch, updatedAt: new Date().toISOString() };
    saveStore(store);
    return store[collection][id];
  },

  async deleteDoc(collection: string, id: string) {
    const store = loadStore();
    ensureCollection(store, collection);
    delete store[collection][id];
    saveStore(store);
    return true;
  },

  // Simple atomic-like transaction for internal transfer simulation.
  async createInternalTransaction({ fromAccountId, toAccountId, amountCents, actorId, idempotencyKey, description }: any) {
    // Idempotency: check existing tx with same idempotencyKey and actor
    const existing = (await this.query('transactions', (d: any) => d.idempotencyKey === idempotencyKey && d.actorId === actorId))[0];
    if (existing) return existing;

    // Load accounts
    const from = await this.getDoc('accounts', fromAccountId);
    const to = await this.getDoc('accounts', toAccountId);
    if (!from || !to) throw new Error('Account not found');
    if (from.availableCents < amountCents) {
      const tx = await this.addDoc('transactions', {
        fromAccountId,
        toAccountId,
        amountCents,
        currency: from.currency,
        status: 'failed',
        actorId,
        idempotencyKey,
        description,
        isSandbox: true,
        createdAt: new Date().toISOString(),
        auditTrail: [{ action: 'create_failed', actor: actorId, note: 'insufficient_funds', ts: new Date().toISOString() }],
      });
      return tx;
    }

    // Deduct and credit
    from.availableCents -= amountCents;
    from.currentCents = (from.currentCents || 0) - amountCents;
    to.availableCents = (to.availableCents || 0) + amountCents;
    to.currentCents = (to.currentCents || 0) + amountCents;

    await this.setDoc('accounts', fromAccountId, from);
    await this.setDoc('accounts', toAccountId, to);

    const tx = await this.addDoc('transactions', {
      fromAccountId,
      toAccountId,
      amountCents,
      currency: from.currency,
      status: 'completed',
      actorId,
      idempotencyKey,
      description,
      isSandbox: true,
      createdAt: new Date().toISOString(),
      auditTrail: [{ action: 'created', actor: actorId, ts: new Date().toISOString(), note: 'internal_transfer' }],
    });

    // Immutable audit log
    await this.addDoc('auditLogs', {
      actor: actorId,
      action: 'internal-transfer',
      targetId: tx.id,
      details: { fromAccountId, toAccountId, amountCents },
      timestamp: new Date().toISOString(),
      isSandbox: true,
    });

    return tx;
  },

  // seed helper (dev-only)
  async _seed(data: any) {
    saveStore(data);
  },
};

export default mockDb;
