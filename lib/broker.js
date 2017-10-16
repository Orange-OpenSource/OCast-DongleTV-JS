/*jshint esversion: 6 */
/*
* Copyright 2017 Orange
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
*    Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
* limitations under the License.
*/

const ws = require('ws');
var logger = require('tracer').console({level: global.debug?'log':'warn' });
var constants = require('./constants');
var OrangeCastTransport = require('./transport').OrangeCastTransport;
require('colors');
var TAG = "BROKER ".cyan;

var wss = null;
const WILDCARD_ANY = "*";
const ERROR_JSON_FORMAT_ERROR = "json_format_error";
const ERROR_MISSING_MANDATORY_FIELD = "missing_mandatory_field";
const ERROR_VALUE_FORMAT_ERROR = "value_format_error";
const ERROR_INTERNAL = "internal_error";

exports.stop = function () {
    wss.close();
};
exports.init = function () {
    logger.log(TAG+ "Starting websocket servers... on Port "+constants.WEBSOCKET_PORT);
    wss = new ws.Server({ port: constants.WEBSOCKET_PORT });

    wss.routeMessage = function routeMessage(orangeCastTransportMessage) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === ws.OPEN) {
                if    ( (( orangeCastTransportMessage.dst !== WILDCARD_ANY ) && (orangeCastTransportMessage.dst === client.uuid)) ||         // Broadcast for one person
                        ((orangeCastTransportMessage.dst === WILDCARD_ANY) && (orangeCastTransportMessage.src !== client.uuid )))   {        // Broadcast for everyone except sender
                    logger.log(TAG+ "[ROUTE][%s -> %s] %s",orangeCastTransportMessage.src, orangeCastTransportMessage.dst, orangeCastTransportMessage.toJSON());
                    client.send(orangeCastTransportMessage.toJSON());
                }
            }
        });
    };

    wss.on('connection', function connection(ws) {
        ws.uuid = null;
        ws.on('message', function incoming(data) {
            var orangeCastTransportMessage = null;
            try {
                orangeCastTransportMessage = new OrangeCastTransport();
                orangeCastTransportMessage.parse(data);
                logger.log(TAG+ "[ONMESSAGE] - "+orangeCastTransportMessage.toJSON());
                ws.uuid = orangeCastTransportMessage.src;
                wss.routeMessage(orangeCastTransportMessage);
            } catch (e) {
                if (e instanceof SyntaxError ) {
                    orangeCastTransportMessage.setStatus(ERROR_JSON_FORMAT_ERROR);
                } else if (e instanceof RangeError) {
                    orangeCastTransportMessage.setStatus(ERROR_VALUE_FORMAT_ERROR);
                } else if (e instanceof EvalError) {
                    orangeCastTransportMessage.setStatus(ERROR_MISSING_MANDATORY_FIELD);
                } else {
                    orangeCastTransportMessage.setStatus(ERROR_INTERNAL);
                }
                logger.log(TAG+ "send error "+orangeCastTransportMessage.toJSON());
                ws.send(orangeCastTransportMessage.toJSON());
            }
        });
    });
};


