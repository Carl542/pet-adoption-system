const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const signUp = async (email, password, fullName) => {
  try {
    console.log('Calling signup API:', `${API_URL}/auth/signup`);
    
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName })
    });
    
    const data = await response.json();
    console.log('Signup response:', { status: response.status, data });
    
    if (response.ok && data.user) {
      return { user: data.user, error: null };
    } else {
      return { user: null, error: data.error || 'Signup failed' };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return { user: null, error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    console.log('Calling login API:', `${API_URL}/auth/login`);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    console.log('Login response:', { status: response.status, data });
    
    if (response.ok && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isAuthenticated', 'true');
      return { user: data.user, session: data.session, error: null };
    } else {
      return { user: null, error: data.error || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, error: error.message };
  }
};

export const adminLogin = async (email, password) => {
  try {
    console.log('Calling admin login API:', `${API_URL}/auth/admin-login`);
    
    const response = await fetch(`${API_URL}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    console.log('Admin login response:', { status: response.status, data });
    
    if (response.ok && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('isAdmin', 'true');
      return { user: data.user, error: null };
    } else {
      return { user: null, error: data.error || 'Login failed' };
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return { user: null, error: error.message };
  }
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('isAdmin');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export const isAdmin = () => {
  return localStorage.getItem('isAdmin') === 'true';
};

export const getCurrentSession = async () => {
  const user = getCurrentUser();
  if (!user) return null;
  return { user };
};

export const signOut = async () => {
  try {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
    logout();
    return { error: null };
  } catch (error) {
    logout();
    return { error: error.message };
  }
};