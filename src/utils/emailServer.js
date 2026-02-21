import { Resend } from 'resend';
import * as Brevo from '@getbrevo/brevo';

// ── Resend ──────────────────────────────────────────────────────────────────

const sendViaResend = async (to, subject, message) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
        from: 'Deal Krein <no-reply@dealkroo.com>',
        to: to,
        subject: subject,
        text: message
    });

    if (error) throw new Error(`Resend error: ${error.message}`);

    console.log('✅ Email sent via Resend, id:', data?.id);
    return data;
};

// ── Brevo (fallback) ────────────────────────────────────────────────────────

const sendViaBrevo = async (to, subject, message) => {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: 'Deal Krein', email: process.env.EMAIL_USER };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.textContent = message;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('✅ Email sent via Brevo (fallback), messageId:', data?.body?.messageId);
    return data;
};

// ── Unified sendEmail with fallback ────────────────────────────────────────

export const sendEmail = async (to, subject, message) => {
    console.log('sendEmail called, trying Resend first...');

    try {
        return await sendViaResend(to, subject, message);
    } catch (resendError) {
        console.warn('⚠️ Resend failed, falling back to Brevo...', resendError.message);

        try {
            return await sendViaBrevo(to, subject, message);
        } catch (brevoError) {
            console.error('❌ Brevo fallback also failed:', brevoError.message);
            throw new Error(`All email providers failed. Resend: ${resendError.message} | Brevo: ${brevoError.message}`);
        }
    }
};