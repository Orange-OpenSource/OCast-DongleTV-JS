!! DEPERCATED
Please use:
- DongleTV simulator https://github.com/Orange-OpenSource/ocast-dongletv-simulator to simulate dongle TV
- OCast JS controller https://github.com/Orange-OpenSource/ocast-js-controller to test comuunication with a dongle TV

# Ocast-DongleTV-JS
[![npm version](https://badge.fury.io/js/ocast-dongletv.svg)](http://badge.fury.io/js/ocast-dongletv)
[![node](https://img.shields.io/node/v/ocast-dongletv-iconify.svg)](https://www.npmjs.com/package/ocast-dongletv-iconify)
[![Build Status](https://travis-ci.org/Orange-OpenSource/OCast-DongleTV-JS.svg?branch=master)](https://travis-ci.org/Orange-OpenSource/OCast-DongleTV-JS)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

> Dongle TV Simulator

## Usages
> * develop and test your web application locally
> * develop and test your mobile application with a sample web application

***

## Prerequisites

install node package manager for Windows/Linux/MacOs

1. Download the Windows installer from the Nodes.js® web site.
https://nodejs.org/download/

2. Run the installer (the .msi or .pkg file you downloaded in the previous step.)

3. Follow the prompts in the installer

4. Test Node. To see if Node is installed, open the Windows Command Prompt and type node -v

***

### License

All code in this repository is covered by the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0). See LICENSE file for copyright details.

## Installation

    $ npm install ocast-dongletv -g

Check installation:

    $ d2r --help
    $ d2r version

***

## local usage
> use only Chrome or Safari (pb with the lastest version of FireFox )
start the websocket server via:

    $ export RECEIVER=
    $ d2r start

> launch command @see ##commands


    $ d2r load mp4

***

## remote usage (with stick)
> start the stick and find ip adress by the mac adress in wireless network


    $ arp -a

> launch the App


    $ export RECEIVER=STICK_IP
    $ d2r startApp NAME_OF_MY_APP

> example 'la clé TV' or 'VODe' dev app


    $ d2r startApp Orange-OrangeTVReceiverProd-SDK2016

> launch command @see ##commands


    $ d2r load mp4


***

## Commands and examples

### Help is your friend


    $ d2r --help
    $ d2r load --help
    $ d2r play --help

### Start the server for localhost

    $ d2r start all


### Load a media

> This is what you usually want to do, load and play a media via the receiver webapp.


    $ d2r load --help


#### Examples

##### Load a video and autoplay


    $ d2r load http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_2mb.mp4 video

##### Load a video and:
* autoplay
* give a title
* gender
* logo
* title for next movie
* beginning of program
* end of program
* Beginning of next program
* title of next program
* Forbidden to youth < 16yo
* display product placement logo
* display audio hearing logo
* display audio description logo

```sh
$ d2r load http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_2mb.mp4 video/ -t "New Title"
```

##### Load a music and autoplay
```sh
$ d2r load http://www.sample-videos.com/audio/mp3/crowd-cheering.mp3 audio
```

##### Load an image

```sh
$ d2r load http://www.sample-videos.com/img/Sample-jpg-image-100kb.jpg image
```

### Play
```sh
$ d2r play
```

### Pause/Stop
```sh
$ d2r stop
```

With a position
```sh
$ d2r play -p 40
```

### Return to home page
```sh
$ d2r close
```

### Volume control
```sh
$ d2r mute
```
```sh
$ d2r unmute
```
```sh
$ d2r volume 0.5
```

### Request status
```sh
$ d2r info
```

## Documentation

* Implementation is mainly in lib/*.js
* CLI interface is in cli.js
