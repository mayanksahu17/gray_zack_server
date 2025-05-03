"use strict";
// mailer.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
/**
 * This module sets up the Nodemailer transport configuration using Gmail
 * and exports it for use in sending emails. It also imports the render function
 * from @react-email/render to be used with email templates.
 */
const nodemailer_1 = __importDefault(require("nodemailer")); // For sending emails via SMTP
/**
 * Nodemailer transport configuration using Gmail.
 *
 * Notes:
 * - Make sure to enable "Allow less secure apps" or use App Passwords if you have 2FA enabled.
 * - Ensure `EMAIL_USER` and `EMAIL_PASS` are set in your environment variables (.env.local).
 *
 * Environment Variables:
 * - EMAIL_USER: Your Gmail email address (e.g., example@gmail.com)
 * - EMAIL_PASS: Your Gmail app password (not the regular Gmail password)
 *
 * Example usage:
 *
 *   import { auth } from './mailer';
 *
 *   const mailOptions = {
 *     from: process.env.EMAIL_USER,
 *     to: 'recipient@example.com',
 *     subject: 'Hello!',
 *     html: '<p>This is a test email</p>',
 *   };
 *
 *   await auth.sendMail(mailOptions);
 */
exports.auth = nodemailer_1.default.createTransport({
    service: 'gmail', // Using Gmail as the SMTP service
    secure: true, // Use SSL (port 465)
    port: 465, // SMTP port for secure connection
    auth: {
        user: process.env.EMAIL_USER, // Gmail user from environment
        pass: process.env.EMAIL_PASS, // Gmail app password from environment
    },
});
