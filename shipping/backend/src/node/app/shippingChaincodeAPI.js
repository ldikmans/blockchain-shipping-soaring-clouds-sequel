const request = require('request');
const requestPromise = require('request-promise');

const blockchainURL = process.env.BLOCKCHAINURL || "https://8079FF3CB5414DF58C70FC643899CCED.blockchain.ocp.oraclecloud.com:443";
const restproxy = process.env.RESTPROXY || '/restproxy4';
const resource = process.env.RESOURCE || '/bcsgw/rest/v1/transaction';
const username =  'systemaccount';
const password = process.env.PASSWORD || 'Welcome1welcome1';
const channel = process.env.CHANNEL || 'testshipping';

exports.invokeMethod = async function (requestBody) {
    console.log("username: " + username);
    return requestPromise({
        url: blockchainURL + restproxy + resource + '/invocation',
        method: "POST",
        auth: {
            user: username,
            pass: password
        },
        json: true, 
        body: requestBody
    }, function (error, response, body) {
        if (error) {
            console.error(error);
            return error;
        }
        else{
            return body;
        }
    });
};

exports.invokeMethodAsync = function(requestBody){
    return request({
        url: blockchainURL + restproxy + resource + '/asyncInvocation',
        method: "POST",
        auth: {
            user: username,
            pass: password
        },
        json: true, 
        body: requestBody
    }, function (error, response, body) {
        if (error) {
            console.error(error);
            return error;
        }
        else{
            return checkStatus(body.txid, channel);
        }
    });
};

//todo replace with callback url
function checkStatus(txid, channel) {
    request({
        url: blockchainURL + restproxy + resource + '?channel=' + channel + '&txid=' + txid,
        method: "GET",
        auth: {
            user: username,
            pass: password
        },
        json: true 
    }, function (error, response, body) {
        if(error){
            console.error(error);
            return error;
        }
        else{ 
            if (body.returnCode === "InProgress"){
                return checkStatus(txid, channel);
            }
            else{
                console.log("transaction succesfull");
                return body;
            }
        }
    });
};

exports.invokeQuery = async function (requestBody) {
    return requestPromise({
        url: blockchainURL + restproxy + resource + '/query',
        method: "POST",
        auth: {
            user: username,
            pass: password
        },
        json: true, 
        body: requestBody
    }, function (error, response, body) {
        if (error) {
            console.error(error);
            return error;
        }
        else{
            return body;
        }
    });
};


