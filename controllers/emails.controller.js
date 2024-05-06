import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import dotenv from 'dotenv';
dotenv.config();

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL,
        pass: PASSWORD
    }
});

const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'Bucks',
        link: 'https://mailgen.js/'
    }
});


export const sendVerification = async (req, res, token) => {
    const { email } = req.body;

    const response = {
        body: {
            intro: 'Welcome to Bucks, we\'re very excited to have you on board.',
            action: {
                instructions: 'To verify your account with Bucks, please click here:',
                button: {
                    color: '#22BC66',
                    text: 'Verify account',
                    link: `http://localhost:5173/verify/${token}`
                }
            },
            outro: 'If you didn\'t create an account with Bucks, please ignore this email.'
        }
    }

    const mail = mailGenerator.generate(response);

    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: 'Account verification',
        html: mail
    };

    try {
        transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send email' });
    }
};

export const sendResetPassword = async (req, res, token, OAuth) => {
    const { email } = req.body;

    const response = {
        body: {
            intro: 'You have requested to reset your password.',
            action: {
                instructions: `This is the code you need to reset your password: ${OAuth} \n Do not share this code with anyone else.`,
                button: {
                    color: '#22BC66',
                    text: 'Reset password',
                    link: `http://localhost:3000/password-reset/${token}`
                }
            },
            outro: 'If you didn\'t request to reset your password with Bucks, please ignore this email.'
        }
    }

    const mail = mailGenerator.generate(response);

    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: 'Reset password',
        html: mail
    };

    try {
        transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send email' });
    }
}