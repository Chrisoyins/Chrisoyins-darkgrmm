import React from 'react';
import { authService } from '../services';

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await authService.signIn(email, 'demo-password');
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Login</h2>
      <form onSubmit={handleSignIn} className="space-y-3">
        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Sign In</button>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </form>
    </div>
  );
}
