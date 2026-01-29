import nodemailer from "nodemailer";

const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

export type OTPType = "LOGIN" | "RESET";

export const sendOTPEmail = async (email: string, otp: string, type: OTPType = "RESET") => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials not set. OTP for " + email + " is: " + otp);
        return; // Dev mode: log OTP to console
    }

    const transporter = getTransporter();

    let subject = "Your Password Reset OTP";
    let title = "Password Reset Request";
    let message = "You requested to reset your password. Please use the following One-Time Password (OTP) to proceed:";

    if (type === "LOGIN") {
        subject = "Your Login Verification Code";
        title = "Login Verification";
        message = "Please use the following code to complete your login verification:";
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || `"Admin System" <${process.env.SMTP_USER}>`,
        to: email,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #333; text-align: center;">${title}</h2>
                <p style="color: #666; font-size: 16px;">${message}</p>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #35622F;">${otp}</span>
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in ${type === "LOGIN" ? "3" : "1"} minutes.</p>
                <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">If you did not request this, please ignore this email.</p>
            </div>
        `,
    };

    // ... existing code ...
    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email} (${type})`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send OTP email");
    }
};

export const sendLoginNotification = async (
    email: string,
    status: "SUCCESS" | "FAILED" | "BLOCKED",
    ip: string,
    userAgent: string = "Unknown",
    reason?: string
) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

    const transporter = getTransporter();
    const timestamp = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });

    let subject = "";
    let color = "";
    let title = "";

    switch (status) {
        case "SUCCESS":
            subject = "New Login to CED Admin System";
            color = "#35622F"; // Green
            title = "New Successful Login";
            break;
        case "FAILED":
            subject = "Failed Login Attempt Detected";
            color = "#D32F2F"; // Red
            title = "Failed Login Attempt";
            break;
        case "BLOCKED":
            subject = "Login Blocked Detected";
            color = "#C62828"; // Dark Red
            title = "Login Blocked";
            break;
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || `"Admin System" <${process.env.SMTP_USER}>`,
        to: email,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: ${color}; text-align: center;">${title}</h2>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p><strong>Time:</strong> ${timestamp}</p>
                    <p><strong>IP Address:</strong> ${ip}</p>
                    <p><strong>Device:</strong> ${userAgent}</p>
                    ${reason ? `<p style="color: #D32F2F;"><strong>Reason:</strong> ${reason}</p>` : ""}
                </div>
                <p style="color: #666; font-size: 14px;">If this was you, you can ignore this email. If you did not recognize this activity, please contact the administrator immediately.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Login notification sent to ${email} (${status})`);
    } catch (error) {
        console.error("Error sending login notification:", error);
    }
};
