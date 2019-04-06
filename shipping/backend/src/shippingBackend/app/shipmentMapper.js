/**
 * 
 * @param {type} valueJson the result from the blockchain API, docType is shipment
 * @returns {nm$_shipment.mapShipment.shipment} the shipment object as defined by the API
 */
function mapShipment(valueJson) {

    let offers = valueJson.offers;
    let cleanedOffers = [];
    offers.forEach(function (offer) {
        delete(offer.docType);
        cleanedOffers.push(offer);
    });

    let selectedOffer = valueJson.selectedOffer;
    if (selectedOffer) {
        delete(selectedOffer.docType);
    }
    let shipment = {
        'orderId': valueJson.orderId,
        'product': valueJson.product,
        'customer': valueJson.customer,
        'shippingAddress': valueJson.address,
        'orderDate': mapIntToDate(valueJson.orderDate),
        'shipper': valueJson.shipper,
        'price': valueJson.price,
        'deliveryDate': mapIntToDate(valueJson.deliveryDate),
        'offers': cleanedOffers,
        'selectedOffer': selectedOffer,
        'custodian': valueJson.custodian,
        'currentState': valueJson.currentState
    };
    return shipment;
}
;

function mapOrder(valueJson) {
    let offer = {
        'offerId': valueJson.offerId,
        'shipper': valueJson.shipper,
        'price': valueJson.price,
        'deliveryDate': mapIntToDate(valueJson.deliveryDate)
    };
    return offer;
}
;

function mapRequestBodyToArgs(body) {
    let args = [];
    if (!body.orderId) {
        throw new Error('orderId is mandatory');
    }
    args.push(body.orderId);
    if (!body.product) {
        throw new Error('product is mandatory');
    }
    args.push(body.product);
    if (!body.customer) {
        throw new Error('customer is mandatory');
    }
    args.push(body.customer);
    if (!body.shippingAddress) {
        throw new Error('shippingAddress is mandatory');
    } else {
        if (!body.shippingAddress.streetName) {
            throw new Error('streetName is mandatory');
        }
        ;
        if (!body.shippingAddress.streetNumber) {
            throw new Error('streetNumber is mandatory');
        }
        ;
        if (!body.shippingAddress.city) {
            throw new Error('city is mandatory');
        }
        ;
        if (!body.shippingAddress.postcode) {
            throw new Error('postcode is mandatory');
        }
        ;
        if (!body.shippingAddress.country) {
            throw new Error('country is mandatory');
        }
        ;
        if (!body.shippingAddress.country.length === 3) {
            throw new Error('country should be ISO ISO 3166-1 alpha-2 format');
        }
        args.push(body.shippingAddress.streetName);
        args.push(body.shippingAddress.streetNumber);
        args.push(body.shippingAddress.city);
        args.push(body.shippingAddress.postcode);
        args.push(body.shippingAddress.country);
    }
    ;
    if (!body.orderDate) {
        throw new Error('orderDate is mandatory');
    }
    args.push(mapDateToInt(body.orderDate));
    return args;
}
;

/**
 * 
 * @param {type} dateString ISO date
 * @returns {Number|String} first digit is month (or 2 digits in case of december), 0-11, second part is day (1-31)
 */
function mapDateToInt(dateString) {
    let date = new Date(dateString);
    let month = date.getDate();
    let day = pad(date.getDay(), 2);
    let date4digits = day + month;
    return date4digits;
}
;

/**
 * 
 * @param {type} dateInt date in 4 digits, mmdd
 * @returns {date}
 */
function mapIntToDate(dateInt) {
    if (dateInt) {
        let date = new Date();
        let month;
        let day;
        let dateString = new String(dateInt);
        if (dateString.length === 3) {
            month = dateString.substr(0, 1);
            day = dateString.substr(1, 2);
        } else {
            month = dateString.substr(0, 2);
            day = dateString.substr(2, 2);
        }
        date.setMonth(month);
        date.setDate(day);
        return date;
    } else{
        return null;
    }
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
;




