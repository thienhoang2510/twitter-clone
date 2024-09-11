export const signup = async (req, res) => {
  res.json({ data: 'You are on signup route', message: 'Signup' });
};

export const login = async (req, res) => {
  res.json({ data: 'You are on login route', message: 'Login' });
};

export const logout = async (req, res) => {
  res.json({ data: 'You are on logout route', message: 'Logout' });
};
