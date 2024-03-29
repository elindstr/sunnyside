const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (emailObject) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: "sunnyside.sacramento@gmail.com",
        pass: process.env.GAUTH
        },
    });

    const info = await transporter.sendMail(emailObject);
    console.log('sent email:', info)
}

module.exports = { sendEmail };