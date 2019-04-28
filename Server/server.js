const express = require('express');
const https = require('https');
const app = express();
var cors = require('cors')

var api_route = require('./routes/api/api');

app.use(cors());
app.use(express.json());

app.use("/api",api_route );

https.createServer(app).listen( 8080, () => {
  console.log(`Server on port 8080`)
});

