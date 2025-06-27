import {getUrlInfo} from './getUrlInfo';
import * as express from 'express';
import * as bodyParser from 'body-parser';

const router = express.Router();
router.use(express.urlencoded({extended: true}));
router.use(bodyParser.json());



router.post('/api/getUrlInfo', async (req : any, res : any ) : Promise<void> => {
    console.log('param: ', req.body.url);
    console.log('url', req.body.url);
    try {
        const result : { links: any; titles: any; paragraphs: any; listItems: any; } = await getUrlInfo(req.body.url);
        const data = {
            links: result.links,
            titles: result.titles,
            paragraphs: result.paragraphs,
            listItems: result.listItems
        }
        res.status(200).send({
            ...data,
            error: undefined
        }).end();
    } catch (e) {
        console.error(e);
        res.status(500).send({'error': e}).end();
    }
});

module.exports = router;