import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";

config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.post("/api/referral", async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail, course } =
    req.body;

  if (
    !referrerName ||
    !referrerEmail ||
    !refereeName ||
    !refereeEmail ||
    !course
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
        course,
      },
    });

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: "Naveen Referal Portal",
      to: refereeEmail,
      subject: "Course Referral",
      text: `Hi ${refereeName},\n\n${referrerName} has referred you to the course: ${course}.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "referal send successfully",
      data: referral,
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use("/", (req, res) => {
  res.send("api working");
});
