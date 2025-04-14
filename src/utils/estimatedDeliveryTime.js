//calculate estimated delivery time function
export const estimatedDeliveryDays = (date) => {
  const today = new Date();
  const deliveryDate = new Date(date);
  const differenceInTime = deliveryDate.getTime() - today.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);
  return Math.floor(differenceInDays);
};

//get estimated delivery time and date by cost
export function getEstimatedDelivery(sendDate, costType) {
  console.log("DELIVERY DATE", sendDate, costType);
  if (costType !== "express" && costType !== "standard") {
    return "Invalid Cost Type";
  }
  const standardDeliveryDays = 13;
  const expressDeliveryDays = 6;

  const deliveryDays =
    costType === "express" ? expressDeliveryDays : standardDeliveryDays;

  // Parse the send date
  const sendDateTime = new Date(sendDate);

  // Calculate the delivery date by adding the delivery days
  const deliveryDateTime = new Date(sendDateTime);
  deliveryDateTime.setDate(sendDateTime.getDate() + deliveryDays);

  // Format the delivery date in US English
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  };

  const formattedDeliveryDate = deliveryDateTime.toLocaleDateString(
    "en-US",
    options
  );
  const formattedSendDate = sendDateTime.toLocaleDateString("en-US", options);

  const response = {
    sendDate: formattedSendDate,
    deliveryDays: deliveryDays,
    estimatedDeliveryDate: deliveryDateTime,
    formattedDeliveryDate: formattedDeliveryDate,
    costType: costType,
  };

  return response;
}
export function getEstimatedDeliveryStandard(sendDate, costType) {
  console.log("DELIVERY DATE", sendDate, costType);
  if (costType !== "express" && costType !== "standard") {
    return "Invalid Cost Type";
  }
  const standardDeliveryDays = 13;

  const deliveryDays = standardDeliveryDays;

  // Parse the send date
  const sendDateTime = new Date(sendDate);

  // Calculate the delivery date by adding the delivery days
  const deliveryDateTime = new Date(sendDateTime);
  deliveryDateTime.setDate(sendDateTime.getDate() + deliveryDays);

  // Format the delivery date in US English
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  };

  const formattedDeliveryDate = deliveryDateTime.toLocaleDateString(
    "en-US",
    options
  );
  const formattedSendDate = sendDateTime.toLocaleDateString("en-US", options);

  const response = {
    sendDate: formattedSendDate,
    deliveryDays: deliveryDays,
    estimatedDeliveryDate: deliveryDateTime,
    formattedDeliveryDate: formattedDeliveryDate,
    costType: costType,
  };

  return response;
}

// getEstimatedDelivery("2025-10-15", "express");
