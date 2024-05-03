import Mailgen from 'mailgen';

// Initialize Mailgen with default theme
const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'uRide',
        link: 'https://uRide.io/',
    },
});

// Generate the forgot password email template
export const sendOtpEmailTemplate = (receiverName, otp) => {
    const email = {
        body: {
            name: receiverName,
            intro: 'Here is your token for email verification, note this will expire in 5 minutes : \n' + otp,

            outro: "If you didn't request this, you can safely ignore this email.",
        },
    };

    // Generate an HTML email with the provided contents
    return mailGenerator.generate(email);
};