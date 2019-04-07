const chaincodeapi = require('./shippingChaincodeAPI');
const mapper = require('./shipmentMapper');
const channel = process.env.CHANNEL || 'testshipping';
const chaincode = process.env.CHAINCODE || 'shipment';
const version = process.env.VERSION || '1.1.1';
const CUSTODIAN_WEBSHOP = 'webshop';

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
            console.error(JSON.stringify(responseBody));
            throw new Error(responseBody.info.peerErrors[0].errMsg);
        } else {
            console.error(JSON.stringify(responseBody));
            throw new Error('unknown response');
        }
    } catch (error) {
        console.error(error);
        return next(error);
    }
};
exports.issueShipmentRequest = async function (req, res, next) {
    try {
        requestBody.method = 'issueShipment';
        requestBody.args = mapper.mapRequestBodyToArgs(req.body);
        requestBody.args.push(CUSTODIAN_WEBSHOP);
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        res.send(responseBody);
    } catch (error) {
        console.error(error);
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
exports.pickupShipment = async function (req, res) {
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
        res.send(responseBody);
    } catch (error) {
        console.error(error);
        next(error);
    }
};
exports.receiveShipment = async function (req, res) {
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
        res.send(responseBody);
    } catch (error) {
        console.error(error);
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
        console.error(error);
        next(error);
    }
};

