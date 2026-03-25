const prisma = require('../config/prisma');

const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contact = await prisma.contact.create({
      data: { name, email, message }
    });

    res.json({ message: 'Message sent successfully', contact });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

module.exports = { submitContact };