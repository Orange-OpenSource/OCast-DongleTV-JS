var assert = require("assert"); // node.js core module
var expect = require("chai").expect;
var http = require('http');
var constants = require('../lib/constants');
var fastXmlParser = require('fast-xml-parser');

function sendMessage(type, path, resolve) {
    var options = {
        host: constants.WEBSOCKET_HOST,
        path: path,
        port: constants.WEBSERVER_PORT,
        method: type
    };
    var callback = function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            resolve(str);
        });
    };
    var req = http.request(options, callback);
    req.end();
}

describe('Dial Server', function(){

    var ip_address = require('ip').address();
    var dialserver = require('../lib/dialserver').initializeDIALServer(ip_address);

    describe('message', function() {
        it("Server should return Not Found when Deleting a wrong application", function (done) {
            //assert.equal(dialserver.init());
            done();
        });
    });
    describe('message', function() {
        it("Server should return Not Found when Deleting a wrong application", function (done) {
            //assert.equal(dialserver.close());
            done();
        });
    });
    after(function(){
        dialserver.close();
    });
});

describe('Dial Queries', function(){
    var dialserver = require('../lib/dialserver');
    var ip_address = require('ip').address();

    describe('message', function(){
        before(function(){
            dialserver.init();
        });
        after(function(){
            dialserver.stop();
        });
        it("Server should return Not Found when Deleting a wrong application", function() {
            var testPromise = new Promise(function(resolve, reject) {
                sendMessage("DELETE", constants.WEBSERVER_PATH+"/ORANGE", resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('Not Found');
            });
        });
        it("Server should return Not Found when Getting a wrong application", function() {
            var testPromise = new Promise(function(resolve, reject) {
                sendMessage("GET", constants.WEBSERVER_PATH+"/ORANGE", resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('Not Found');
            });
        });
        it("Server should return Not Found when posting a wrong application", function() {
            var testPromise = new Promise(function(resolve, reject) {
                sendMessage("POST", constants.WEBSERVER_PATH+"/ORANGE", resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('Not Found');
            });
        });
        it("Server should return Created when posting a good application", function() {
            var testPromise = new Promise(function(resolve, reject) {
                sendMessage("POST", constants.WEBSERVER_PATH+"/Orange-DefaultReceiver-DEV", resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('Created');
            });
        });
        it("Server should return running application", function() {
            var testPromise = new Promise(function(resolve, reject) {
                sendMessage("GET", constants.WEBSERVER_PATH+"/Orange-DefaultReceiver-DEV", resolve); } );
            return testPromise.then(function(result){
                //assert.equal(fastXmlParser.validate(result),true);
                expect(result).to.equal('<?xml version="1.0" encoding="UTF-8"?>\n<service xmlns="urn:dial-multiscreen-org:schemas:dial"\n        xmlns:ocast="urn:cast-ocast-org:service:cast:1" dialVer="2.1">\n    <name>Orange-DefaultReceiver-DEV</name>\n    <options allowStop="true"/>\n    <state>running</state>\n    <additionalData>\n           <ocast:X_OCAST_App2AppURL>ws://'+ip_address+':'+constants.WEBSOCKET_PORT+constants.WEBSOCKET_PATH+'</ocast:X_OCAST_App2AppURL>\n    <ocast:X_OCAST_Version>1.0</ocast:X_OCAST_Version>\n    </additionalData>\n    <link rel="run" href="run"/>\n</service>');
            });
        });
        it("Server should return running application", function() {
            var testPromise = new Promise(function(resolve, reject) {
                sendMessage("GET", constants.WEBSERVER_PATH, resolve); } );
            return testPromise.then(function(result){
                expect(fastXmlParser.validate(result)).to.equal(true);
                expect(result).to.equal('<?xml version="1.0" encoding="UTF-8"?>\n<service xmlns="urn:dial-multiscreen-org:schemas:dial"\n        xmlns:ocast="urn:cast-ocast-org:service:cast:1" dialVer="2.1">\n    <name>Orange-DefaultReceiver-DEV</name>\n    <options allowStop="true"/>\n    <state>running</state>\n    <additionalData>\n           <ocast:X_OCAST_App2AppURL>ws://'+ip_address+':'+constants.WEBSOCKET_PORT+constants.WEBSOCKET_PATH+'</ocast:X_OCAST_App2AppURL>\n    <ocast:X_OCAST_Version>1.0</ocast:X_OCAST_Version>\n    </additionalData>\n    <link rel="run" href="run"/>\n</service>');
            });
        });
        it("Server should return Deleted application", function() {
            var testPromise = new Promise(function(resolve, reject) {
                sendMessage("DELETE", constants.WEBSERVER_PATH+"/Orange-DefaultReceiver-DEV"+"/run", resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('Deleted');
            });
        });
        it("Server should return no application", function() {
            var testPromise = new Promise(function(resolve, reject) {
                sendMessage("GET", constants.WEBSERVER_PATH, resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('Not Found');
            });
        });
        it("Server should return an internal error", function() {
            var testPromise = new Promise(function(resolve, reject) {
                sendMessage("OPTIONS", constants.WEBSERVER_PATH+"/Orange-DefaultReceiver-DEV", resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('Internal Error');
            });
        });
        it("Server should return dataset", function() {
            assert.equal(dialserver.listApp(),"AppID=EXAMPLE_ES6\tUrl=http://localhost:8090/examples/es6/src/index.html\nAppID=Orange-DefaultReceiver-DEV\tUrl=http://localhost:8090/examples/es6/src/index.html\nAppID=LOCAL\tUrl=http://localhost:8090/local/src/index.html\n");
        });
        it("Server should stop application", function() {
            assert.equal(dialserver.stopApp());
        });
        it("Server should start application", function() {
            assert.equal(dialserver.startApp());
        });
        it("Server should return detected dongle tv", function() {
            assert.equal(dialserver.search());
        });
        /*
        it("Server should reply a command", function() {
            var testPromise = new Promise(function(resolve, reject) {
                sendMessage("GET", constants.WEBSERVER_PATH, resolve); } );
            return testPromise.then(function(result){
                expect(result).to.equal('<?xml version="1.0"?>\n<service xmlns="urn:dial-multiscreen-org:schemas:dial"\n        xmlns="urn:hbbtv:HbbTVCompanionScreen:2014" dialVer="2.1">\n    <name>Orange-DefaultReceiver-DEV</name>\n    <options allowStop="true"/>\n    <state>running</state>\n    <additionalData>\n           <hbbtv:X_HbbTV_App2AppURL>\n            ws://192.168.43.184:4434/ocast\n    </hbbtv:X_HbbTV_App2AppURL>\n    </additionalData>\n    <link rel="run" href="run"/>\n</service>');
            });
        });*/

    });
});