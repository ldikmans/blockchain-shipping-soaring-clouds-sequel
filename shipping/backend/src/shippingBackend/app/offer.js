const chaincodeapi = require('./shippingChaincodeAPI');
const mapper = require('./shipmentMapper');
const channel = process.env.CHANNEL || 'testshipping';
const chaincode = process.env.CHAINCODE || 'shipment';
const version = process.env.VERSION || '1.0.9';

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
        if (req.orderId) {
            requestBody.method = 'readAllOffersByOrder';
            requestBody.args.push(orderId);
        } else {
            requestBody.method = 'readAllOffers';
        }
        let responseBody = await chaincodeapi.invokeQuery(requestBody);
        let result = responseBody.returnCode;
        if (result === 'Success') {
            let jsonResponseBody = JSON.parse(responseBody.result.payload);
            let offers = [];
            if (jsonResponseBody && jsonResponseBody.length > 0) {
                for (i = 0; i < jsonResponseBody.length; i++) {
                    let shipment = mapper.mapOffer(JSON.parse(jsonResponseBody[i].valueJson));
                    offers.push(shipment);
                }
            }

            res.send(offers);
        } else if (result === 'Failure') {
            console.error(JSON.stringify(responseBody));
            throw new Error(JSON.parse(responseBody.info.peerErrors[0].errMsg));
        } else {
            console.error(JSON.stringify(responseBody));
            throw new Error('unknown response');
        }
    } catch (error) {
        console.error(error);
        return next(error);
    }
};

exports.getOfferDetails = async function (req, res, next) {
    try {
        let offerId = req.params._offerId;
        if (!orderId) {
            throw new Error('unable to read _offerId');
        }
        requestBody.method = 'readOffer';
        requestBody.args = [offerId];
        let responseBody = await chaincodeapi.invokeQuery(requestBody);
        let result = responseBody.returnCode;
        if (result === 'Success') {
            let offer = mapper.mapOffer(JSON.parse(responseBody.result.payload));
            res.send(offer);
        } else if (result === 'Failure') {
            console.error(responseBody.info.peerErrors[0].errMsg);
            throw new Error('unable to find shipment with orderId ' + orderId);
        } else {
            console.error(JSON.stringify(responseBody));
            throw new Error('unknown response');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.offerDelivery = async function (req, res, next) {
    try {
        requestBody.method = 'offerDelivery';
        if (!req.params._offerId) {
            throw new Error('unable to read _offerId');
        }
        ;
        requestBody.args.push(req.params._offerId);
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
        if (req.body.price) {
            throw new Error('price is mandatory');
        }
        ;
        requestBody.args.push(req.body.price);
        if (!req.body.deliveryDate) {
            throw new Error('deliveryDate is mandatory');
        }
        requestBody.args.push(req.body.deliveryDate);
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        res.send(responseBody);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.deleteOffer = async function (req, res, next) {

    try {
        requestBody.method = 'deleteOffer';
        if (!req.params._offerId) {
            throw new Error('unable to read _offerId');
        }
        ;
        requestBody.args.push(req.params._offerId);
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
        console.error(error);
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
        requestBody.args.push(req.params._offerId);
        if (!req.body.orderId) {
            throw new Error('orderId is mandatory');
        }
        ;
        requestBody.args.push(req.body.orderId);
        if (!req.body.shipper) {
            throw new Error('shipper is mandatory');
        }
        ;
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        res.send(responseBody);
    } catch (error) {
        console.error(error);
        next(error);
    }
};



