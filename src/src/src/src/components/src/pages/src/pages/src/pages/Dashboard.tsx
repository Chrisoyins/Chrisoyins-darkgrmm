import React from 'react';
import { dbService, authService } from '../services';

export default function Dashboard({ user }: any) {
  const [account, setAccount] = React.useState<any>(null);
  const [transactions, setTransactions] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function load() {
      // query accounts for this user
      const accounts = await dbService.query('accounts', (d: any) => d.userId === user.uid);
      setAccount(accounts[0] || null);
      const txs = (await dbService.query('transactions', (d: any) => d.fromAccountId === (accounts[0]?.id) || d.toAccountId === (accounts[0]?.id))).slice(-10).reverse();
      setTransactions(txs);
    }
    load();
  }, [user]);

  async function sendDemo() {
    if (!account) return;
    // find another account to send to
    const others = (await dbService.query('accounts', (d: any) => d.userId !== user.uid));
    if (others.length === 0) return alert('No other demo account available');
    const to = others[0];
    const tx = await dbService.createInternalTransaction({
      fromAccountId: account.id,
      toAccountId: to.id,
      amountCents: 1000,
      actorId: user.uid,
      idempotencyKey: 'demo-' + Date.now(),
      description: 'Demo send'
    });
    alert('Transaction status: ' + tx.status);
    // reload
    const accounts = await dbService.query('accounts', (d: any) => d.userId === user.uid);
    setAccount(accounts[0] || null);
    const txs = (await dbService.query('transactions', (d: any) => d.fromAccountId === (accounts[0]?.id) || d.toAccountId === (accounts[0]?.id))).slice(-10).reverse();
    setTransactions(txs);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      {account ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-sm text-gray-500">Available Balance</h3>
            <div className="text-2xl font-bold">${(account.availableCents / 100).toFixed(2)}</div>
            <div className="text-xs text-gray-500">Acct: {account.accountNumberMasked}</div>
          </div>
          <div className="bg-white p-4 rounded shadow md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent transactions</h3>
              <button onClick={sendDemo} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Send $10 (demo)</button>
            </div>
            <div className="mt-3">
              {transactions.length === 0 && <div className="text-sm text-gray-500">No transactions</div>}
              <ul className="divide-y">
                {transactions.map((t: any) => (
                  <li key={t.id} className="py-2 flex justify-between">
                    <div>
                      <div className="font-medium">{t.description}</div>
                      <div className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{t.fromAccountId === account.id ? '-' : '+'}${(t.amountCents / 100).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{t.status}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow">No account found for user.</div>
      )}
    </div>
  );
}
