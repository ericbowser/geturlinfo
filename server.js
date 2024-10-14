const express = require('express');
const getUrlInfo = require('./getUrlInfo');
const {json} = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(json());

const port = process.env.PORT || 3005;

app.post('/api/getUrlInfo', async (req, res) => {
    console.log('param: ', req.body.url);
    try {
        const result = await getUrlInfo(req.body.url);
        
        res.status(200).send(result).end();
    } catch (e) {
        console.error(e);
        res.status(500).send({'error': e}).end();
    }
});

app.listen(port, () => {
    console.log('Server is running on port', port);
});

module.exports = app;