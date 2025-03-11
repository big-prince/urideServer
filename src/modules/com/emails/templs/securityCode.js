import Mailgen from "mailgen";

// Initialize Mailgen with default theme
const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "uRide",
    link: "https://uRide.io/",
  },
});

// Generate the rideSecurityCode email template
export const sendSecurityCodeEmailTemplate = (
  receiverName,
  code,
  rideDetails
) => {
  const email = {
    body: {
      name: receiverName,
      intro: `Here is your security code for the ride with ${rideDetails.driver}`,
      action: {
        instructions:
          "To use the security code, please provide it to the driver.",
        button: {
          color: "#22BC66",
          text: `Your Code: ${code}`,
          link: "", // Can be left empty if no link is required
        },
      },
      table: {
        data: [
          {
            item: "Origin",
            description: `${rideDetails.origin.name}`,
          },
          {
            item: "Destination:",
            description: `${rideDetails.destination.name}`,
          },
          {
            item: "Departure Time:",
            description: `${rideDetails.departure_time}`,
          },
          {
            item: "Price",
            description: `${rideDetails.price}`,
          },
          {
            item: "Driver Name:",
            description: `${rideDetails.driver}`,
          },
        ],
        columns: {
          // Optionally, customize the table columns
          customWidth: {
            item: "30%",
            description: "70%",
          },
          customAlignment: {
            description: "left",
          },
        },
      },
      outro: "If you didn't request this, you can safely ignore this email.",
    },
  };

  // Generate an HTML email with the provided contents
  return mailGenerator.generate(email);
};
