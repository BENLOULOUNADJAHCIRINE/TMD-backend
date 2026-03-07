const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const login = async (req, res) => {
  try {
    const { matricule, password } = req.body;

    if (!matricule || !password) {
      return res.status(400).json({ message: 'matricule and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { matricule } });
    if (!user) return res.status(404).json({ message: 'user not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'wrong password' });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        matricule: user.matricule,
        role: user.role
      }
    });

  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'something went wrong' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { matricule, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { matricule } });
    if (!user) return res.status(404).json({ message: 'user not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'current password is wrong' });

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'new password must be at least 6 characters' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { matricule },
      data: { password: hashed }
    });

    res.json({ message: 'password updated' });

  } catch (err) {
    console.error('change password error:', err);
    res.status(500).json({ message: 'something went wrong' });
  }
};

const seedSuperAdmin = async (req, res) => {
  try {
    const exists = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (exists) return res.status(400).json({ message: 'super admin already exists' });

    const hashed = await bcrypt.hash('superadmin123', 10);

    await prisma.user.create({
      data: {
        fullName: 'Super Admin',
        matricule: 'SUPERADMIN',
        password: hashed,
        role: 'SUPER_ADMIN'
      }
    });

    res.status(201).json({ message: 'super admin created' });

  } catch (err) {
    console.error('seed error:', err);
    res.status(500).json({ message: 'something went wrong' });
  }
};

module.exports = { login, changePassword, seedSuperAdmin };