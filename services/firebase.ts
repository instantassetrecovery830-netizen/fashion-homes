
// Mock implementations to replace actual Firebase SDK to avoid build errors 
// when the package is missing or configured incorrectly in the environment.

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  reload: () => Promise<void>;
}

// Helper for Mock DB (Persistent Users stored in localStorage)
// This allows registration and login to actually work with specific credentials
const getMockUsersDB = () => {
    try {
        return JSON.parse(localStorage.getItem('mock_auth_db') || '{}');
    } catch { return {}; }
};

const saveMockUserToDB = (email: string, creds: any) => {
    const db = getMockUsersDB();
    db[email.toLowerCase()] = creds;
    localStorage.setItem('mock_auth_db', JSON.stringify(db));
};

// Internal mock session state
let currentUser: User | null = null;
try {
  const stored = localStorage.getItem('mock_firebase_user');
  if (stored) currentUser = JSON.parse(stored);
} catch (e) {}

const listeners: ((user: User | null) => void)[] = [];

const updateState = (user: User | null) => {
  currentUser = user;
  if (user) {
    localStorage.setItem('mock_firebase_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('mock_firebase_user');
  }
  listeners.forEach(cb => cb(user));
};

export const auth = {
  get currentUser() { return currentUser; }
};

export const onAuthStateChanged = (_auth: any, cb: (user: User | null) => void) => {
  listeners.push(cb);
  cb(currentUser);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

export const signInWithEmailAndPassword = async (_auth: any, email: string, password: string) => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 600));

  const db = getMockUsersDB();
  const record = db[email.toLowerCase()];

  // Validate credentials
  if (!record || record.password !== password) {
      const error: any = new Error("Invalid credentials");
      error.code = 'auth/invalid-credential'; // This triggers the UI error "Password or Email Incorrect"
      throw error;
  }

  const user: User = record.profile;
  updateState(user);
  return { user };
};

export const createUserWithEmailAndPassword = async (_auth: any, email: string, password: string) => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 600));
  
  const db = getMockUsersDB();
  if (db[email.toLowerCase()]) {
      const error: any = new Error("Email already in use");
      error.code = 'auth/email-already-in-use'; // This triggers the UI error "User already exists. Sign in?"
      throw error;
  }

  const user: User = {
    uid: 'mock-user-' + Date.now(),
    email,
    displayName: email.split('@')[0],
    photoURL: null,
    emailVerified: false, 
    reload: async () => {
        // Simulate reload to check verification status
        if (currentUser && currentUser.email === email) {
             const currentDB = getMockUsersDB();
             const currentRecord = currentDB[email.toLowerCase()];
             if (currentRecord && currentRecord.profile.emailVerified) {
                 const updated = { ...currentUser, emailVerified: true };
                 updateState(updated);
             }
        }
    }
  };
  
  // Save to mock DB
  saveMockUserToDB(email, { password, profile: user });
  updateState(user);
  return { user };
};

export const signOut = async (_auth: any) => {
  updateState(null);
};

export const signInWithGoogle = async () => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 800));

  const email = 'google@example.com';
  // Check if google user exists in DB, if not create one
  let db = getMockUsersDB();
  let user: User;

  if (db[email]) {
      user = db[email].profile;
  } else {
      user = {
        uid: 'google-user-' + Date.now(),
        email,
        displayName: 'Google User',
        photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200',
        emailVerified: true,
        reload: async () => {}
      };
      saveMockUserToDB(email, { password: 'google-auth-no-password', profile: user });
  }

  updateState(user);
  return { user };
};

export const sendEmailVerification = async (_user: User) => {
  console.log('Mock: Verification email sent.');
  // Auto-verify in background for mock purposes after a short delay to simulate user clicking link in email
  setTimeout(() => {
     if (_user.email) {
         const db = getMockUsersDB();
         if (db[_user.email.toLowerCase()]) {
             db[_user.email.toLowerCase()].profile.emailVerified = true;
             localStorage.setItem('mock_auth_db', JSON.stringify(db));
             console.log('Mock: Email auto-verified in DB. User can now login or click "I\'ve Verified".');
         }
     }
  }, 3000);
};

export const sendPasswordResetEmail = async (_auth: any, email: string) => {
  console.log(`Mock: Password reset sent to ${email}`);
};

export const updateUserPassword = async (_user: User, newPassword: string) => {
    if (_user.email) {
        const db = getMockUsersDB();
        if (db[_user.email.toLowerCase()]) {
            db[_user.email.toLowerCase()].password = newPassword;
            localStorage.setItem('mock_auth_db', JSON.stringify(db));
        }
    }
};
