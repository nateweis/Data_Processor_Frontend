const express = require("express")
const app = express(); 

const port = process.env.PORT || 3005;

// middleware
app.use(express.json());
app.use(express.static('public'));


// port listener 
app.listen(port, () => {
    console.log(`The Data Processing App is running on: ${port}`);
  });