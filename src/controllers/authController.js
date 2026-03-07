const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const login = async (req, res) => {
  try {
    const { matricule, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { matricule }
    });

    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        matricule: user.matricule,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

const changePassword = async (req, res) => {
  try {
    const { matricule, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { matricule }
    });

    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { matricule },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

const seedSuperAdmin = async (req, res) => {
  try {
    const existing = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existing) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    const superAdmin = await prisma.user.create({
      data: {
        fullName: 'Super Admin',
        matricule: 'SUPERADMIN',
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    });

    res.json({ message: 'Super Admin created successfully', superAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

module.exports = { login, changePassword, seedSuperAdmin };