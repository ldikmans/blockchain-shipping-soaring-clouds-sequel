'use strict';
const shim = require('fabric-shim');
const util = require('util');

var Chaincode = class {

    /**
     //offer struct
     let offer = {
     'offerId' = string //unique offer id
     'orderId': string //the shipment it belongs to
     'shipper': string //the id of the shipper
     'deliveryDate': string //proposed deliveryDate
     'price': string //proposed price'
     }
     
     
     //shipment struct
     let shipment ={
     'orderId': string //link it to the order in the webshop
     'product': string //description of the product
     'customer': string //customer id
     'shippingAddress': string //shipping address
     'docType': string, default 'shipment'    //docType  is used to distinguish the various types of objects in state database
     'issuer': string
     'orderDate'': integer
     'shipper': string //any connected shipper on the blockchain
     'price': decimal //price in euros
     'deliveryDate': integer //delivery date promised
     'offer': offer //offer object
     'custodian': string //whoever currently holds the order
     'currentState':string //issues, received, selected, pickedup, 
     }        
     **/
    // Initialize the chaincode
    async Init(stub) {
        console.info('=========  shipmnet Init =========');
        let ret = stub.getFunctionAndParameters();
        console.info(ret);
        return shim.success();
    }

    async Invoke(stub) {
        console.info('Transaction ID: ' + stub.getTxID());
        let ret = stub.getFunctionAndParameters();
        console.info(ret);
        let method = this[ret.fcn];
        if (!method) {
            console.error('no method of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }

        console.info('\nCalling method : ' + ret.fcn);
        try {
            let payload = await method(stub, ret.params, this);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    // ============================================================
    // issueShipment - create a new shipment , store into chaincode state
    // ============================================================       
    async issueShipment(stub, args, thisClass) {

        let shipment = {};
        let jsonResp = {};

        shipment.docType = 'shipment';

        if (args.length != 6) {
            throw new Error('Incorrect number of arguments. Expecting 6');
        }

        // ==== Input sanitation ====
        console.info('- start init shipment');
        if (args[0].length <= 0) {
            throw new Error('1st argument must be a non-empty string, for orderId');
        }
        if (args[1].length <= 0) {
            throw new Error('2nd argument must be a non-empty string for product');
        }
        if (args[2].length <= 0) {
            throw new Error('3rd argument must be a non-empty string for customer');
        }
        if (args[3].length <= 0) {
            throw new Error('4th argument must be a non-empty string for shippingAddress');
        }
        if (args[4].length <= 0) {
            throw new Error('5th argument must be a non-empty string for orderDate');
        }
         if (args[5].length <= 0) {
            throw new Error('6th argument must be a non-empty string for custodian');
        }

        shipment.orderId = args[0];
        shipment.product = args[1].toLowerCase();
        shipment.customer = args[2].toLowerCase();
        shipment.shippingAddress = args[3];
        shipment.orderDate = parseInt(args[4]);
        if (typeof shipment.orderDate !== 'number') {
            throw new Error('5th argument must be a numeric string');
        }
        shipment.custodian = args[5].toLowerCase();
        shipment.offers = [];

        // ==== Check if vehicle already exists ====
        let shipmentAsBytes = await stub.getState(shipment.orderId);
        if (shipmentAsBytes.toString()) {
            console.info('This shipment already exists: ' + shipment.orderId);
            jsonResp.Error = 'This shipment already exists: ' + shipment.orderId;
            throw new Error(JSON.stringify(jsonResp));
        }

        // ==== Create vehicle object and marshal to JSON ====
        let shipmentJSONasBytes = Buffer.from(JSON.stringify(shipment));

        // === Save vehicle to state ===
        await stub.putState(shipment.orderId, shipmentJSONasBytes);

        // ==== Vehicle part saved and indexed. Return success ====
        console.info('- end init shipment');
    }

    // =================================================
    // readShipment - read a vehicle from chaincode state
    // =================================================
    async readShipment(stub, args, thisClass) {
        let jsonResp = {};
        if (args.length != 1) {
            throw new Error("Incorrect number of arguments. Expecting oder id  of the shipment to query");
        }

        let orderId = args[0];

        let valAsbytes = await stub.getState(orderId); //get the vehicle from chaincode state
        if (!valAsbytes.toString()) {
            console.info("Failed to get state for " + orderId);
            jsonResp.Error = "Failed to get state for " + orderId;
            throw new Error(JSON.stringify(jsonResp));
        }

        return valAsbytes;
    }    

    // ==========================================================
    // deleteVehicle - remove a vehicle key/value pair from state
    // ==========================================================
    async deleteShipment(stub, args, thisClass) {
        let jsonResp = {};

        if (args.length != 1) {
            throw new Error("Incorrect number of arguments. Expecting 1");
        }
        let orderId = args[0];

        // to maintain the manufacturer~chassisNumber index, we need to read the vehicle first and get its assembler
        let valAsbytes = await stub.getState(orderId); //get the vehicle from chaincode state
        if (!valAsbytes.toString()) {
            console.info("Failed to get state for " + orderId);
            jsonResp.Error = "Failed to get state for " + orderId;
            throw new Error(JSON.stringify(jsonResp));
        }

        let shipment = {};
        try {
            shipment = JSON.parse(valAsbytes.toString('utf8'));
        } catch (err) {
            console.info("Failed to decode JSON of: " + oderId);
            jsonResp.Error = "Failed to decode JSON of: " + orderId;
            throw new Error(JSON.stringify(jsonResp));
        }

        await stub.deleteState(orderId); //remove the vehicle from chaincode state

        console.info('-deleteShipment end');

    }

    // ======================================================================
    // offer a shipment price and date
    // ======================================================================
    async offerShipment(stub, args, thisClass) {
        //to be implemented
        console.info('offering shipment, not implemented yet');

        let jsonResp = {};
        //   0       1       2
        // "name", "from", "to"
        if (args.length < 5) {
            throw new Error("Incorrect number of arguments. Expecting 5");
        }

        let offerId = args[0]
        let orderId = args[1];
        let shipper = args[2];
        let price = args[3];
        if (typeof price !== 'decimal') {
            throw new Error('3rd argument must be a decimal string');
        }
        let deliveryDate = args[4];
        if (typeof deliveryDate !== 'number') {
            throw new Error('4th argument must be a numeric string');
        }

        console.info("- start offer shipping ", orderId, shipper, price, deliveryDate);

        let shipmentAsBytes = await stub.getState(orderId);
        if (!shipmentAsBytes.toString()) {
            console.info("Failed to get shipment: ", orderId);
            jsonResp.Error = "Failed to get shipment: " + orderId;
            throw new Error(JSON.stringify(jsonResp));
        }

        let shipment = {};
        try {
            shipment = JSON.parse(shipmentAsBytes.toString('utf8'));
        } catch (err) {
            console.info("Failed to decode shipment: ", orderId);
            jsonResp.Error = "Failed to decode shipment: " + orderId;
            throw new Error(JSON.stringify(jsonResp));
        }

        let offer = {};

        offer.offerId = offerId;
        offer.shipper = shipper; //change the owner
        offer.deliveryDate = deliveryDate; //set the proposed deliver date
        offer.price = price; //set the proposed price

        if (!shipment.offers) {
            shipment.offers = [];
        }

        shipment.offers.push(offer);

        let shipmentJSONBytes = Buffer.from(JSON.stringify(shipment));

        await stub.putState(orderId, shipmentJSONBytes); //rewrite the shipment

        console.info("- end offerShipment (success)");



    }

    // ======================================================================
    // select a shipment offer
    // ======================================================================
    async selectShipmentOffer(stub, args, thisClass) {
        //to be implemented
        console.info('selecting a shipment offer not implemented yet');
    }

    // ======================================================================
    // Pickup shipment from current custodian
    // ======================================================================
    async pickupShipment(stub, args, thisClass) {
        console.info('picking up Shipmnet, not implemented yet');
    }

    // ======================================================================
    // Receive shipment 
    // ======================================================================
    async receiveShipment(stub, args, thisClass) {
        console.info("received shipment, not implemented yet");
    }

   

    // ===== Example: Parameterized rich query =================================================
    // queryShipmentByCustodian queries for shipments based on a passed in custodian
    // This is an example of a parameterized query where the query logic is baked into the chaincode,
    // and accepting a single query parameter (custodian).
    // =========================================================================================
    async queryShipmentByCustodian(stub, args, thisClass) {

        if (args.length !== 1) {
            throw new Error("Incorrect number of arguments. Expecting 1");
        }

        let custodian = args[0].toLowerCase();

        let queryString = util.format("SELECT valueJson FROM <STATE> WHERE json_extract(valueJson, '$.docType', '$.custodian') = '[\"shipment\",\"%s\",\"%s\"]'", custodian);

        let method = thisClass['getQueryResultForQueryString'];
        let queryResults = await method(stub, queryString, thisClass);

        return queryResults;
    }
    
      // ===== Example: Parameterized rich query =================================================
    // queryShipmentByCustodian queries for shipments based on a passed in custodian
    // This is an example of a parameterized query where the query logic is baked into the chaincode,
    // and accepting a single query parameter (custodian).
    // =========================================================================================
    async queryShipmentByCustodian(stub, args, thisClass) {

        if (args.length !== 1) {
            throw new Error("Incorrect number of arguments. Expecting 1");
        }

        let custodian = args[0].toLowerCase();

        let queryString = util.format("SELECT valueJson FROM <STATE> WHERE json_extract(valueJson, '$.docType', '$.custodian') = '[\"shipment\",\"%s\",\"%s\"]'", custodian);

        let method = thisClass['getQueryResultForQueryString'];
        let queryResults = await method(stub, queryString, thisClass);

        return queryResults;
    }
    
    
    // ===== Example: Parameterized rich query =================================================
    // getShipmentByProduct queries for shipments based on a passed in product.
    // This is an example of a parameterized query where the query logic is baked into the chaincode,
    // and accepting a single query parameter (product).
    // =========================================================================================
    async queryShipmentByCustomer(stub, args, thisClass) {

        if (args.length < 1) {
            throw new Error("Incorrect number of arguments. Expecting 1");
        }

        let product = args[0].toLowerCase();

        let queryString = util.format("SELECT valueJson FROM <STATE> WHERE json_extract(valueJson, '$.docType', '$.product') = '[\"shipment\",\"%s\"]'", product);

        let method = thisClass['getQueryResultForQueryString'];
        let queryResults = await method(stub, queryString, thisClass);

        return queryResults;
    }
    

    // ===== Example: Parameterized rich query =================================================
    // queryVehiclePartByOwner queries for vehicle part based on a passed in owner.
    // This is an example of a parameterized query where the query logic is baked into the chaincode,
    // and accepting a single query parameter (owner).
    // =========================================================================================
    async queryShipmentByShipper(stub, args, thisClass) {

        if (args.length < 1) {
            throw new Error("Incorrect number of arguments. Expecting 1");
        }

        let shipper = args[0].toLowerCase();

        let queryString = util.format("SELECT valueJson FROM <STATE> WHERE json_extract(valueJson, '$.docType', '$.shipper') = '[\"shipment\",\"%s\"]'", shipper);

        let method = thisClass['getQueryResultForQueryString'];
        let queryResults = await method(stub, queryString, thisClass);

        return queryResults;
    }
    // ===== Example: Ad hoc rich query ========================================================
    // queryVehiclePart uses a query string to perform a query for vehiclePart.
    // Query string matching state database syntax is passed in and executed as is.
    // Supports ad hoc queries that can be defined at runtime by the client.
    // =========================================================================================
    async queryShipment(stub, args, thisClass) {

        // "queryString"
        if (args.length < 1) {
            throw new Error("Incorrect number of arguments. Expecting 1");
        }

        let queryString = args[0];

        let method = thisClass['getQueryResultForQueryString'];
        let queryResults = await method(stub, queryString, thisClass);

        return queryResults;
    }

    // =========================================================================================
    // getQueryResultForQueryString executes the passed in query string.
    // Result set is built and returned as a byte array containing the JSON results.
    // =========================================================================================
    async getQueryResultForQueryString(stub, queryString, thisClass) {

        console.info("- getQueryResultForQueryString queryString:\n", queryString);

        let resultsIterator = await stub.getQueryResult(queryString);

        // results is a JSON array containing QueryRecords
        let results = [];

        while (true) {
            let oneRecord = {};
            let res = await resultsIterator.next();
            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));
                try {
                    oneRecord = JSON.parse(res.value.value.toString('utf8'));

                } catch (err) {
                    console.log(err);
                    oneRecord = res.value.value.toString('utf8');
                }
                results.push(oneRecord);
            }
            if (res.done) {
                console.info('end of data');
                await resultsIterator.close();

                console.log("- getQueryResultForQueryString queryResult:\n", JSON.stringify(results));
                return Buffer.from(JSON.stringify(results));
            }
        }
    }

    // ===========================================================================================
    // getHistoryForRecord returns the histotical state transitions for a given key of a record
    // ===========================================================================================
    async getHistoryForRecord(stub, args, thisClass) {

        if (args.length < 1) {
            throw new Error("Incorrect number of arguments. Expecting 1");
        }

        let recordKey = args[0];

        console.info("- start getHistoryForRecord: %s\n", recordKey);

        let resultsIterator = await stub.getHistoryForKey(recordKey);

        // results is a JSON array containing historic values for the key/value pair
        let results = [];
        while (true) {
            let res = await resultsIterator.next();
            let jsonRes = {};

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));
                jsonRes.TxId = res.value.tx_id;
                jsonRes.Timestamp = new Date(res.value.timestamp.seconds.low).toString();
                jsonRes.IsDelete = res.value.is_delete.toString();
                try {
                    jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Value = res.value.value.toString('utf8');
                }
                results.push(jsonRes);
            }
            if (res.done) {
                console.info('end of data');
                await resultsIterator.close();
                console.log("- getHistoryForRecord returning:\n", JSON.stringify(results));

                return Buffer.from(JSON.stringify(results));
            }
        }
    }

}
;
        shim.start(new Chaincode());

