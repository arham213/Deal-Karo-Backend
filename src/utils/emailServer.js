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
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.GOOGLE_APP_PASSWORD
        }
    });

    return transporter;
}


export const sendEmail = async (to, subject, message) => {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
        from: 'Deal Krein <arhamasjid213@gmail.com>',
        to: to,
        subject: subject,
        text: message
    })

    return info;
}