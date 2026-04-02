const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

// main admin dashboard
const dashboard = async (req, res) => {
  try {
    const totalCertficates = await prisma.certificate.count();

    const activeCertificate = await prisma.certificate.count({
      where: { status: "ACTIVE" },
    });

    const revokedCertificate = await prisma.certificate.count({
      where: { status: "REVOKED" },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalVerification = await prisma.verification.count({
      where: {
        verifiedAt: { gte: thirtyDaysAgo },
      },
    });

    const recentActivity = await prisma.certificate.findMany({
      take: 10,
      include: {
        student: true,
      },
      orderbBy: {
        issueDate: "desc",
      },
    });
    res.status(200).json({
      totalCertficates,
      activeCertificate,
      revokedCertificate,
      totalVerification,
      recentActivity,
    });
  } catch (err) {
    res.status(500).json({ error: "an error occured in the server" });
  }
};

// get all requests
const getRequests = async (req, res) => {
  try {
    const totalRequests = await prisma.request.count();
    const pendingRequests = await prisma.request.count({
      where: { status: "PENDING" },
    });
    const approvedRequests = await prisma.request.count({
      where: { status: "APPROVED" },
    });
    const rejectedRequests = await prisma.request.count({
      where: { status: "REJECTED" },
    });
    const fullList = await prisma.request.findMany({
      include: {
        student: true,
      },
    });
    res.status(200).json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      fullList,
    });
  } catch (err) {
    res.status(500).json({ error: "an error occured in the server" });
  }
};

// revoke Certificate
const revokeCertificate = async (req, res) => {
  try {
    const id = req.params.id;
    const exist = await prisma.certificate.findUnique({
      where: { id: id },
    });
    if (!exist) {
      return res.status(400).json({ message: "certificate not found" });
    }
    if (exist.status === "REVOKED") {
      return res.status(400).json({ message: "certificate already revoked" });
    }
    await prisma.certificate.update({
      where: { id: id },
      data: {
        status: "REVOKED",
      },
    });
    res.status(200).json({ message: "Certificate revoked succesfully" });
  } catch (err) {
    res.status(500).json({ error: "an error occured in the server" });
  }
};

// Change admin password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await prisma.user.findUnique({
      where: { id: userId },
    });
    const { currentPassword, newPassword } = req.body;
    // check if the current password is correct
    const identical = await bcrypt.compare(currentPassword, student.password);
    if (!identical) {
      return res.status(400).json({ message: "Current password is false" });
    }
    // hash the new password and update it in the database
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: newHashedPassword,
      },
    });
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "an error occured in the server" });
  }
};

module.exports = { changePassword, revokeCertificate, getRequests, dashboard };
