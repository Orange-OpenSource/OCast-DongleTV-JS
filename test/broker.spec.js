var assert = require("assert"); // node.js core module
var expect = require("chai").expect;
const WebSocket = require('ws');
var constants = require('../lib/constants');

function sendMessage(message, resolve) {
    var ws_url = 'ws://'+constants.WEBSOCKET_HOST+':' + constants.WEBSOCKET_PORT + constants.WEBSOCKET_PATH;
    var ws = new WebSocket(ws_url);
    ws.on('open', function() {
        ws.send(message);
        ws.on('message', function (msg) {
            ws.close();
            resolve(msg);
        });
    });
}

function replyClient(message) {
    var ws_url = 'ws://'+constants.WEBSOCKET_HOST+':' + constants.WEBSOCKET_PORT + constants.WEBSOCKET_PATH;
    var ws = new WebSocket(ws_url);
    ws.on('open', function() {
        ws.send(message);
        ws.on('message', function () {
            ws.send(message);
            ws.close();
        });
    });
    return ws;
}

describe('Broker', function(){
    var broker = require('../lib/broker');
    beforeEach(function(){
        broker.init();
    });
    afterEach(function(){
        broker.stop();
    });
    //todo: Test routing functions
    describe('message', function(){
        it("Server should receive a loop message", function() {
            var message = `{"dst":"browser","src":"browser","type":"command","id":1,"message":""}`;
            var testPromise = new Promise(function(resolve, reject) { sendMessage(message, resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('{"dst":"browser","src":"browser","type":"command","id":1,"message":""}');
            });
        });
        it("Receiver should receive a reply from the controller", function() {
            var msgController = `{"dst":"browser","src":"me","type":"reply","id":1,"status":"ok","message":""}`;
            var controller = replyClient(msgController);
            var msgReceiver = `{"dst":"me","src":"browser","type":"event","id":1,"message":""}`;
            var testPromise = new Promise(function(resolve, reject) { sendMessage(msgReceiver, resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('{"dst":"browser","src":"me","type":"reply","id":1,"status":"ok","message":""}');
            });
        });
        it("Should return a Json Parse Failure when the json is not valid", function() {
            var message = `{""}`;
            var testPromise = new Promise(function(resolve, reject) { sendMessage(message, resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('{"dst":null,"src":null,"type":null,"id":-1,"status":"json_format_error","message":null}');
            });
        });
        it("Should return an Error when a key is missing", function() {
            var message = `{"src":null,"type":null,"id":1,"message":null}`;
            var testPromise = new Promise(function(resolve, reject) { sendMessage(message, resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('{"dst":null,"src":null,"type":null,"id":-1,"status":"missing_mandatory_field","message":null}');
            });
        });
        it("Should return an Error when a value of a key is not valid", function() {
            var message = `{"dst":null,"src":null,"type":"toto","id":-1,"status":"Json parse failure","message":null}`;
            var testPromise = new Promise(function(resolve, reject) { sendMessage(message, resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('{"dst":null,"src":null,"type":"toto","id":-1,"status":"value_format_error","message":null}');
            });
        });
    });

});
