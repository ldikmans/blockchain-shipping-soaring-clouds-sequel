const chaincodeapi = require('./shippingChaincodeAPI');
const logger = require('./logger');
const mapper = require('./shipmentMapper');
const channel = process.env.CHANNEL || 'testshipping';
const chaincode = process.env.CHAINCODE || 'shipment';
const version = process.env.VERSION || '1.1.1';
const CUSTODIAN_WEBSHOP = 'webshop';
const publisher = require('./producer');
const publish = process.env.PUBLISH || true;

let requestBody = {
    'args': [],
    'channel': channel,
    'chaincode': chaincode,
    'chaincodeVer': version,
    'method': ''
};
exports.getShipments = async function (req, res, next) {
    try {
        requestBody.method = 'readAllShipments';
        requestBody.args = [];
        let responseBody = await chaincodeapi.invokeQuery(requestBody);
        let result = responseBody.returnCode;
        if (result === 'Success') {
            let jsonResponseBody = JSON.parse(responseBody.result.payload);
            let shipments = [];
            if (jsonResponseBody && jsonResponseBody.length > 0) {
                for (i = 0; i < jsonResponseBody.length; i++) {
                    let shipment = mapper.mapShipment(JSON.parse(jsonResponseBody[i].valueJson));
                    shipments.push(shipment);
                }
            }

            res.send(shipments);
        } else if (result === 'Failure') {
            logger.error(JSON.stringify(responseBody));
            throw new Error(responseBody.info.peerErrors[0].errMsg);
        } else {
            logger.error(JSON.stringify(responseBody));
            throw new Error('unknown response');
        }
    } catch (error) {
        logger.error(error);
        return next(error);
    }
};
exports.issueShipmentRequest = async function (req, res, next) {
    try {
        requestBody.method = 'issueShipment';
        requestBody.args = mapper.mapRequestBodyToArgs(req.body);
        requestBody.args.push(CUSTODIAN_WEBSHOP);
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        let result = responseBody.returnCode;
        logger.debug('result is: ' + result);
        if (result === 'Success') {
            logger.debug('publish is: ' + publish);
            if (publish) {
                let eventToPublish = req.body;
                logger.debug("publishing receive event: " + JSON.stringify(eventToPublish));
                publisher.publishShipmentReceived(eventToPublish);
            }
            res.send(responseBody);
        }else if (result === 'Failure'){
            let message = JSON.parse(responseBody.info.peerError[0].errMsg.Error);
            if(message.indexOF("This shipment already exists:") !== -1){
                res.status(200).send("This shipment already exists: " + req.orderId);
            } else{
                logger.error(responseBody);
            res.status(500).send(responseBody);
            }
        } else {
            logger.error(responseBody);
            res.status(500).send(responseBody);
        }
    } catch (error) {
        logger.error(error);
        next(error);
    }
};
exports.getDetails = async function (req, res, next) {
    try {
        let orderId = req.params._orderId;
        if (!orderId) {
            throw new Error('unable to read _orderId');
        }
        requestBody.method = 'readShipment';
        requestBody.args = [orderId];
        let responseBody = await chaincodeapi.invokeQuery(requestBody);
        let result = responseBody.returnCode;
        if (result === 'Success') {
            let shipment = mapper.mapShipment(JSON.parse(responseBody.result.payload));
            res.send(shipment);
        } else if (result === 'Failure') {
            logger.error(responseBody.info.peerErrors[0].errMsg);
            throw new Error('unable to find shipment with orderId ' + orderId);
        } else {
            logger.error(JSON.stringify(responseBody));
            throw new Error('unknown response');
        }
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

exports.getHistory = async function (req, res, next) {
    try {
        let orderId = req.params._orderId;
        if (!orderId) {
            throw new Error('unable to read _orderId');
        }
        requestBody.method = 'getHistoryForRecord';
        requestBody.args = [orderId];
        let responseBody = await chaincodeapi.invokeQuery(requestBody);
        let result = responseBody.returnCode;
        if (result === 'Success') {
            let jsonResponseBody = JSON.parse(responseBody.result.payload);
            logger.debug('jsonResponseBody:' + jsonResponseBody);
            let shipmentsHistory = [];
            if (jsonResponseBody && jsonResponseBody.length > 0) {
                for (i = 0; i < jsonResponseBody.length; i++) {
                    let shipmentHistory = mapper.mapShipmentHistory(jsonResponseBody[i]);
                    shipmentsHistory.push(shipmentHistory);
                }
            }
            res.send(shipmentsHistory);
        } else if (result === 'Failure') {
            logger.error(JSON.parse(responseBody.info.peerErrors[0].errMsg));
            throw new Error('unable to find shipment with orderId ' + orderId);
        } else {
            logger.error(JSON.stringify(responseBody));
            throw new Error('unknown response');
        }
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

exports.pickupShipment = async function (req, res, next) {
    try {
        let orderId = req.params._orderId;
        if (!orderId) {
            throw new Error('unable to read _orderId');
        }
        if (!req.body.shipper) {
            throw new Error('shipper is mandatory');
        }
        requestBody.method = 'pickupShipment';
        requestBody.args = [orderId, req.body.shipper];
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        let result = responseBody.returnCode;
        if (result === 'Success') {
            logger.debug('publish is ' + publish);
            if (publish) {
                let eventToPublish = req.body;
                eventToPublish.orderId = orderId;
                eventToPublish.date = new Date();
                logger.debug("publishing pickup event: " + JSON.stringify(eventToPublish));
                publisher.publishShipmentPickedUp(eventToPublish);
            }
            res.send(responseBody);
        } else {
            logger.error(responseBody);
            res.status(500).send(responseBody);
        }

    } catch (error) {
        logger.error(error);
        next(error);
    }
};
exports.receiveShipment = async function (req, res, next) {
    try {
        let orderId = req.params._orderId;
        if (!orderId) {
            throw new Error('unable to read _orderId');
        }
        if (!req.body.shipper) {
            throw new Error('shipper is mandatory');
        }
        requestBody.method = 'receiveShipment';
        requestBody.args = [orderId, req.body.shipper];
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        let result = responseBody.returnCode;
        logger.debug('result is: ' + result);
        if (result === 'Success') {
            logger.debug('publish is: ' + publish);
            if (publish) {
                let eventToPublish = req.body;
                eventToPublish.orderId = orderId;
                eventToPublish.date = new Date();
                logger.debug("publishing receive event: " + JSON.stringify(eventToPublish));
                publisher.publishShipmentReceived(eventToPublish);
            }
            res.send(responseBody);

        } else {
            logger.error(responseBody);
            res.status(500).send(responseBody);
        }
    } catch (error) {
        logger.error(error);
        next(error);
    }
};
exports.deleteShipment = async function (req, res) {
    try {
        let orderId = req.params._orderId;
        if (!orderId) {
            throw new Error('unable to read _orderId');
        }
        requestBody.method = 'deleteShipment';
        requestBody.args = [orderId];
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

