import { createTransport } from "nodemailer";

export const transporter = createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "jeanne45@ethereal.email",
    pass: "5pZ7Ct4hsGfXx8GbYD",
  },
});
