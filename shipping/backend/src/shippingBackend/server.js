
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const shipment = require('./app/shipment');
const offer = require('./app/offer');
const logger = require('./app/logger');

const port = process.env.PORT || 8080;
const VERSION = '1.0.0';

const app = express();
var upTime;


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var router = express.Router();

app.use(cors());
app.options('*', cors()); // include before other routes

/**
 * test route to make sure everything is working (accessed at GET http://{host}:{port}/shippermarketplace)
 * @argument {type} req
 * @argument {type} res welcome message to show it is working  
 */
router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});

/**
 * get the health of the server
 * @argument {type} req empty object
 * @argument {type} res the version, status and uptime
 */
router.get('/health', function (req, res) {
    res.json({
        "version": VERSION,
        "status": "OK",
        "uptime": upTime
    });
});

app.route('/shippermarketplace/shipments/:_id')

        .get(function (req, res) {
            logger.debug("getting shipment details");
            shipment.getDetails(req, res);
        })
        .post(function (req, res) {
            logger.debug("select a shipment");
            shipment.selectShipment(req, res);
        })
        .put(function (req, res) {
            logger.debug("pickup or receive a shipment");
            let event = req.body.event;
            if (event === 'PICKUP') {
                shipment.pickupShipment(req, res);
            } else {
                shipment.receiveShipment(req, res);
            }
        })
        .delete(function (req, res) {
            logger.debug("deleting shipment");
            shipment.deleteShipment(req, res);
        });

app.route('/shippermarketplace/shipments')

        .get(function (req, res, next) {
            logger.debug("fetching shipments");
            try {
                shipment.getShipments(req, res, next);
            } catch (error) {
                next(error);
            }
        })
        .post(function (req, res, next) {
            logger.debug("issueShipment");
            try{
                shipment.issueShipmentRequest(req, res, next);
            }catch(error){
                next(error);
            }
        });


app.route('/shippermarketplace/offers')
        .get(function (req, res) {
            logger.debug("fetching offers");
            offer.getOffers(req, res);
        })
        .post(function (req, res) {
            logger.debug("offering a delivery for shipment");
            offer.offerDelivery(req, res);

        });

// all of our routes will be prefixed with /shipment
app.use('/shippermarketplace', router);

app.use(function (err, req, res, next) {
    logger.debug('request: ' + req.baseUrl);
    console.error(err.message); // 
    if (!err.statusCode)
        err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});

// START THE SERVER
// =============================================================================
app.listen(port);
logger.info('Magic happens on port ' + port);
upTime = new Date();



