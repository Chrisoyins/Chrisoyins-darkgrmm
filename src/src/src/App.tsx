import React from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DemoBadge from './components/DemoBadge';
import { authService } from './services';

export default function App() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const unsub = authService.onAuthStateChanged((u: any) => setUser(u));
    return unsub;
  }, []);

  return (
    <div className="min-h-screen">
      {import.meta.env.VITE_DEMO_MODE === 'true' && <DemoBadge />}
      <header className="p-4 bg-white shadow">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">[BANK NAME] Prototype</h1>
          <div>
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Hi, {user.fullName || user.email}</span>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                  onClick={() => authService.signOut()}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a className="text-sm text-blue-600" href="#/login">Login</a>
                <a className="text-sm text-blue-600" href="#/signup">Sign up</a>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {!user ? (
          <div>
            <section id="login" className="my-6">
              <Login />
            </section>
            <section id="signup" className="my-6">
              <Signup />
            </section>
          </div>
        ) : (
          <Dashboard user={user} />
        )}
      </main>
    </div>
  );
}
