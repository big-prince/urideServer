const express = require("express");
const app = express();

app.get('/api/hello-user', (req, res) => {
    const user = req.query.user;
    res.json('Howdy ' + user + ', First Milestone!');
  });

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
