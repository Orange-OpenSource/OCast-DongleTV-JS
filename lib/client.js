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
var fs = require('fs');

require('colors');
var TAG = "D2R - ".green;
var sequenceId = 1;

var options = {
    ca: "-----BEGIN PUBLIC KEY-----\nMIIGYDCCBEigAwIBAgIBFzANBgkqhkiG9w0BAQsFADBYMQswCQYDVQQGEwJGUjEPMA0GA1UECgwGT3JhbmdlMRcwFQYDVQQLDA4wMDAyIDM4MDEyOTg2NjEfMB0GA1UEAwwWT3JhbmdlIERldmljZXMgUm9vdCBDQTAeFw0xNDA5MDkwOTE5NTlaFw0zNzA5MDgwOTE5NTlaMEMxCzAJBgNVBAYTAkZSMQ8wDQYDVQQKDAZPcmFuZ2UxIzAhBgNVBAMMGk9yYW5nZSBEZXZpY2VzIEdlbmVyaWMzIENBMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAu8XE7x9wXg3kWRvGrg0qcj7OQA8skzRiMQ/nKaAETikQSa11Nu9MOaib4EsvFALXoqyb+EfahzLGYtAwyVdPWC+4ifi7aECZL87u05n920qG8AY2vmrDHMdMLcWbSWpPevEd2NCTzNK1jSekRmGXtNxNXerjtxol+H2Sb4CBCCKoROYrn3v2yBiYgcyvhvQc9MccGX0OCxg3YXCVcF2pQgzLv5I4jI0Tm94tN0GBPhWrBI2kw3HoWhG5NMk4D9IANjWi9NeDBk+kPJL6w3t3GOSwHuetyIhYstTjBeeasrKJjSlNT53xVjN474SE+dQQlwB5yDKB+WE/abrdEjx1P0sWNb+4KdFyw29F0gdJfzR+3dh8wJiNpGrCaaG8SIR9v+HHvnbAaa8p/VTpNDxlKKzK+DIpQVSQhXJoW9mu3RwYqlt9V40HUsz/aTAxBYU0zR5GJ3n+0oEvXycUnr0t20ye8E2bnJfCV4fgnBWTkKq0Xccy/hWnrWCRIy4m9tv+T/VN+NDSEQacYyyVaXqt8A19HZXdTrTu6lxKOyAQ7VyTOywsk9v4kSAktV/kxGauGV8ar5Mu7DGPxvWK/TSJbD/vw2g9I8HD6g+dD9k9MPwQ5+FpbyoXUxCxAjGA9Ocr4cspAldWwxi2MPkLInNFQAmGTpIye94wgqbNoMknRDECAwEAAaOCAUgwggFEMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMB0GA1UdDgQWBBTSTPwFyiCGPl7P/ljpucRswsHVZTBiBgNVHSMEWzBZgBQwszaeGhYjNBqco6HsrmrRdKBWPKE+gTxDTj1PcmFuZ2UgRGV2aWNlcyBSb290IENBLCBPVT0wMDAyIDM4MDEyOTg2NiwgTz1PcmFuZ2UsIEM9RlKCAQAwgYUGA1UdHwR+MHwwO6A5oDeGNWh0dHA6Ly9wa2ktY3JsLml0bi5mdGdyb3VwL2NybC9vcmFuZ2VkZXZpY2VzX3Jvb3QuY3JsMD2gO6A5hjdodHRwOi8vd3d3Lm9yYW5nZS5jb20vc2lyaXVzL3BraS9vcmFuZ2VkZXZpY2VzX3Jvb3QuY3JsMBYGA1UdIAQPMA0wCwYJKoF6ARAMBwEBMA0GCSqGSIb3DQEBCwUAA4ICAQBgKKfVwZbcNKAsDJGat0vRb9wC6Q+TmZ0jvr2Nz1Eg5twu4Q8cm7Ix5m9AUQMr+gKgYPcSfR84PBBBwZ+THXVtgI+vnHVfAZFbyFi1w2r7WZdlVCGL/zpmghC0QPCD4oYxLckIhs873jdsbUU97qTGnmHOHTsHRVm8ApuS8rj/aZSYnnZkWnusfUKiP0PMTTy6kSFqb2E5TkM6aW8QzNwBwLaDHqhlduj7ftM2z+EmqTpCVMRj6Lo152i4vXLaWfUXHaV9jf6GyKnp1Pt6awpV06eDhT1jNehfwusYRb22nKduLcnej5oWC7/LGI1pjYEE/UPOFtuQfLyW1iHCIyDKAELkkNAjTVsUXeyTmJeNJTTSfhfPR1BgPJvbTWj6Ww4Alm7lIWpTVgr0k/xLlhaA5Fy80RfWDvmWbK+3bkj/1kQOrvh9HkTTE2mln0EPL8oxI6rVe/Xyl3VRI/GdRqHZIW7IyS8bBvLG6i9QU9hL7HsjcHPdmQcKUfjg3bf04XMEPOGJUwx0e7TpJQMrl3ktmKst00MAD4LcKEQ1auyiz3gh1vd6A8YMd0rSKa+8M6q3C/kWOUYffcxXacTYOKWa9lC+PsyBkx1XGWS/xjJUgBNlAVpGH5oIKj9mB8tJ5Xzei1xZ3v7Kwt7BGWLIgmKmEm8OHZUcK8xUH4ptJc1lNQ==-----END CERTIFICATE----------BEGIN CERTIFICATE-----MIIFpjCCA46gAwIBAgIBADANBgkqhkiG9w0BAQsFADBYMQswCQYDVQQGEwJGUjEPMA0GA1UECgwGT3JhbmdlMRcwFQYDVQQLDA4wMDAyIDM4MDEyOTg2NjEfMB0GA1UEAwwWT3JhbmdlIERldmljZXMgUm9vdCBDQTAeFw0xMTA1MTAxMDI0MTRaFw00MTA1MTAxMDI0MTRaMFgxCzAJBgNVBAYTAkZSMQ8wDQYDVQQKDAZPcmFuZ2UxFzAVBgNVBAsMDjAwMDIgMzgwMTI5ODY2MR8wHQYDVQQDDBZPcmFuZ2UgRGV2aWNlcyBSb290IENBMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAsb74igenbrPvy3E+L/8GCuqwjPyhIaZN86bmKLDBshbIWMT4yw0Itc9g5g+yNg450IhI5O5etp0eDQH5qz3CdZLCBgApE8ZajYk2TOQW4sDdFyfxM11GE769eNC3rIL7GjPjF2yVP03bJ9b7fhI9FGoqNI6pK8zBwSiyEWJL7+3a/H6uWbmr4EHw6n6sSqk6VUa5+MtczBucE0LgKC4K8Csjw/tmC0HRSusiTLWtpE8Pc44rU+qjIiixyUU3CMQxG8nfFYVBPNHTMCkxXLMQis/EfusrCSQJJf0wSMfHSZ8yF38FvuBowt/ZBeI05lpbQm4Ejgd7Ay49z+U8LkCAI5LCEqxbhIE79m6nv41tp8/ECWWSBFcEotdXDXbX4TtlsoDNO/D7eH/wOtMs3oheLzVw045JAx/s2OWSq9H4niMg8RrZu5YqhK9A8XVUcEZ2yraTJ73kvVAkcZKJtRell3HEqhfsjvV0u3qH5sjktAq8HRPpTlqE5e4w7LaHDDGO3oUFj1+WiIdHoktfK5NEhBuOLMCJWiWHpKcQQJ+bg+KSATKuq3kHbS1Dmd5ODAZAo8JhTu3K9tgJwpgOQZwdXhn9fZav1WDvHHsC4nTCY3osEofJyqYHQj+kERAOSHJAdTf9lKE3gsHUvtropVVZ3HprukvnDv90ZCwd9Zk1+2MCAwEAAaN7MHkwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYEFDCzNp4aFiM0GpyjoeyuatF0oFY8MB8GA1UdIwQYMBaAFDCzNp4aFiM0GpyjoeyuatF0oFY8MBYGA1UdIAQPMA0wCwYJKoF6ARAMBwEBMA0GCSqGSIb3DQEBCwUAA4ICAQAA5Lx1Lboy6b7XLfG1Xwh7O5Fnty8MiTzofZOJwowv4xte9eNs7n4qByD2QgQQaM0VSC53345tSLLNEZFMt55aO9lKio0gRoSis0t/2M3JaRakNMKxCj1qugfYcH+poEIdt7Qqp/bysJ1b60QffFx0p4JqDIPiKSYbA6u469gDz7tgJOfH3qQ4qrpQMRzw/Gs88XjNdc4vKhmcKCQnmRKt59wuUm2RJ94rPm+k9efGiVSAO5SGSR27rpUVBhbqKj5hILl3nx6JyYksfHtgk124+yT18bZ45bvRvsKAlHWrl2ylc2CiNSHYbUc9jMC5b/muBzZV5WH7OLYB4d8tSZVkPk+J0FlUndfIa+i5hkgxEPGuOFNvT1Q6ZJMEBjpWROw8fdB4hLgsgH4s3HV53gRlpr0E1R0HLr4ffdo79JtC0ylzJPneU3STyLM1Xm1x0Z9yPdf8KBwsrBtZBQR+SjD1wZikRCKNrl2Xdss1TVkMNHGD1S7RMgFNtETrNPcaAWxhrWu+l440qEQ16Mkw24RC+2ilJorOqwwDhogzqaagMLTLfVFr0HDX/fx4D/HVFbovi5EEQZ7jFrJNeqyoQX32o9I5NnE4W7SDTXbMfkL444xX9OtrwAk/bOu0bUnC21Rwmk/cu93QE57CaKlneGBGyKmxhimTAl/xiXt6IiNOrw==\n-----END PUBLIC KEY---",
    requestCert: true,
    rejectUnauthorized: false,
};


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
    var ws_url = 'wss://'+constants.WEBSOCKET_HOST+':' + constants.WEBSOCKET_PORT + constants.WEBSOCKET_PATH;
    console.log(ws_url);
    var ws = new WebSocket(ws_url, options);
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
    ws.on('error', function(error) {
        console.error(error);
    })
};

exports.sendOCastMessage  = function(message, resolve) {
    this.sendMessage(message, constants.ORANGECAST_NAMESPACE, resolve);
};

exports.prepare  = function(url, mediaType, logo, options, resolve) {
    this.sendOCastMessage({ name:"prepare",
        params: {url : url,
            mediaType: mediaType,
            title: "My Title",
            subtitle : "My SubTitle",
            logo: logo,
            frequency: 1,
            transferMode: "buffered",
            autoplay: true
        },
        options: options
    }, resolve);
};



//{\"namespace\":\"com.orange.cast.media\",\"sender_id\":\"MC-C02LJ1EXFFT3\",\"stream\":{\"channelId\":4,\"name\":\"France 2\",\"programs\":[{\"programId\":170342772,\"title\":\"Ça commence aujourd'hui\",\"title2\":\"\",\"cover\":{\"url\":\"http://proxymedia.woopic.com/340/p/43_COL_771531.jpg\"},\"diffusionDate\":1516712100000,\"duration\":70,\"genre\":\"Mag. Société\",\"csaLevel\":1,\"prime\":null,\"series\":{\"seriesName\":\"\",\"seasonName\":\"\",\"seasonEpisodesCount\":0,\"seasonEpisodeNumber\":0},\"synopsis\":\"Faustine Bollaert accueille des hommes et des femmes qui évoquent des événements marquants de leur existence, pour permettre à d'autres d'avancer dans leur parcours : un rendez-vous positif et optimiste.\",\"productionCountries\":[],\"productionDate\":\"\",\"additionnalData\":{\"languages\":[{\"language\":\"fre\",\"mixType\":\"MONO\"}],\"format\":null,\"subtitle\":[],\"longSummary\":\"Faustine Bollaert accueille des hommes et des femmes qui évoquent des événements marquants de leur existence, pour permettre à d'autres d'avancer dans leur parcours : un rendez-vous positif et optimiste.\",\"colour\":true},\"contributors\":{\"authors\":[],\"directors\":[],\"actors\":[],\"producers\":[],\"mesContributors\":[],\"choContributors\":[],\"preContributors\":[{\"firstName\":\"Faustine\",\"lastName\":\"Bollaert\",\"character\":null}]},\"sousgenre\":null},{\"programId\":170342773,\"title\":\"Je t'aime, etc.\",\"title2\":\"\",\"cover\":{\"url\":\"http://proxymedia.woopic.com/340/p/43_COL_776423.jpg\"},\"diffusionDate\":1516716300000,\"duration\":70,\"genre\":\"Mag. Société\",\"csaLevel\":1,\"prime\":null,\"series\":{\"seriesName\":\"\",\"seasonName\":\"\",\"seasonEpisodesCount\":0,\"seasonEpisodeNumber\":0},\"synopsis\":\"Tous les après-midis, Daphné Bürki parle d'amour, entourée de sa famille de journalistes, experts et chroniqueurs : de l'amour des autres à l'estime de soi en passant par la tendresse, le couple, la famille, l'amitié, la sexualité, la planète, ou encore les animaux. Dossiers et rubriques rythment...\",\"productionCountries\":[],\"productionDate\":\"\",\"additionnalData\":{\"languages\":[{\"language\":\"fre\",\"mixType\":\"MONO\"}],\"format\":null,\"subtitle\":[],\"longSummary\":\"Tous les après-midis, Daphné Bürki parle d'amour, entourée de sa famille de journalistes, experts et chroniqueurs : de l'amour des autres à l'estime de soi en passant par la tendresse, le couple, la famille, l'amitié, la sexualité, la planète, ou encore les animaux. Dossiers et rubriques rythment ce rendez-vous à la fois divertissant et instructif.\",\"colour\":true},\"contributors\":{\"authors\":[],\"directors\":[],\"actors\":[],\"producers\":[],\"mesContributors\":[],\"choContributors\":[],\"preContributors\":[{\"firstName\":\"Daphné\",\"lastName\":\"Bürki\",\"character\":null}]},\"sousgenre\":null},{\"programId\":170342774,\"title\":\"Affaire conclue, tout le monde a quelque chose à vendre\",\"title2\":\"\",\"cover\":{\"url\":\"http://proxymedia.woopic.com/340/p/43_COL_770509.jpg\"},\"diffusionDate\":1516720500000,\"duration\":55,\"genre\":\"Mag. Société\",\"csaLevel\":1,\"prime\":null,\"series\":{\"seriesName\":\"\",\"seasonName\":\"\",\"seasonEpisodesCount\":0,\"seasonEpisodeNumber\":0},\"synopsis\":\"Parce que les maisons sont remplies de babioles insolites qui ne demandent qu'à trouver acquéreurs, Sophie Davant accompagne les propriétaires d'objets tout au long des étapes susceptibles de les mener à la vente.\",\"productionCountries\":[],\"productionDate\":\"\",\"additionnalData\":{\"languages\":[{\"language\":\"fre\",\"mixType\":\"MONO\"}],\"format\":null,\"subtitle\":[],\"longSummary\":\"Parce que les maisons sont remplies de babioles insolites qui ne demandent qu'à trouver acquéreurs, Sophie Davant accompagne les propriétaires d'objets tout au long des étapes susceptibles de les mener à la vente.\",\"colour\":true},\"contributors\":{\"authors\":[],\"directors\":[],\"actors\":[],\"producers\":[],\"mesContributors\":[],\"choContributors\":[],\"preContributors\":[{\"firstName\":\"Sophie\",\"lastName\":\"Davant\",\"character\":null}]},\"sousgenre\":null},{\"programId\":170342775,\"title\":\"Affaire conclue, tout le monde a quelque chose à vendre\",\"title2\":\"\",\"cover\":{\"url\":\"http://proxymedia.woopic.com/340/p/43_COL_770510.jpg\"},\"diffusionDate\":1516723800000,\"duration\":50,\"genre\":\"Mag. Société\",\"csaLevel\":1,\"prime\":null,\"series\":{\"seriesName\":\"\",\"seasonName\":\"\",\"seasonEpisodesCount\":0,\"seasonEpisodeNumber\":0},\"synopsis\":\"Parce que les maisons sont remplies de babioles insolites qui ne demandent qu'à trouver acquéreurs, Sophie Davant accompagne les propriétaires d'objets tout au long des étapes susceptibles de les mener à la vente.\",\"productionCountries\":[],\"productionDate\":\"\",\"additionnalData\":{\"languages\":[{\"language\":\"fre\",\"mixType\":\"MONO\"}],\"format\":null,\"subtitle\":[],\"longSummary\":\"Parce que les maisons sont remplies de babioles insolites qui ne demandent qu'à trouver acquéreurs, Sophie Davant accompagne les propriétaires d'objets tout au long des étapes susceptibles de les mener à la vente.\",\"colour\":true},\"contributors\":{\"authors\":[],\"directors\":[],\"actors\":[],\"producers\":[],\"mesContributors\":[],\"choContributors\":[],\"preContributors\":[{\"firstName\":\"Sophie\",\"lastName\":\"Davant\",\"character\":null}]},\"sousgenre\":null}],\"drmized\":false,\"isNew\":false,\"logo\":\"http://rp-live.orange.fr/otv_logos/logo_webtv_livetv_france2.png\",\"logoSquare\":\"http://rp-live.orange.fr/otv_logos/logo_webtv_square_livetv_france2.png\",\"channelOrder\":2,\"isNomade\":true,\"isNomadismLimited\":false,\"slogan\":\"\",\"preventFullScreen\":false,\"mediumFlowMin\":0,\"needPCRegistration\":false,\"needRegistration\":false,\"targetUrl\":\"\",\"isPremium\":false,\"premiumUrl\":{\"home\":\"\",\"channel\":\"\"},\"licenceType\":\"BT_91e142ce8907b70e90980a9ab4b6b9fc\",\"packages\":[\"PA_BQ_ACCESTVPREMIUM_M\",\"PA_BQ_ACCESTV_M\",\"PA_BQ_BASICQUAD_I\",\"PA_BQ_BASIC_I\",\"PA_BQ_BASIC_M\",\"PA_BQ_M6_M\",\"PA_BQ_MUSIQUE_M\",\"PA_BQ_PASSACCESTVPREMIUM_M\",\"PA_BQ_PAYG_M\",\"PA_BQ_RE_BASIC_I\",\"PA_BQ_RE_INFO_M\",\"PA_BQ_RE_MUSIQUE_M\",\"PA_BQ_RE_SPORT_M\",\"PA_BQ_RE_TVMAX1H_M\",\"PA_BQ_RE_TVMAX_M\",\"PA_BQ_SPORT_M\",\"PA_BQ_TVDIGITALE_I\",\"PI_WHITELIST\"],\"timeShift\":0,\"epgId\":\"4\",\"tvGuideURL\":\"\",\"useUrlSigning\":true,\"vostfull\":false,\"vostquart\":false,\"index\":1,\"isCatchup\":false},\"data\":{\"type\":\"LOAD\",\"src\":\"https://ssl-sso.orange.fr/lctv/live/live-webapp/LCTV/user/live/channel/4/url.json\",\"custom_data\":{\"cookie_auth\":\"3231333044454430434233353835384642333841443835324545334131423032563d5632202020203932303830313065303030303031323030313830383030303030383030303030303030303030383041653942564773445347303570416138774b614a7370613475724d41665644574e4e444d6151644a6f4d615365454e6c774e48427872416f526d4262472b424d58533462436f68746b34492b75683032546c71596c4338456f764551766b3665793665512f6a6d4a6b756e7968416a447a44666c59324238563533796b456a6c5a6b4e307836545a3633556e76412b51704642355334526d32364e4774772f7561706c39544b56542b78665332465462533556617247517a5379593266446a754d6d59626f39626132774c4a6e4736307a72714d6f4937525568344779544b5056656f55306b794651706752344b4b67434c41784a2f7652597769633142616652704a3230536e4873444277527164537075594a672b392b516b4c6248686f68302f6b4357456f57672f644f635249576c6a516a74444556683748527265464c7253376652563750454d313741647a4e4b5973637452565154786e38797a75486d5a666e374c583678306479735951575a6e6969564d754438753279387742697c4d434f3d4f46527c563d56347c585f5741535355505f415554485f4d4554483d307c585f5741535355505f53594e435f434f4f4b49453d3237323734377c585f5741535355505f56414c49445f444154453d32303138303132333134313435377c616f6c3d31307c7761643d32303138303132333133353935377c7763743d32446e497a655954564c657931494f566f6455716e527472737833545253474d68\"},\"autoplay\":true,\"content_info\":{\"content_id\":\"https://ssl-sso.orange.fr/lctv/live/live-webapp/LCTV/user/live/channel/4/url.json\",\"stream_type\":2,\"mime_type\":\"text/xml\",\"duration\":0,\"custom_data\":{},\"meta_data\":{\"title\":\"France 2\",\"subtitle\":\"Ça commence aujourd'hui\",\"images\":[{\"url\":\"http://proxymedia.woopic.com/340/p/43_COL_771531.jpg\"}]}},\"cmd_id\":1506429795450}}", sender_id: "MC-C02LJ1EXFFT3" }

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
    this.sendOCastMessage({ name:"volume",params: {volume: parseFloat(volume)}, options: null}, resolve);
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
    ws_url = 'wss://' + constants.WEBSOCKET_HOST + ':' + constants.WEBSOCKET_PORT + constants.WEBSOCKET_PATH;

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
