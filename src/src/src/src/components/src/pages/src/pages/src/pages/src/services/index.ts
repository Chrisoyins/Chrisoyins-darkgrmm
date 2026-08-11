import mockAuth from './mockAuth';
import mockDb from './mockDb';

// Service loader picks mock services when VITE_DEMO_MODE=true
const DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

export const authService = DEMO ? mockAuth : mockAuth; // replace with real implementation later
export const dbService = DEMO ? mockDb : mockDb;
