const express = require('express');
const router = express.Router();
const getUrlInfo = require('./getUrlInfo');
const cors = require('cors');

const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({extended: true}));

const port = process.env.PORT || 3005;

router.post('/api/getUrlInfo', async (req, res) => {
    console.log('param: ', req.body.url);
    console.log('url', req.body.url);
    if (!req.body.url) {
        return res.status(400).send({...req.body});
    } 
    try {
        const result = await getUrlInfo(req.body.url);
        const data = {
            links: result.links,
            content: result.globalContent
        }
        res.status(200).send({...data}).end();
    } catch (e) {
        console.error(e);
        res.status(500).send({'error': e}).end();
    }
});

module.exports = router;