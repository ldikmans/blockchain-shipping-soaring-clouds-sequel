const chaincodeapi = require('./shippingChaincodeAPI');
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
                let shipment = mapShipment(JSON.parse(jsonResponseBody[i].valueJson));
                shipments.push(shipment);
            }
        }
        
        res.send(shipments);
    } catch (error) {
        console.error(error);
        return next(error);
    }
};

function mapShipment(valueJson){
   
    let offers = valueJson.offers;
    let cleanedOffers =[];
    offers.forEach(function(offer){
        delete(offer.docType);
        cleanedOffers.push(offer);
    });
    
    let selectedOffer = valueJson.selectedOffer;
    if(selectedOffer){
        delete(selectedOffer.docType);
    }
    let shipment = {
        'orderId': valueJson.orderId,
        'product': valueJson.product,
        'customer': valueJson.customer,
        'shippingAddress': valueJson.address,
        'orderDate': valueJson.orderDate,
        'shipper': valueJson.shipper,
        'price': valueJson.price,
        'deliveryDate': valueJson.deliveryDate,
        'offers': cleanedOffers,
        'selectedOffer': selectedOffer,
        'custodian': valueJson.custodian,
        'currentState': valueJson.currentState
    };
    return shipment;
}

exports.issueShipmentRequest = async function (req, res, next) {
    try{
        requestBody.method = 'issueShipment';
        requestBody.args = '';
        let responseBody = await chaincodeapi.invokeMethod(requestBody);
        res.send(responseBody);
    }
    catch(error){
        next(error);
    }
};

exports.getDetails = function (req, res) {
    console.log("not implemented yet");
    res.send("not implemented yet");
};

exports.selectShipment = function (req, res) {
    console.log("not implemented yet");
    res.send("not implemented yet");
};

exports.pickupShipment = function (req, res) {
    console.log("not implemented yet");
    res.send("not implemented yet");
};

exports.receiveShipment = function (req, res) {
    console.log("not implemented yet");
    res.send("not implemented yet");
};

exports.deleteShipment = function (req, res) {
    console.log("not implemented yet");
    res.send("not implemented yet");
};


