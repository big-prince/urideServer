import express from "express";
import admin from "firebase-admin";

const app = express();
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

admin.auth()
	.createUser({
		email: email,
		password: password,
	})
	.then((userRecord) => {
		console.log("Successfully created new user:", userRecord.uid);
		res.status(200).json({
			message: "User registration successful",
		});
	})
	.catch((error) => {
		console.log("Error creating new user:", error);
		res.status(500).json({ error: "Failed to register user" });
	});

admin.auth()
	.signInWithEmailAndPassword(email, password)
	.then((userCredential) => {
		console.log(
			"Successfully authenticated user:",
			userCredential.user.uid
		);
		res.status(200).json({ message: "User login successful" });
	})
	.catch((error) => {
		console.log("Error authenticating user:", error);
		res.status(401).json({ error: "Invalid credentials" });
	});


    