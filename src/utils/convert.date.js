import moment from "moment";
function formatDepartureTime(req, res, next) {
  const { departure_time } = req.body;

  // Parse the date and time and convert it to ISO 8601
  const formattedTime = moment(
    departure_time,
    "MM/DD/YYYY hh:mmA"
  ).toISOString();
  req.body.departure_time = formattedTime;

  next();
}

export default formatDepartureTime; // Export the function for use in routes or controllers
