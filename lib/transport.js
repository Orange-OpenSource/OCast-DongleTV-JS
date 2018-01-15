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

var OrangeCastCommand = {
    REPLY : "reply",
    COMMAND: "command",
    EVENT: "event"
};

/**
 * Base Class OCast Message
 * @constructor
 */

function OrangeCastTransport() {
    this.dst = null;
    this.src = null;
    this.type = null;
    this.id = -1;
    this.message = null;
}

/**
 * setStatus
 * @param statusString
 */
OrangeCastTransport.prototype.setStatus = function(statusString) {
    this.status= statusString;
};

OrangeCastTransport.prototype.parse = function(jsonString) {
    var message = JSON.parse(jsonString);
    var self = this;

    // Validate Mandatory Properties
    Object.keys(this).forEach(function(key) {
        if (! message.hasOwnProperty(key)) {
            throw new EvalError("Key not found ", key);
        }
    });
    Object.keys(message).forEach(function(key) {
        self[key] = message[key];
    });
    if ((this.dst == null) || (this.src == null) ||
        (this.type !== OrangeCastCommand.COMMAND && this.type !== OrangeCastCommand.EVENT && this.type !== OrangeCastCommand.REPLY)) {
        throw new RangeError("Invalid Key Value:"+this["dst"]+","+this.type);
    }
};

OrangeCastTransport.prototype.toJSON = function() {
    return JSON.stringify({
        dst: this.dst,
        src: this.src,
        type: this.type,
        id: this.id,
        status: this.status,
        message: this.message
    });
};

exports.OrangeCastTransport = OrangeCastTransport;
exports.OrangeCastCommand = OrangeCastCommand;