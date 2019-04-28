const https = require('https');
const fs = require('fs');
const cors = require('cors')
const express = require('express');
const app = express();

var api_route = require('./routes/api/api');

const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/api",api_route );

const options = {
    key: fs.readFileSync('ssl/key.pem', 'utf-8'),
    cert: fs.readFileSync('ssl/cert.pem', 'utf-8')
};

https.createServer( options, app).listen(8080, ()=>{
    console.log(`Server on port ${port}`)
});