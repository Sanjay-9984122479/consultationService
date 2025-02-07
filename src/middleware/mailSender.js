const nodemailer = require("nodemailer");

async function sendmail(recipientEmail,subject="Mail Subject",message) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service provider
        auth: {
            user: 'sanjaycoder6@gmail.com', 
            pass: 'qxge yqmr bdkg noaf', 
        },
    });
    
    const mailOptions = {
        from: 'sanjaycoder6@gmail.com',
        to: recipientEmail,
        subject: subject,
        text: message,
        
    };

    return transporter.sendMail(mailOptions);
}

module.exports = sendmail 