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
export const passwordResetEmail = (receiverName, resetPasswordLink) => {
  const email = {
    body: {
      name: receiverName,
      intro: 'You have requested to reset your password. Please click the button below to reset it:',
      action: {
        instructions: 'Click the button below to reset your password:',
        button: {
          color: '#22BC66',
          text: 'Reset Password',
          link: resetPasswordLink, // This should be the actual reset password link
        },
      },
      outro: "If you didn't request this, you can safely ignore this email.",
    },
  };

  // Generate an HTML email with the provided contents
  const emailBody = mailGenerator.generate(email);

  return emailBody;
};