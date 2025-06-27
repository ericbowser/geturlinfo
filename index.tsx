import * as express from 'express';
import * as server from './server';
import {createServer} from "node:http";
const config : any = require('dotenv').config();
console.log(config.parsed)

const app : any = express();
app.use(server);
app.use(express.json());


const port = process.env.PORT || 3005;
console.log('passed port to use for http', port);

const httpServer = createServer(app);

httpServer.listen(port, () : void => console.log(`Listening on port ${port}`));

module.exports = httpServer;