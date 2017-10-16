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

const LOCALHOST = '127.0.0.1';
const path = require('path');

const WEBSOCKER_HOST = process.env.RECEIVER || LOCALHOST;
const WEBSOCKET_PORT = 4434;
const WEBSOCKET_PATH = "/ocast";
const ORANGECAST_NAMESPACE = "org.ocast.media";

const WEBSERVER_PORT = 8008;
const WEBSERVER_PATH = "/apps";
const WEBAPP_PORT = 8090;
console.log(__dirname);
let CURRENT_DIR = path.dirname(path.dirname(path.dirname(__dirname)));
try {
    CURRENT_DIR = path.dirname(path.dirname(require.resolve("ocast-sdk")))
}
catch (e) {}

console.log(CURRENT_DIR);

const WEBAPP_PATH = path.dirname(path.dirname(CURRENT_DIR));

const DATASET  = {
    "EXAMPLE_ES6": "http://localhost:"+WEBAPP_PORT+"/examples/es6/src/index.html",
    "Orange-DefaultReceiver-DEV": "http://localhost:"+WEBAPP_PORT+"/examples/es6/src/index.html",
    "LOCAL": "http://localhost:"+WEBAPP_PORT+"/local/src/index.html"
};

exports.DATASET = DATASET;
exports.WEBSOCKET_PORT = WEBSOCKET_PORT;
exports.WEBSERVER_PORT = WEBSERVER_PORT;
exports.WEBSOCKET_PATH = WEBSOCKET_PATH;
exports.WEBSOCKET_HOST = WEBSOCKER_HOST;
exports.WEBSERVER_PATH = WEBSERVER_PATH;
exports.WEBAPP_PORT = WEBAPP_PORT;
exports.WEBAPP_PATH = WEBAPP_PATH;
exports.DEFAULT_APPLICATION = "Orange-DefaultReceiver-DEV";
exports.ORANGECAST_NAMESPACE = ORANGECAST_NAMESPACE;

