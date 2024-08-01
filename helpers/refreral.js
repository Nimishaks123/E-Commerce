const nodemailer = require('nodemailer');

const sendreferal = (email, referralCode) => {
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
            subject: 'Referral',
            text: `Hi there,
      
      Your referral code is: ${referralCode}
      
      Use this code to refer your friends and earn rewards!
      
      Thanks,
      The [Your Company Name] Team`,
            html: `<!DOCTYPE html>
      <html>
      <body>
        <p>Hi there,</p>
        <p>Use this referral code and earn rewards!: <b>${referralCode}</b></p>
        <p>And you can earn more by referring your friends too.. </p>
        <p>Thanks,</p>
        <p>The Shopiz Team</p>
      </body>
      </html>
      `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error from Nodemailer:", err);
                reject(err);
            } else {
                console.log('Email referral sent:', info.response);
                resolve(info);
            }
        });
    });
}

module.exports = {
    sendreferal
};
    

