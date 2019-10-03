const KafkaAvro = require('kafka-avro');

var kafkaAvro;

var kafkaBrokerVar = process.env.KAFKA_BROKER || 'localhost:9092';
var kafkaRegistryVar = process.env.KAFKA_REGISTRY || 'http://130.61.35.61:8081';

//topics as they are defined on Kafka
const SHIPMENT_OFFERED_TOPIC = process.env.KAFKA_SHIPMENT_OFFER_TOPIC || 'soaring-shipmentoffer';
const SHIPMENT_PICKEDUP_TOPIC = process.env.KAFKA_SHIPMENT_PICKEDUP_TOPIC || 'soaring-shipmentpickedup';
const SHIPMENT_RECEIVED_TOPIC = process.env.KAFKA_SHIPMENT_RECEIVED_TOPIC || 'soaring-shipmentreceived';
const SHIPMENT_REQUEST_ISSUED_TOPIC = process.env.KAFKA_SHIPMENT_REQUEST_ISSUED_TOPIC || 'soaring-shipmentrequestissued';


exports.initKafkaAvro = function () {
    kafkaAvro = new KafkaAvro(
            {
                kafkaBroker: kafkaBrokerVar,
                schemaRegistry: kafkaRegistryVar,
                parseOptions: {wrapUnions: true}
            }
    );
    console.log("kafkaBroker: " + kafkaBrokerVar);
    console.log("kafkaRegistryVar: " + kafkaRegistryVar);
    kafkaAvro.init()
            .then(function () {
                console.info('Kafka Avro Ready to use');

            });
};

exports.publishShipmentOffered = function (offer) {
    console.log('publising offer ' + JSON.stringify(offer));
    kafkaAvro.getProducer({
    }).then(function (producer) {
        var topicName = SHIPMENT_OFFERED_TOPIC;

        producer.on('disconnected', function (arg) {
            console.info('producer disconnected. ' + JSON.stringify(arg));
        });

        producer.on('event.error', function (err) {
            console.error('Error from producer');
            console.error(err);
        });

        producer.on('delivery-report', function (err, report) {
            console.info('in delivery report');
            if (err) {
                console.error('error occurred: ' + err);
            } else {
                console.info('delivery-report: ' + JSON.stringify(report));
            }
        });


        var topic = producer.Topic(topicName, {
            'request.required.acks': 1
        });

        var key = offer.orderId;
        //var key = 'test_key_from_real_code';
        console.log('key: ' + key);
        var partition = -1;
        newOffer = mapOfferToAvroOffer(offer);
        console.log('newOffer: ' + JSON.stringify(newOffer));
        producer.produce(topic, partition, newOffer, key);



    }).catch(function (exception) {
        console.error("exception: " + exception);
    });

};

exports.publishShipmentRequestReceived = function (shipmentRequest) {
    console.log('publishing shipment request received' + JSON.stringify(shipmentRequest));
    kafkaAvro.getProducer({
    })

            .then(function (producer) {

                producer.on('disconnected', function (arg) {
                    console.info('producer disconnected. ' + JSON.stringify(arg));
                });

                producer.on('event.error', function (err) {
                    console.error('Error from producer');
                    console.error(err);
                });

                producer.on('delivery-report', function (err, report) {
                    if (err) {
                        console.log('on error delivery report');
                        console.error('error: ' + err);
                    } else {
                        console.info('delivery-report: ' + JSON.stringify(report));
                    }
                });


                var topic = producer.Topic(SHIPMENT_REQUEST_ISSUED_TOPIC, {
                    'request.required.acks': 1
                });


                var key = shipmentRequest.orderId;
                //var key = 'test_key_from_real_code';
                console.log('key: ' + key);
                if (!key) {
                    key = shipmentRequest.product + '_';
                    ;
                }
                var partition = -1;
                newShipmentRequest = mapShipmentRequestToAvroShipmentRequest(shipmentRequest);
                try {
                    producer.produce(topic, partition, newShipmentRequest, key);
                } catch (error) {
                    console.log('logging error after producing');
                    console.error(error);
                }
            }).catch(function (exception) {
        console.error("exception: " + exception);
    });

};

exports.publishShipmentPickedUp = function (shipment) {
    console.log('publishing shipment picked up: ' + JSON.stringify(shipment));
    kafkaAvro.getProducer({
    })

            .then(function (producer) {
                producer.on('disconnected', function (arg) {
                    console.info('producer disconnected. ' + JSON.stringify(arg));
                });

                producer.on('event.error', function (err) {
                    console.error('Error from producer');
                    console.error(err);
                });

                producer.on('delivery-report', function (err, report) {
                    if (err) {
                        console.error('error: ' + err);
                    } else {
                        console.info('delivery-report: ' + JSON.stringify(report));
                    }
                });


                var topic = producer.Topic(SHIPMENT_PICKEDUP_TOPIC, {
                    'request.required.acks': 1
                });


                var key = shipment.orderId;
                //var key = 'test_key_from_real_code';
                console.log('key: ' + key);
                if (!key) {
                    key = shipment.product + '_' + shipment.customer;
                }
                var partition = -1;
                newShipment = mapShipmentToAvroShipment(shipment);
                console.log('newShipment: ' + JSON.stringify(newShipment));
                producer.produce(topic, partition, newShipment, key);
            }).catch(function (exception) {
        console.error("exception: " + exception);
    });
    ;

};


exports.publishShipmentReceived = function (shipment) {
    console.log('publishing shipment received: ' + JSON.stringify(shipment));
    kafkaAvro.getProducer({
    })

            .then(function (producer) {

                producer.on('disconnected', function (arg) {
                    console.info('producer disconnected. ' + JSON.stringify(arg));
                });

                producer.on('event.error', function (err) {
                    console.error('Error from producer');
                    console.error(err);
                });

                producer.on('delivery-report', function (err, report) {
                    if (err) {
                        console.error('error: ' + err);
                    } else {
                        console.info('delivery-report: ' + JSON.stringify(report));
                    }
                });


                var topic = producer.Topic(SHIPMENT_RECEIVED_TOPIC, {
                    'request.required.acks': 1
                });


                var key = shipment.orderId;
                //var key = 'test_key_from_real_code';
                console.log('key: ' + key);
                if (!key) {
                    key = shipment.product + '_' + shipment.customer;
                }
                var partition = -1;
                newShipment = mapShipmentToAvroShipment(shipment);
                console.log('newShipment: ' + JSON.stringify(newShipment));
                producer.produce(topic, partition, newShipment, key);
            }).catch(function (exception) {
        console.error("exception: " + exception);
    });

};

function mapOfferToAvroOffer(body) {

    let trackingInfo = body.trackingInfo || false;

    var offer = {};

    offer.id = body.offerId;
    offer.shipper = body.shipper;
    offer.deliveryDate = Math.round((new Date(body.deliveryDate)).getTime() / 1000);
    offer.price = body.price;
    offer.orderId = body.orderId;
    offer.trackingInfo = {"boolean": trackingInfo};

    return offer;
}
;

function mapShipmentRequestToAvroShipmentRequest(body) {
    var shipmentRequest = {};

    shipmentRequest.date = Math.round((new Date(body.orderDate)).getTime() / 1000);
    shipmentRequest.orderId = body.orderId;
    shipmentRequest.productId = body.product;
    shipmentRequest.customer = body.customer;
    shipmentRequest.deliveryAddress = {};
    shipmentRequest.deliveryAddress.type = body.shippingAddress.type || 'SHIPPING';
    shipmentRequest.deliveryAddress.streetName = body.shippingAddress.streetName;
    shipmentRequest.deliveryAddress.streetNumber = body.shippingAddress.streetNumber;
    shipmentRequest.deliveryAddress.city = body.shippingAddress.city;
    shipmentRequest.deliveryAddress.postcode = body.shippingAddress.postcode;
    shipmentRequest.deliveryAddress.country = body.shippingAddress.country;
    return shipmentRequest;
}

function mapShipmentToAvroShipment(body) {

    var pickup = {};

    pickup.orderId = body.orderId;
    pickup.shipper = body.shipper;
    pickup.pickupDate = Math.round((new Date(body.date)).getTime() / 1000);

    return pickup;
}
;
