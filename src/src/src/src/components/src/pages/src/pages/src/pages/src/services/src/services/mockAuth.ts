import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'mock_users';
const CURRENT_KEY = 'mock_current_user';

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}
function saveUsers(users: any[]) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function delay(ms = 250) { return new Promise((r) => setTimeout(r, ms)); }

const mockAuth = {
  async signUp(payload: any) {
    await delay();
    const users = loadUsers();
    if (users.find((u: any) => u.email === payload.email)) {
      throw new Error('Email already in use');
    }
    const uid = uuidv4();
    const user = {
      uid,
      email: payload.email,
      fullName: payload.fullName,
      phone: payload.phone,
      dob: payload.dob,
      address: payload.address,
      country: payload.country,
      userId: payload.userId,
      role: 'user',
      emailVerified: false,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
    localStorage.setItem(CURRENT_KEY, JSON.stringify({ uid: user.uid, email: user.email }));
    return { user };
  },

  async signIn(email: string, _password: string) {
    await delay();
    const users = loadUsers();
    const user = users.find((u: any) => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    localStorage.setItem(CURRENT_KEY, JSON.stringify({ uid: user.uid, email: user.email }));
    return { user };
  },

  async signOut() {
    await delay();
    localStorage.removeItem(CURRENT_KEY);
    return true;
  },

  async sendPasswordResetEmail(email: string) {
    await delay();
    const users = loadUsers();
    if (!users.find((u: any) => u.email === email)) throw new Error('Email not found');
    console.info('[mockAuth] password reset for', email);
    return true;
  },

  async sendEmailVerification() {
    await delay();
    const cur = JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
    if (!cur) throw new Error('Not logged in');
    const users = loadUsers();
    const user = users.find((u: any) => u.uid === cur.uid);
    if (user) { user.emailVerified = true; saveUsers(users); }
    return true;
  },

  currentUser() {
    const cur = JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
    if (!cur) return null;
    const users = loadUsers();
    return users.find((u: any) => u.uid === cur.uid) || null;
  },

  onAuthStateChanged(cb: (u: any) => void) {
    cb(this.currentUser());
    // no-op unsubscribe
    return () => {};
  },

  async updateProfile(updates: any) {
    await delay();
    const cur = JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null');
    if (!cur) throw new Error('Not authenticated');
    const users = loadUsers();
    const user = users.find((u: any) => u.uid === cur.uid);
    if (!user) throw new Error('User not found');
    Object.assign(user, updates);
    saveUsers(users);
    return user;
  },

  _createAdminForSeed(email: string) {
    const users = loadUsers();
    if (users.find((u: any) => u.email === email)) return;
    const uid = uuidv4();
    users.push({
      uid,
      email,
      fullName: 'Admin User',
      role: 'admin',
      emailVerified: true,
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
  }
};

export default mockAuth;
