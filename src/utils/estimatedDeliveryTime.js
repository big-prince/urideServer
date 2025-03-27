//calculate estimated delivery time function
export const estimatedDeliveryDays = (date) => {
  const today = new Date();
  const deliveryDate = new Date(date);
  const differenceInTime = deliveryDate.getTime() - today.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);
  return Math.floor(differenceInDays);
};
