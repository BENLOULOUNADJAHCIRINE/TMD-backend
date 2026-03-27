const prisma = require('../config/prisma');


const submitContact = async (req, res) => {
  try {
    const { name, email, phone, institution, message, agreedToPolicy} = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

     if (!agreedToPolicy) {
      return res.status(400).json({ message: 'You must agree to the privacy policy' });
    }

    // save to the contact table in database 
    const contact = await prisma.contact.create({
      data: {name, email, phone, institution, message, agreedToPolicy}
    });

    res.json({ message: 'Message sent successfully', contact });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

module.exports = { submitContact };


