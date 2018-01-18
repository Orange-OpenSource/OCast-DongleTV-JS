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

var WebSocket = require('ws');
var constants = require('./constants');
var logger = require('tracer').console({level: global.debug?'log':'warn' });
var os = require('os');

require('colors');
var TAG = "D2R - ".green;
var sequenceId = 1;


function getOCastMessage(jsonOCastMessage, namespace) {
    return  JSON.stringify({
        dst: "browser",
        src: os.hostname(),
        type: "command",
        id : sequenceId++,
        message: {
            service: namespace,
            data: jsonOCastMessage
        }
    });
}


exports.sendMessage  = function(message, namespace, resolve) {
    namespace = ( namespace !== undefined) ? namespace : constants.ORANGECAST_NAMESPACE;
    var ws_url = 'ws://'+constants.WEBSOCKET_HOST+':' + constants.WEBSOCKET_PORT + constants.WEBSOCKET_PATH;
    var ws = new WebSocket(ws_url);
    ws.on('open', function() {
        var jsonMessage = getOCastMessage(message, namespace);
        ws.send(jsonMessage);
        ws.on('message', function (msg) {
            logger.log(TAG+ "<", msg);
            var message = JSON.parse(msg);
            if (message.type === "reply") {
                if (typeof resolve === "function") {
                    resolve(msg);
                }
                ws.close();
            }
        });
        logger.log(TAG+ ">", jsonMessage);
    });
};

exports.sendOCastMessage  = function(message, resolve) {
    this.sendMessage(message, constants.ORANGECAST_NAMESPACE, resolve);
};

exports.prepare  = function(url, mediaType, resolve) {
    this.sendOCastMessage({ name:"prepare",
        params: {url : url,
            mediaType: mediaType,
            title: "My Title",
            subtitle : "My SubTitle",
            logo: null,
            frequency: 1,
            transferMode: "buffered",
            autoplay: true
        },
        options: null
    }, resolve);
};

exports.pause  = function(resolve) {
    this.sendOCastMessage({ name:"pause", params: null, options: null}, resolve);
};

exports.resume  = function(resolve) {
    this.sendOCastMessage({ name:"resume", params: null, options: null}, resolve);
};

exports.seek  = function(position,resolve) {
    this.sendOCastMessage({ name:"seek", params: {position: position}, options: null}, resolve);
};

exports.track  = function(type, trackId, bOnOff,resolve) {
    this.sendOCastMessage({ name:"track", params: {type: type, trackId: trackId, enabled: JSON.parse(bOnOff)},
        options: null}, resolve);
};

exports.stop  = function(resolve) {
    this.sendOCastMessage({ name:"stop",params: null, options: null}, resolve);
};

exports.close  = function(resolve) {
    this.sendOCastMessage({ name:"close",params: null, options: null}, resolve);
};

exports.volume  = function(volume,resolve) {
    this.sendOCastMessage({ name:"volume",params: {level: parseFloat(volume)}, options: null}, resolve);
};

exports.getPlaybackStatus  = function(resolve) {
    this.sendOCastMessage({ name:"getPlaybackStatus",params: null, options: null}, resolve);
};

exports.getMetadata  = function(resolve) {
    this.sendOCastMessage({ name:"getMetadata",params: null, options: null}, resolve);
};

exports.mute  = function(mute, resolve) {
    this.sendOCastMessage({ name:"mute",params: {mute: JSON.parse(mute)}, options: null}, resolve);
};


exports.listen = function (resolve) {
    var ws_url;
    ws_url = 'ws://' + constants.WEBSOCKET_HOST + ':' + constants.WEBSOCKET_PORT + constants.WEBSOCKET_PATH;

    var ws = new WebSocket(ws_url);
    ws.on('open', function () {
        ws.on('message', function (msg_str) {
            logger.log(TAG+" >", msg_str.grey);
            if (typeof resolve === "function") {
                resolve(msg_str);
            }
        });
    });
    return ws;
};
