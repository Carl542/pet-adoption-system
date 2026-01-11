const supabase = require('../supabaseClient');

exports.signUp = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    console.log('Signup attempt:', { email, fullName });

    // Use admin API to bypass email restrictions
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: { full_name: fullName }
    });

    if (authError) {
      console.error('Signup error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    console.log('Signup successful:', authData.user.email);
    res.status(201).json({ user: authData.user });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('Login failed:', error.message);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('Login successful:', data.user.email);
    res.json({ user: data.user, session: data.session });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Login failed' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === 'admin@shelter.com' && password === 'admin123') {
      return res.json({ 
        user: { 
          id: 'admin-1', 
          email: 'admin@shelter.com', 
          role: 'admin',
          user_metadata: { full_name: 'Admin User' }
        } 
      });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.signOut = async (req, res) => {
  try {
    await supabase.auth.signOut();
    res.json({ message: 'Signed out' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCurrentSession = async (req, res) => {
  try {
    const { data } = await supabase.auth.getSession();
    res.json(data.session);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};