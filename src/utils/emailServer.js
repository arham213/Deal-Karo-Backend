import { Resend } from 'resend';

const getResendClient = () => {
    return new Resend(process.env.RESEND_API_KEY);
};

export const sendEmail = async (to, subject, message) => {
    console.log('sendEmail function called');

    const resend = getResendClient();

    console.log('sending email via Resend to:', to);

    const { data, error } = await resend.emails.send({
        from: 'Deal Karo <no-reply@dealkroo.com>',
        to: to,
        subject: subject,
        text: message
    });

    if (error) {
        console.error('Resend EMAIL ERROR:', error);
        throw new Error(error.message);
    }

    console.log('email sent with id:', data?.id);
    return data;
};