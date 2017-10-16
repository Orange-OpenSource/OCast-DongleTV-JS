#! /usr/bin/env node

'use strict';

if ((require.main === module)) {
    global.debug = true;
}

var broker = require('./lib/broker');
var dialserver = require('./lib/dialserver');
var client = require('./lib/client');
var webserver = require('./lib/webserver');
var constants = require('./lib/constants');
var params = require('commander');
var logger = require('tracer').console({level: global.debug?'log':'warn' });
require('colors');

var TAG = "D2R ".green;
var pjson = require('./package.json');

params.command('version')
    .description('Display version')
    .action(function () {
        console.log("d2r_version : "+pjson.version);
    });
params.command('send <message>')
    .description('Send message')
    .option('-n, --namespace <namespace>', 'Override default namespace')
    .action(function (cmd, options) {
        client.sendMessage(JSON.parse(cmd) , options.namespace)
    });

params.command('prepare <url> <type>')
    .description('Prepare a new media with type video|image|sound')
    .action(function (url, type) {
        client.prepare(url, type);
    });
params.command('volume <position>')
    .description('Change Volume')
    .action(function (volume) {
        client.volume(volume);
    });
params.command('pause')
    .description('Pause media ')
    .action(function () {
        client.pause();
    });
params.command('mute <bOnOff>')
    .description('Mute media ')
    .action(function (bOnOff) {
        client.mute(bOnOff);
    });
params.command('stop')
    .description('Stop media')
    .action(function () {
        client.stop();
    });
params.command('close')
    .description('Close media')
    .action(function () {
        client.close();
    });
params.command('resume')
    .description('Resume media')
    .action(function () {
        client.resume();
    });
params.command('seek position')
    .description('Seek  position')
    .action(function (position) {
        client.seek(position);
    });
params.command('track <type> <trackId> <bOnOff>')
    .description('Update track of type audio|text|video with id true|false')
    .action(function (type, trackId, bOnOff) {
        client.track(type, trackId, bOnOff);
    });
params.command('getPlaybackStatus')
    .description('Get Playback Status')
    .action(function () {
        client.getPlaybackStatus();
    });
params.command('getMetadata')
    .description('Get Metadata')
    .action(function () {
        client.getMetadata();
    });
params.command('search')
    .description('Search Dial TV Receivers')
    .action(function () {
        dialserver.search();
    });
params.command('listen')
    .description('Listen command Websocket for debugging')
    .action(function () {
        client.listen();
    });
params.command('listApp')
    .description('List Dataset')
    .action(function () {
        var result = dialserver.listApp();
        console.log(result);
    });
params.command('test <sample_name>')
    .description('Load a test sample ( smooth|mp4|mp3|jpg|gif  )')
    .action(function (sample) {
        var type = null;
        var url = null;
        switch (sample) {
            case "smooth": url="http://sample.vodobox.com/planete_interdite/planete_interdite_alternate.m3u8"; type="video"; break;
            case "mp4": url="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4";type="video"; break;
            case "jpg": url="http://placekitten.com/g/800/600";type="image"; break;
            case "gif": url="http://gifs.gifbin.com/092010/1284373741_goalie-penalty-kick-fail.gif";type="image"; break;
            case "mp3": url="http://datashat.net/music_for_programming_15-dan_adeyemi.mp3";type="audio"; break;
            default: logger.error("Sample "+sample+" not found !"); exit();
        }
        client.prepare(url,type);
    });
params.command('start [env]')
    .description('Start service [broker|dialserver|webserver|all]')
    .action(function (cmd) {
        switch (cmd) {
            case 'broker':
                broker.init();
                break;
            case "dialserver":
                dialserver.init(null);
                break;
            case "webserver":
                webserver.init(null);
                break;
            case "all":
                dialserver.init(null);
                broker.init();
                webserver.init();
                break;
            default:
                logger.warn(TAG+ "Unknown service <<<"+cmd+">>>");
        }
    });
params.command('startApp [Application_ID]')
    .description("Start Default Receiver")
    .action(function(appId) {
        dialserver.startApp(appId?appId : constants.DEFAULT_APPLICATION);
    });

params.command('stopApp [Application_ID]')
    .description("Stop Default Receiver")
    .action(function(appId) {
        dialserver.stopApp(appId?appId : constants.DEFAULT_APPLICATION);
    });
params.parse(process.argv);

exports.broker = broker;
exports.dialserver = dialserver;
exports.webserver = webserver;
exports.client = client;
