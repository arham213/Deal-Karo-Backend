import nodemailer from "nodemailer";

// const getTransporter = () => {
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: "arhamasjid213@gmail.com",
//             pass: process.env.GOOGLE_APP_PASSWORD
//         }
//     })

//     return transporter;
// }

const getTransporter = () => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.GOOGLE_APP_PASSWORD
        }
    });

    return transporter;
}


export const sendEmail = async (to, subject, message) => {
    console.log('sendEmail function called');

    console.log('getting transporter');
    const transporter = getTransporter();
    console.log('sending email via transporter:', transporter);

    const info = await transporter.sendMail({
        from: 'Deal Krein <arhamasjid213@gmail.com>',
        to: to,
        subject: subject,
        text: message
    })

    console.log('email sent with info:', info);

    return info;
}