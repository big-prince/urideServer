//get distance in km
export const getDistance = async (sender, receiver) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${sender}&destinations=${receiver}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  const distance = data.rows[0].elements[0].distance.value / 1000;
  return distance;
};
