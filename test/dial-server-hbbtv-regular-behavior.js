/*******************************************************************************
 * 
 * Copyright (c) 2015 Louay Bassbouss, Fraunhofer FOKUS, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or (at your option) any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>. 
 * 
 * AUTHORS: Louay Bassbouss (louay.bassbouss@fokus.fraunhofer.de)
 *
 ******************************************************************************/
var dial = require("peer-dial");
var http = require('http');
var express = require('express');
var opn = require("opn");
var app = express();
var server = http.createServer(app);

var PORT = 3001;
var MANUFACTURER = "Fraunhofer FOKUS";
var MODEL_NAME = "DIAL Demo Server";

var apps = {
	"YouTube": {
		name: "YouTube",
		state: "stopped",
		allowStop: true,
		pid: null,
        /*
        additionalData: {
            "ex:key1":"value1",
            "ex:key2":"value2"
        },
        namespaces: {
           "ex": "urn:example:org:2014"
        }*/
        launch: function (launchData) {
            opn("http://www.youtube.com/tv?"+launchData);
        }
	},
	"HbbTV": {
		name: "HbbTV",
		state: "stopped",
		allowStop: true,
		pid: null,
        
        additionalData: {
            "ex:X_HbbTV_App2AppURL":"ws://192.168.1.11:992/hbbtv/84fa-9fd3-33a1-2481-9098-3ccd-de26-a223/",
            "ex:X_HbbTV_InterDevSyncURL":"ws://192.168.1.11:991/css-cii",
	    "ex:X_HbbTV_UserAgent":"Mozilla/5.0 (Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36 OPR/22.0.1481.0 OMI/4.2.12.34.ALSAN3.16 HbbTV/1.4.1 (; Sonic; VX600WDR; 1.14.0; ; dd5528b6-d0a9-40a8-acdb-21fa2eabeb2e; )"
        },
        namespaces: {
           "ex": "urn:hbbtv:HbbTVCompanionScreen:2014"
        },
        launch: function (launchData) {
            opn("http://www.hbbtv.org/info?"+launchData);
        }
	}

};
var dialServer = new dial.Server({
	expressApp: app,
	port: PORT,
  prefix: "/dial",
	corsAllowOrigins: "*",
	manufacturer: MANUFACTURER,
	modelName: MODEL_NAME,
	/*extraHeaders: {
		"X-MY_HEADER": "My Value"
	},*/
	delegate: {
		getApp: function(appName){
			var app = apps[appName];
			return app;
		},
		launchApp: function(appName,lauchData,callback){
			console.log("Got request to launch", appName," with launch data: ", lauchData);
			var app = apps[appName];
			var pid = null;
			if (app) {
				app.pid = "run";
				app.state = "starting";
                app.launch(lauchData);
                app.state = "running";
			}
			callback(app.pid);
		},
		stopApp: function(appName,pid,callback){
            console.log("Got request to stop", appName," with pid: ", pid);
			var app = apps[appName];
			if (app && app.pid == pid) {
				app.pid = null;
				app.state = "stopped";
				callback(true);
			} 
			else {
				callback(false);
			}
		}
	}
});

server.listen(PORT,function(){
	dialServer.start();
	// dialServer.stop();
	console.log("DIAL Server is running on PORT "+PORT);
});
