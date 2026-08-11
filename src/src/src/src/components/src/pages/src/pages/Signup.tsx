import React from 'react';
import { authService, dbService } from '../services';

export default function Signup() {
  const [form, setForm] = React.useState<any>({});
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const { user } = await authService.signUp({
        email: form.email,
        password: form.password || 'demo-password',
        fullName: form.fullName,
        phone: form.phone,
        dob: form.dob,
        address: form.address,
        country: form.country,
        userId: form.userId
      });
      // Create a demo account in mock DB when in demo mode
      await dbService.addDoc('accounts', {
        userId: user.uid,
        accountNumberMasked: '****' + Math.floor(1000 + Math.random() * 9000),
        routingNumberMasked: '***000',
        currency: 'USD',
        availableCents: 100000,
        currentCents: 100000,
        status: 'active'
      });
      setMessage('Signup complete. You are logged in.');
    } catch (err: any) {
      setMessage(err.message || 'Signup failed');
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Sign up</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
        <input placeholder="Full name" className="p-2 border rounded" onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input placeholder="Email" className="p-2 border rounded" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Phone" className="p-2 border rounded" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input placeholder="Date of birth" className="p-2 border rounded" onChange={(e) => setForm({ ...form, dob: e.target.value })} />
        <input placeholder="Address" className="p-2 border rounded" onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input placeholder="Country" className="p-2 border rounded" onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <input placeholder="User ID (optional)" className="p-2 border rounded" onChange={(e) => setForm({ ...form, userId: e.target.value })} />
        <input placeholder="Password" type="password" className="p-2 border rounded" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="px-4 py-2 bg-green-600 text-white rounded">Create account</button>
        {message && <div className="text-sm text-gray-700">{message}</div>}
      </form>
    </div>
  );
}
