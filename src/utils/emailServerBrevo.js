import * as Brevo from '@getbrevo/brevo';

const getBrevoClient = () => {
    const apiInstance = new Brevo.TransactionalEmailsApi();

    apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

    return apiInstance;
};

export const sendEmail = async (to, subject, message) => {
    console.log('sendEmail (Brevo) function called');

    const apiInstance = getBrevoClient();

    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
        name: 'Deal Karo',
        email: process.env.EMAIL_USER  // your verified sender email in Brevo
    };

    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.textContent = message;

    console.log('sending email via Brevo to:', to);

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('Brevo email sent, messageId:', data?.body?.messageId);

    return data;
};
