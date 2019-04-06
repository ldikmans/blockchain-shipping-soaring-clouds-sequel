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

exports.getShipments = async function (req, res, next) {
    try {
        requestBody.method = 'readAllShipments';
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        let jsonResponseBody = JSON.parse(responseBody.result.payload);
        let shipments = [];
        if(jsonResponseBody && jsonResponseBody.length > 0){
            for (i=0; i < jsonResponseBody.length; i++){
                let shipment = mapper.mapShipment(JSON.parse(jsonResponseBody[i].valueJson));
                shipments.push(shipment);
            }
        }
        
        res.send(shipments);
    } catch (error) {
        console.error(error);
        return next(error);
    }
};

exports.issueShipmentRequest = async function (req, res, next) {
    try{
        requestBody.method = 'issueShipment';
        requestBody.args = mapper.mapRequestBodyToArgs(req.body);
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        res.send(responseBody);
    }
    catch(error){
        console.error(error);
        next(error);
    }
};

exports.getDetails = async function (req, res, next) {
     try{
        let orderId = req.params._orderId;
        if(!orderId){
            throw new Error('unable to read _orderId');
        }
        requestBody.method = 'readShipment';
        requestBody.args.push(orderId);
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        res.send(responseBody);
    }
    catch(error){
        console.error(error);
        next(error);
    }
};

exports.pickupShipment = async function (req, res) {
    try{
        let orderId = req.params._orderId;
        if(!orderId){
            throw new Error('unable to read _orderId');
        }
        if(!req.body.shipper){
            throw new Error('shipper is mandatory');
        }
        requestBody.method = 'pickupShipment';
        requestBody.args.push(orderId);
        requestBody.args.push(req.body.shipper);
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        res.send(responseBody);
    }
    catch(error){
        console.error(error);
        next(error);
    }
};

exports.receiveShipment = async function (req, res) {
     try{
        let orderId = req.params._orderId;
        if(!orderId){
            throw new Error('unable to read _orderId');
        }
        if(!req.body.shipper){
            throw new Error('shipper is mandatory');
        }
        requestBody.method = 'receiveShipment';
        requestBody.args.push(orderId);
        requestBody.args.push(req.body.shipper);
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        res.send(responseBody);
    }
    catch(error){
        console.error(error);
        next(error);
    }
};

exports.deleteShipment = async function (req, res) {
     try{
        let orderId = req.params._orderId;
        if(!orderId){
            throw new Error('unable to read _orderId');
        }
        requestBody.method = 'deleteShipment';
        requestBody.args.push(orderId);
        requestBody.args.push(req.body.shipper);
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        if(responseBody.returnCode === 'Success'){
            res.status(204).send();
        }
        else{
            res.status(500).send(responseBody);
        }
    }
    catch(error){
        console.error(error);
        next(error);
    }
};

