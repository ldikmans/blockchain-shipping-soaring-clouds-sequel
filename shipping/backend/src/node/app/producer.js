const KafkaAvro = require('kafka-avro');
const logger = require('./logger');

var kafkaAvro;

var kafkaBrokerVar = process.env.KAFKA_BROKER || 'localhost:9092';
var kafkaRegistryVar = process.env.KAFKA_REGISTRY || 'http://130.61.35.61:8081';

//topics as they are defined on Kafka
const SHIPMENT_OFFERED_TOPIC = process.env.KAFKA_SHIPMENT_OFFER_TOPIC || 'soaring-shipmentoffer';
const SHIPMENT_PICKEDUP_TOPIC = process.env.KAFKA_SHIPMENT_PICKEDUP_TOPIC || 'soaring-shipmentpickedup';
const SHIPMENT_RECEIVED_TOPIC = process.env.KAFKA_SHIPMENT_RECEIVED_TOPIC || 'soaring-shipmentreceived';
const SHIPMENT_REQUEST_ISSUED_TOPIC = process.env.KAFKA_SHIPMENT_REQUEST_ISSUED_TOPIC || 'soaring-shipmentrequestissue';


exports.initKafkaAvro = function () {
    kafkaAvro = new KafkaAvro(
            {
                kafkaBroker: kafkaBrokerVar,
                schemaRegistry: kafkaRegistryVar,
                parseOptions: {wrapUnions: true}
            }
    );
    logger.debug("kafkaBroker: " + kafkaBrokerVar);
    logger.debug("kafkaRegistryVar: " + kafkaRegistryVar);
    kafkaAvro.init()
            .then(function () {
                logger.info('Kafka Avro Ready to use');

            });
};

exports.publishShipmentOffered = function (offer) {
    logger.debug('publising offer ' + JSON.stringify(offer));
    kafkaAvro.getProducer({
    }).then(function (producer) {
        var topicName = SHIPMENT_OFFERED_TOPIC;

        producer.on('disconnected', function (arg) {
            logger.info('producer disconnected. ' + JSON.stringify(arg));
        });

        producer.on('event.error', function (err) {
            logger.error('Error from producer');
            logger.error(err);
        });

        producer.on('delivery-report', function (err, report) {
            logger.info('in delivery report');
            if (err) {
                logger.error('error occurred: ' + err);
            } else {
                logger.info('delivery-report: ' + JSON.stringify(report));
            }
        });


        var topic = producer.Topic(topicName, {
            'request.required.acks': 1
        });

        var key = offer.orderId;
        //var key = 'test_key_from_real_code';
        logger.debug('key: ' + key);
        if (!key) {
            key = offer.shipper + '_' + offer.orderId + '_' + offer.deliveryDate;
        }
        var partition = -1;
        newOffer = mapOfferToAvroOffer(offer);
        logger.debug('newOffer: ' + JSON.stringify(newOffer));
        producer.produce(topic, partition, newOffer, key);



    }).catch(function (exception) {
        logger.error("exception: " + exception);
    });

};

exports.publishShipmentRequestReceived = function (shipmentRequest){
    logger.debug('publishing shipment request received' + JSON.stringify(shipmentRequest));
      kafkaAvro.getProducer({
    })

            .then(function (producer) {
                var topicName = SHIPMENT_RECEIVED_TOPIC;

                producer.on('disconnected', function (arg) {
                    logger.info('producer disconnected. ' + JSON.stringify(arg));
                });

                producer.on('event.error', function (err) {
                    logger.error('Error from producer');
                    logger.error(err);
                });

                producer.on('delivery-report', function (err, report) {
                    if (err) {
                        logger.error('error: ' + err);
                    } else {
                        logger.info('delivery-report: ' + JSON.stringify(report));
                    }
                });


                var topic = producer.Topic(topicName, {
                    'request.required.acks': 1
                });


                var key = shipmentRequest.orderId;
                //var key = 'test_key_from_real_code';
                logger.debug('key: ' + key);
                if (!key) {
                    key = shipmentRequest.product + '_';;
                }
                var partition = -1;
                newShipmentRequest = mapShipmentRequestToAvroShipmentRequest(shipmentRequest);
                logger.debug('newShipmentRequest: ' + JSON.stringify(newShipmentRequest));
                producer.produce(topic, partition, newShipmentRequest, key);
            }).catch(function (exception) {
        logger.error("exception: " + exception);
    });

};

exports.publishShipmentPickedUp = function (shipment) {
    logger.debug('publishing shipment picked up: ' + JSON.stringify(shipment));
    kafkaAvro.getProducer({
    })

            .then(function (producer) {
                var topicName = SHIPMENT_PICKEDUP_TOPIC;

                producer.on('disconnected', function (arg) {
                    logger.info('producer disconnected. ' + JSON.stringify(arg));
                });

                producer.on('event.error', function (err) {
                    logger.error('Error from producer');
                    logger.error(err);
                });

                producer.on('delivery-report', function (err, report) {
                    if (err) {
                        logger.error('error: ' + err);
                    } else {
                        logger.info('delivery-report: ' + JSON.stringify(report));
                    }
                });


                var topic = producer.Topic(topicName, {
                    'request.required.acks': 1
                });


                var key = shipment.orderId;
                //var key = 'test_key_from_real_code';
                logger.debug('key: ' + key);
                if (!key) {
                    key = shipment.product + '_' + shipment.customer;
                }
                var partition = -1;
                newShipment = mapShipmentToAvroShipment(shipment);
                logger.debug('newShipment: ' + JSON.stringify(newShipment));
                producer.produce(topic, partition, newShipment, key);
            }).catch(function (exception) {
        logger.error("exception: " + exception);
    });

};


exports.publishShipmentReceived = function (shipment) {
    logger.debug('publishing shipment received: ' + JSON.stringify(shipment));
    kafkaAvro.getProducer({
    })

            .then(function (producer) {
                var topicName = SHIPMENT_RECEIVED_TOPIC;

                producer.on('disconnected', function (arg) {
                    logger.info('producer disconnected. ' + JSON.stringify(arg));
                });

                producer.on('event.error', function (err) {
                    logger.error('Error from producer');
                    logger.error(err);
                });

                producer.on('delivery-report', function (err, report) {
                    if (err) {
                        logger.error('error: ' + err);
                    } else {
                        logger.info('delivery-report: ' + JSON.stringify(report));
                    }
                });


                var topic = producer.Topic(topicName, {
                    'request.required.acks': 1
                });


                var key = shipment.orderId;
                //var key = 'test_key_from_real_code';
                logger.debug('key: ' + key);
                if (!key) {
                    key = shipment.product + '_' + shipment.customer;
                }
                var partition = -1;
                newShipment = mapShipmentToAvroShipment(shipment);
                logger.debug('newShipment: ' + JSON.stringify(newShipment));
                producer.produce(topic, partition, newShipment, key);
            }).catch(function (exception) {
        logger.error("exception: " + exception);
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

function mapShipmentRequestToAvroShipmentRequest(body){
    var shipmentRequest = {};
    
    shipmentRequest.date = Math.round((new Date(body.date)).getTime() / 1000;
    shipmentRequest.orderId = body.orderId;
    shipmentRequest.productId = body.productId;
    shipmentRequest.deliveryAddress = {};
    shipmentRequest.deliveryAddress.streetName = body.deliveryAddress.streetName;
    shipmentRequest.deliverAddress.streetNumber = body.deliveryAddress.streetNumber;
    shipmentRequest.deliveryAddress.city = body.deliveryAddress.city;
    shipmentRequest.deliveryAddres.postcode = body.deliveryAddress.postcode;
    shipmentRequest.deliveryAddress.country = body.deliveryAddress.country;
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
