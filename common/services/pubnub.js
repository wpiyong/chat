'use strict';

var config = require('../setup/config'),
    logger = require('../../common/setup/logger'),
    PubNub = require('pubnub');

var pubnub = new PubNub({
    	ssl: true,
    	publishKey: config.pubnubPubKey,
    	subscribeKey: config.pubnubSubKey,
    	secretKey: config.pubnubSecKey,
    	authKey: 'GLX_NODE_SERVER'
    	//logVerbosity: true
    });

module.exports = {

	grant: function(channel, group, authKeys, canRead, canWrite, callback) {
		if(channel && group) {
			pubnub.grant({
				channels: [channel],
				channelGroups: [group],
				authKeys: [authKeys],
				read: canRead,
				write: canWrite,
				ttl: 0
			}, function (status) {
				logger.logInfo('status');
				logger.logInfo(status);
				if(status.statusCode == 200) {
					if(callback) {
						callback(null, status);
					} else {
						logger.logInfo('pubnub - grant - grant success');
						logger.logInfo(status);
					}
				} else {
					if(callback) {
						callback(status, null);
					} else {
						logger.logError('pubnub - grant - grant failed');
						logger.logError(status);
					}
				}
			})
		} else if(channel) {
			pubnub.grant({
				channels: [channel],
				authKeys: [authKeys],
				read: canRead,
				write: canWrite,
				ttl: 0
			}, function (status) {
				logger.logInfo('status');
				logger.logInfo(status);
				if(status.statusCode == 200) {
					if(callback) {
						callback(null, status);
					} else {
						logger.logInfo('pubnub - grant - grant success');
						logger.logInfo(status);
					}
				} else {
					if(callback) {
						callback(status, null);
					} else {
						logger.logError('pubnub - grant - grant failed');
						logger.logError(status);
					}
				}
			})
		} else if(group){
			pubnub.grant({
				channelGroups: [group],
				authKeys: [authKeys],
				read: canRead,
				write: canWrite,
				ttl: 0
			}, function (status) {
				logger.logInfo('status');
				logger.logInfo(status);
				if(status.statusCode == 200) {
					if(callback) {
						callback(null, status);
					} else {
						logger.logInfo('pubnub - grant - grant success');
						logger.logInfo(status);
					}
				} else {
					if(callback) {
						callback(status, null);
					} else {
						logger.logError('pubnub - grant - grant failed');
						logger.logError(status);
					}
				}
			})
		}

	},
	subscribe: function(channel, channelGroup, presence, callback) {
		if(channel && channelGroup) {
			pubnub.subscribe({
				channels: [channel],
				channelGroup: [channelGroup],
				withPresence: presence
			}, function(status) {

			});
		} else if(channel) {
			pubnub.subscribe({
				channels: [channel],
				withPresence: presence
			}, function(status) {

			});
		} else {
			logger.logInfo('subscribe channel group: ' + channelGroup);
			pubnub.unsubscribe({
				channelGroups: [channelGroup]
			});
			pubnub.subscribe({
				//channels: [channelGroup],
				channelGroups: [channelGroup],
				withPresence: presence,
			});
		}
	},
	listChannels: function(channelGroup, callback) {
		pubnub.channelGroups.listChannels({
	        channelGroup: channelGroup
	    },
	    function (status, response) {
	    	if(status.statusCode == 200) {
	    		callback(null, response);
	    	} else {
	    		callback(status, response);
	    	}
	    });
	},
	addChannels: function(channelGroup, channel, callback) {
		pubnub.channelGroups.addChannels({
			channels: [channel],
	        channelGroup: channelGroup
		}, function(status, response) {
			logger.logInfo(status);
			logger.logInfo(response);
			if(status.statusCode == 200) {
	    		callback(null, status);
	    	} else {
	    		callback(status, null);
	    	}
		});
	}
};