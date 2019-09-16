const chaincodeapi = require('./shippingChaincodeAPI');
const logger = require('./logger');
const aguid = require('aguid');
const mapper = require('./shipmentMapper');
const publisher = require('./producer');
const channel = process.env.CHANNEL || 'testshipping';
const chaincode = process.env.CHAINCODE || 'shipment';
const version = process.env.VERSION || '1.1.1';
const publish = process.env.PUBLISH || true;


let requestBody = {
    'args': [],
    'channel': channel,
    'chaincode': chaincode,
    'chaincodeVer': version,
    'method': ''
};

exports.getOffers = async function (req, res, next) {
    try {
        let orderId = req.query.orderId;
        if (orderId) {
            //todo replace by correct query once the offers are stored separately in the chaincode, not as part of the shipment
            requestBody.method = 'readShipment';
            requestBody.args = [orderId];
        } else {
            //todo replace by correct query once the offers are stored separately in the chaincode, not as part of the shipment
            requestBody.method = 'readAllShipments';
            requestBody.args = [];
        }
        let responseBody = await chaincodeapi.invokeQuery(requestBody);
        let result = responseBody.returnCode;
        if (result === 'Success') {
            let jsonResponseBody = JSON.parse(responseBody.result.payload);
            let offers = [];
            if (orderId) {
                let shipment = mapper.mapShipment(JSON.parse(responseBody.result.payload));
                if (shipment.offers.length > 0) {
                    offers.push(...shipment.offers);
                }

            }
            if (jsonResponseBody && jsonResponseBody.length > 0) {
                for (i = 0; i < jsonResponseBody.length; i++) {
                    let shipmentFromArray = mapper.mapShipment(JSON.parse(jsonResponseBody[i].valueJson));
                    if (shipmentFromArray.offers.length > 0) {
                        offers.push(...shipmentFromArray.offers);
                    }
                }
            }


            res.send(offers);
        } else if (result === 'Failure') {
            logger.error(JSON.stringify(responseBody));
            throw new Error(JSON.parse(responseBody.info.peerErrors[0].errMsg));
        } else {
            logger.error(JSON.stringify(responseBody));
            throw new Error('unknown response');
        }
    } catch (error) {
        logger.error(error);
        return next(error);
    }
};

exports.getOfferDetails = async function (req, res, next) {
    try {
        let offerId = req.params._offerId;
        if (!offerId) {
            throw new Error('unable to read _offerId');
        }
        //todo fix query for offers
        requestBody.method = 'readAllShipments';
        requestBody.args = [];
        let responseBody = await chaincodeapi.invokeQuery(requestBody);
        let result = responseBody.returnCode;
        if (result === 'Success') {
            let jsonResponseBody = JSON.parse(responseBody.result.payload);
            let offers = [];
             if (jsonResponseBody && jsonResponseBody.length > 0) {
                for (i = 0; i < jsonResponseBody.length; i++) {
                    let shipmentFromArray = mapper.mapShipment(JSON.parse(jsonResponseBody[i].valueJson));
                    if (shipmentFromArray.offers.length > 0) {
                        offers.push(...shipmentFromArray.offers);
                    }
                }
            }
            let offer = offers.find(offer => offer.offerId === offerId);
            res.send(offer);
        } else if (result === 'Failure') {
            logger.error(responseBody.info.peerErrors[0].errMsg);
            throw new Error('unable to find offer with orderId ' + offerId);
        } else {
            logger.error(JSON.stringify(responseBody));
            throw new Error('unknown response');
        }
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

exports.offerDelivery = async function (req, res, next) {
    try {
        requestBody.method = 'offerDelivery';
       
        let offerId = aguid();
        requestBody.args = [offerId];
        if (!req.body.orderId) {
            throw new Error('orderId is mandatory');
        }
        ;
        requestBody.args.push(req.body.orderId);
        if (!req.body.shipper) {
            throw new Error('shipper is mandatory');
        }
        ;
        requestBody.args.push(req.body.shipper);
        if (!req.body.price) {
            throw new Error('price is mandatory');
        }
        ;
        requestBody.args.push(req.body.price);
        if (!req.body.deliveryDate) {
            throw new Error('deliveryDate is mandatory');
        }
        
        requestBody.args.push(mapper.mapDateStringToInt(req.body.deliveryDate));
        if( req.body.trackingInfo){
            requestBody.args.push(req.body.trackingInfo);
        }
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        let result = responseBody.returnCode;
        if (result === 'Success') {
            let offer = req.body;
            let price = pareFloat(req.body.price);
            offer.offerId = offerId;
            offer.price = price;
            if(publish){
                logger.debug("publishing offer: " + JSON.stringify(offer));
                publisher.publishShipmentOffered(offer);
            }
            res.send(offer);
        }else if (result === 'Failure') {
            logger.error(responseBody.info.peerErrors[0].errMsg);
            throw new Error('unable to find offer with orderId ' + offerId);
        } else {
            logger.error(JSON.stringify(responseBody));
            throw new Error('unknown response');
        }
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

//todo fix this once offers is stored as its own state.
exports.deleteOffer = async function (req, res, next) {

    try {
        requestBody.method = 'deleteOffer';
        if (!req.params._offerId) {
            throw new Error('unable to read _offerId');
        }
        ;
        requestBody.args = [req.params._offerId];
        if (!req.body.orderId) {
            throw new Error('orderId is mandatory');
        }
        ;
        requestBody.args.push(req.body.orderId);
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        if (responseBody.returnCode === 'Success') {
            res.status(204).send();
        } else {
            res.status(500).send(responseBody);
        }
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

exports.selectOffer = async function (req, res, next) {
    try {
        requestBody.method = 'selectShipmentOffer';
        if (!req.params._offerId) {
            throw new Error('unable to read _offerId');
        }
        ;
        requestBody.args = [req.params._offerId];
        if (!req.body.orderId) {
            throw new Error('orderId is mandatory');
        }
        ;
        requestBody.args.push(req.body.orderId);
        
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        if (responseBody.returnCode === 'Success') {
            res.status(200).send(responseBody);
        } else {
            res.status(500).send(responseBody);
        }
    } catch (error) {
        logger.error(error);
        next(error);
    }
};



