import { createTransport } from "nodemailer";

export const transporter = createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "josiah.bernier@ethereal.email",
    pass: "CvGXSBCQUt6zFveNuT",
  },
});
