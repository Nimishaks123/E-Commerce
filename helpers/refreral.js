



const generateOtp = require('generate-otp');
const nodemailer = require('nodemailer');
require('dotenv').config();

// const generate = () => {
//     const otp = generateOtp.generate(4, {
//         length: 4,
//         digits: true,
//         uppercase: false,
//         alphabets: false,
//         specialChars: false,
//     });
//     return otp;
// }

const sendreferal = (email,referal) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Refreral',
            text: ` hai ${email} this is your ${referal}GEt 100 Rs`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error from Nodemailer:", err);
                reject(err);
            } else {
                console.log('Email referal  sent:', info.response);
                resolve(info);
            }
        });
    });
}

module.exports = {
    // generate,
    sendreferal
};

    

