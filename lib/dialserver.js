/*jshint esversion: 6 */
/*
 Copyright 2017 Orange

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

'use strict';

var http = require('http');
var logger = require('tracer').console({level: global.debug?'log':'warn' });
const util = require('util');
var os = require('os');
var uuid = require('uuid').v1();
var constants = require('./constants');
var launch = require('launchpad');

require('colors');
var TAG = "DIALSERVER ".green;


const APPLICATION_STATUS = {
    STOPPED : "stopped",
    RUNNING : "running"
};

const DIAL_URN = "urn:cast-ocast-org:service:cast:1";

const WS_RESPONSE_UPNP = `<?xml version="1.0" encoding="UTF-8"?>
<root  xmlns="urn:schemas-upnp-org:device-1-0"  xmlns:r="urn:restful-tv-org:schemas:upnp-dd">
    <specVersion>
        <major>1</major>
        <minor>0</minor>
    </specVersion>
    <device>
        <deviceType>urn:schemas-upnp-org:device:tvdevice:1</deviceType>
            <friendlyName>OCAST_%s</friendlyName>
            <manufacturer>Orange SA</manufacturer>
            <modelName>Opencast</modelName>
            <UDN>uuid:%s</UDN>
    </device>
</root>`;

const WS_RESPONSE_DIAL = `<?xml version="1.0" encoding="UTF-8"?>
<service xmlns="urn:dial-multiscreen-org:schemas:dial"
        xmlns:ocast="urn:cast-ocast-org:service:cast:1" dialVer="2.1">
    <name>%s</name>
    <options allowStop="true"/>
    <state>%s</state>
    <additionalData>
        %s
    </additionalData>
    <link rel="run" href="run"/>
</service>`;

const ADDITIONNALDATA_HBBTV =
`   <ocast:X_OCAST_App2AppURL>ws://%s:%s%s</ocast:X_OCAST_App2AppURL>
    <ocast:X_OCAST_Version>1.0</ocast:X_OCAST_Version>`;

var simulatorStarted = false;
var currentApplicationID = null;
var webServer = null;
var dialServer = null;

exports.initializeSSDP = function (ip_address){
    var deviceWS = util.format("http://%s:%s/dd.xml",ip_address, constants.WEBSERVER_PORT);

    logger.log(TAG + "Register SSDP Server on "+DIAL_URN+" , description : "+deviceWS);
    var SSDP = require('node-ssdp').Server;
    var server = new SSDP({location: deviceWS});

    // Register URN
    server.addUSN(DIAL_URN);

    // Start server on all interfaces
    server.start('0.0.0.0');
    return server;
};


exports.initializeDIALServer = function (ip_address) {
    var dialWS = util.format("http://%s:%s/apps",ip_address, constants.WEBSERVER_PORT);

    logger.log(TAG +  'Simulate Cast Receiver on ' + dialWS);

    function stopBrowser() {
        var pkill = require('pkill');
        logger.log(TAG + "StopBrowser");
        pkill('Safari');
    }
    function onBrowserLaunched(error, worker) {
        if(error) {
            console.error('Error:', error);
            return;
        }
        logger.log(TAG +"Launched Safari. Process id:"+ worker.id);
    }
    function launchBrowser(url) {
        launch.local(function(err, launcher) {
            // User the launcher api
            launcher(url, {
                browser: 'safari'
            }, onBrowserLaunched.bind(this));
        });
    }

    function writeDialResponse(response,  body) {
        var header =  {
                        "Content-Type": "application/xml",
                        "Application-URL": dialWS,
                        "Access-Control-Allow-Method": "GET, POST, DELETE, OPTIONS",
                        "Access-Control-Expose-Headers": "Location",
                        "Content-Length":Buffer.byteLength(body)
                    };
        response.writeHead(200, header);
        response.end(body);
    }

    function writeServiceDescription(response, body) {
        var header = {  "Content-Type": "application/xml",
                        "Application-URL": dialWS,
                        "Content-Length":Buffer.byteLength(body)};
        response.writeHead(200,header);
        response.end(body);
    }

    function onGet(request,response) {
        var myState = simulatorStarted ? APPLICATION_STATUS.RUNNING : APPLICATION_STATUS.STOPPED;
        var additionnalParam = util.format(ADDITIONNALDATA_HBBTV, ip_address, constants.WEBSOCKET_PORT, constants.WEBSOCKET_PATH);

        switch (request.url) {
            case "/dd.xml":
                            writeServiceDescription(response,  util.format(WS_RESPONSE_UPNP, os.hostname(), uuid));
                            break;
            case "/apps" :
                if (! simulatorStarted) {
                    response.writeHead(404, {});
                    response.end("Not Found");
                } else {
                    writeDialResponse(response,  util.format(WS_RESPONSE_DIAL, currentApplicationID, myState, additionnalParam));
                }
                break;
            default:
                var applicationID = (request.url.startsWith("/apps/")) ? request.url.replace("/apps/", ""): null;
                if (applicationID in constants.DATASET) {
                    var myResponse =  util.format(WS_RESPONSE_DIAL, applicationID, (applicationID === currentApplicationID) ? myState : APPLICATION_STATUS.STOPPED, additionnalParam);
                    response.writeHead(200, {"Content-Type": "application/xml","Content-Length":Buffer.byteLength(myResponse)});
                    response.end(myResponse);
                } else {
                    response.writeHead(404, {});
                    response.end("Not Found");
                }
                break;
        }
    }
    function onPost(request, response) {
        var applicationID = (request.url.startsWith("/apps/")) ? request.url.replace("/apps/", ""): null;
        logger.log(TAG+ "onPost "+ applicationID);
        if (applicationID in constants.DATASET) {
            simulatorStarted = true;
            currentApplicationID = applicationID;
            response.writeHead(201, {"Content-Type": "application/xml",
                                    "Location": dialWS + "/apps/"+applicationID+"/run",
                                    "Access-Control-Allow-Origin": "*"
                                    });

            response.end("Created");
             if (global.debug) {
                 launchBrowser(constants.DATASET[applicationID]);
             }
        } else {
            response.writeHead(404, {});
            response.end("Not Found");
        }
    }
    function onDelete(request, response) {
        var applicationID = (request.url.startsWith("/apps/")) ? request.url.replace("/apps/", "").replace("/run",""): null;
        logger.log(TAG+ "onDelete "+ applicationID);
        if (simulatorStarted && applicationID === currentApplicationID) {
            simulatorStarted = false;
            stopBrowser();
            response.writeHead(200, {
                "Content-Type": "application/xml",
                "Access-Control-Allow-Origin": "*"
            });
            response.end('Deleted');
        } else {
            response.writeHead(404, {});
            response.end("Not Found");
        }
    }
    // Configure our HTTP server
    var server = http.createServer(function (request, response) {
            logger.log(util.format("%s %s %s",TAG, request.method, request.url));
            switch (request.method) {
                case 'GET': onGet(request,response);
                       break;
                case 'POST': onPost(request,response);
                        break;
                case 'DELETE': onDelete(request, response);
                        break;
                default:
                    response.writeHead(500, {"Content-Type": "application/xml", "Application-URL": dialWS + "/apps/"});
                    response.end('Internal Error');
                    simulatorStarted = false;
            }
        });

    // Listen on port 8008, IP defaults to 0.0.0.0
    server.listen(constants.WEBSERVER_PORT);
    return server;
};


exports.init = function (ip_address) {
    var addr = ip_address!=null? ip_address : require('ip').address();
    dialServer = this.initializeDIALServer(addr);
    webServer = this.initializeSSDP(addr);
};

exports.stop = function () {
    webServer.stop();
    dialServer.close();
};

exports.search = function() {
    function analyseApplication(url) {
        var request = require('request');
        request(url, {method: 'GET'}, function (err, res){
            logger.log(TAG + "New application url found ! : "+res.headers['application-url']);
        });
    }
    var Client = require('node-ssdp').Client;
    var client = new Client();

    client.on('response', function (headers, statusCode, rinfo) {
        var location = headers['LOCATION'];
        logger.log(TAG + 'Analyse new Location ', location, statusCode, rinfo);
        analyseApplication(location);
    });

    // search for a service type
    logger.log(TAG + "Search : "+DIAL_URN);
    client.search(DIAL_URN);

    setTimeout(function () {client.stop();}, 10000);
};

exports.startApp = function (appID) {
    new Promise(function (resolve) {
        logger.log(TAG + 'startApp ', appID, constants.WEBSOCKET_HOST);
        var options = {
            host: constants.WEBSOCKET_HOST,
            path: '/apps/' + appID,
            port: '8008',
            method: 'POST'
        };
        http.request(options, function () {
            resolve();
        }).end();
    });
};

exports.listApp = function () {
    var result = "";
    for (var key in constants.DATASET) {
        result+=util.format("AppID=%s\tUrl=%s\n",key,constants.DATASET[key]);
    }
    return result;
};

exports.stopApp = function (appID) {
    new Promise(function (resolve) {
        logger.log(TAG + 'stopApp ', appID);
        var options = {
            host: constants.WEBSOCKET_HOST,
            path: '/apps/' + appID + "/run",
            port: '8008',
            method: 'DELETE'
        };
        http.request(options, function () {
            resolve();
        }).end();
    });
};
