const Path = require('path');
const dotenv = require("dotenv");
const config = dotenv.config({path: Path.resolve(__dirname, '.env')});
const server = require('./server');
const http = require("node:http");
const express = require("express");
/*
const {serve, setup} = require("swagger-ui-express");
*/

const httpPort =  process.env.PORT || 3005;
console.log('passed port to use for http', httpPort);

const app = express();

app.use(server);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const httpServer = http.createServer(app);

httpServer.listen(httpPort, () => console.log(`Listening on port ${httpPort}`));