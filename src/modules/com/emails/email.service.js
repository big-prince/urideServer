import nodemailer from "nodemailer";
import { welcomeEmail } from "./templs/welcome.js";

let config = {
	service: "gmail", // your email domain
	auth: {
		user: process.env.SMTP_USERNAME, // your email address
		pass: process.env.SMTP_PASSWORD, // your password
	},
};


let transporter = nodemailer.createTransport(config);

//send welcome email
export const sendWelcomeEmail = (receiverEmail, receiverName) => {
    
	let message = {
		from: process.env.EMAIL_FROM, // sender address
		to: receiverEmail, // list of receivers
		subject: "Welcome to uRide!", // Subject line
		html: welcomeEmail(receiverName), // html body
	};
    
	let res = fireEmail(message);
	return res;
};


function fireEmail(message) {
	transporter
		.sendMail(message)
		.then((info) => {
			return {
				msg: "Email sent",
				info: info.messageId,
				preview: nodemailer.getTestMessageUrl(info),
			};
		})
		.catch((err) => {
			throw new Error(err)
			// return res.status(500).json({ msg: err });
		});
}
