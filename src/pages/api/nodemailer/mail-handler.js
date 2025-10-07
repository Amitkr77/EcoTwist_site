import nodemailer from "nodemailer";

async function sendEmail({ to, subject, html }) {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: process.env.EMAIL_SERVER_PORT,
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Ecotwist" <${process.env.EMAIL_SERVER_USER}>`,
            to,
            subject,
            html,
        };

        // Retry logic (max 3 attempts)
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                await transporter.sendMail(mailOptions);
                return true; // email sent successfully
            } catch (error) {
                console.error(`Attempt ${attempt} failed to send email to ${to}`, error);
                if (attempt === 3) throw new Error("Failed to send email after 3 attempts");
            }
        }
    } catch (error) {
        console.error("Error in sending email:", error);
        throw new Error("Failed to send email");
    }
}
export default sendEmail;