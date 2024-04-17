import Mailgen from "mailgen";

var mailGenerator = new Mailgen({
	theme: "default",
	product: {
		// Appears in header & footer of e-mails
		name: "uRide",
		link: "https://uRide.io/",
		// Optional logo
		// logo: 'https://uRide.io/img/logo.png'
	},
});

export const welcomeEmail = (receiverName) => {

    
    // Prepare email contents
    var email = {
        body: {
            name: receiverName,
            intro: "Welcome to uRide! We're very excited to have you on board.",
            action: {
                instructions:
				"To get started with uRide, please vrify your phone Number:",
                button: {
                    color: "#22BC66",
                    text: "Confirm your account",
                    link: "https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010",
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
    
    // Generate an HTML email with the provided contents
    var emailBody = mailGenerator.generate(email);

    return emailBody;
}