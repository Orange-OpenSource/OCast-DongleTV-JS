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

var logger = require('tracer').console({level: global.debug?'log':'warn' });
var constants = require('./constants');
var serveStatic = require('serve-static');
require('colors');
const path = require('path');

var TAG = "WEBSERVER ".yellow;
var webserver = null;


exports.stop = function () {
    webserver.close();
};
exports.init = function () {
    var connect = require('connect');
    var localPath = path.dirname(path.dirname(path.dirname(__dirname)));
    var app = connect()
        .use('/local', serveStatic(localPath))
        .use('/', serveStatic(constants.WEBAPP_PATH+"/"));
    webserver = require('http').createServer(app)
        .listen(constants.WEBAPP_PORT)
        .on('listening', function () {
            logger.log(TAG + ' Started connect web server on http://localhost:' + constants.WEBAPP_PORT + '/ mapped with ' + constants.WEBAPP_PATH);
            logger.log(TAG + ' Started connect web server on http://localhost:' + constants.WEBAPP_PORT + '/local mapped with ' + localPath);
        });
};