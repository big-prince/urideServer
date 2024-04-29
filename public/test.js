document
	.getElementById("phoneNumberForm")
	.addEventListener("submit", function (event) {
		console.log("sksndjsdnskjdnsjkdsfjhsdfhsfsdjh");
		event.preventDefault(); // Prevent default form submission

		// Get phone number from input field
		var phoneNumber = document.getElementById("phoneNumber").value;
		console.log(phoneNumber);

		// Send phone number to Node.js Express route
		fetch("/submitPhoneNumber", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ phoneNumber: phoneNumber }),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				// Handle success response
				console.log(
					"Phone number submitted successfully:",
					data
				);
				// Optionally, you can redirect the user to a thank you page or display a success message
			})
			.catch((error) => {
				// Handle error
				console.error("Error submitting phone number:", error);
				// Optionally, you can display an error message to the user
			});
	});
