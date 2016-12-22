'use strict';

var mongoose = require('mongoose'),
	_ = require('lodash'),
	uuidV4 = require('uuid/v4'),
	async = require('async'),
	date = require('../common/services/date'),
    logger = require('../common/setup/logger'),
    config = require('../common/setup/config'),
    pubnub = require('../common/services/pubnub'),
    db = mongoose.createConnection(config.db),
    User = db.model('User'),
    Channel = db.model('Channel');


module.exports = {
	/*createChatAccount: function(req, res) {
		var user_id = req.query.user_id;
		createChatUser(user_id, function(err, user){
    		if(err) {
    			logger.logError('user-controller - getChatAccount - failed to create user');
    			logger.logError(err);
    			return res.status(404).send('UserNotFound');
    		} else {
    			return res.status(200).send(user);
    		}
    	});
	},*/

	getChatAccount: function(req, res) {
		var user_id = req.query.user_id;
        User.findOne({user_id: user_id}).populate('channels.channel').exec(function (err, user) {
            if (err) {
                logger.logError('userController - getChannels - error fetching user: ' + req.query.user_id);
                logger.logError(err);
                return res.status(200).end();
            }
            if (user) {
            	logger.logInfo('user account: ' + user);
        		for(var i = 0; i < user.channels.length; ++i) {
        			var channel = user.channels[i];
        			pubnub.grant(channel.channel.name, null, user.auth_key, true, true, function(err, status) {
        	    		if(err) {
        	    			logger.logError('user-controller - getChatAccount - failed in pubnub grant');
        	    			logger.logError(err);
        	    		} else {
        	    			logger.logInfo('pubnub grant success: ' + i);
        	    		}
        	    	});
        		}
            	pubnub.grant(null, user.channel_group, user.auth_key, true, true, function(err, status) {
    	    		if(err) {
    	    			logger.logError('user-controller - getChatAccount - failed in pubnub grant');
    	    			logger.logError(err);
    	    		} else {
    	    			logger.logInfo('pubnub grant success: ' + status);
    	    			logger.logInfo(status);
    	    		}

    	    		return res.status(200).send(user);
    	    	});

            } else {
            	createChatUser(user_id, function(err, user){
            		if(err) {
            			logger.logError('user-controller - getChatAccount - failed to create user');
            			logger.logError(err);
            			return res.status(404).send('UserNotFound');
            		} else {
            			pubnub.subscribe(null, user.channel_group, true, null);
            			return res.status(200).send(user);
            		}
            	});
            	//return res.status(404).send('UserNotFound');
            }
        });
	},

	getAllChannels: function(req, res) {
		var user_id = req.query.user_id;
        User.findOne({user_id: user_id}).populate('channels.channel').exec(function (err, user) {
            if (err) {
                logger.logError('userController - getChannels - error fetching user: ' + req.query.user_id);
                logger.logError(err);
                return res.status(200).end();
            }
            if (user) {

            	return res.status(200).send(user.channels);
            } else {
            	return res.status(404).send('UserNotFound');
            }
        });
	},

	getChannel: function(req, res) {

		var user_id = req.query.from_user_id;
		var user_ids = [req.query.to_user_id];
		user_ids.push(user_id);

		User.findOne({user_id: user_id}).populate('channels.channel').exec(function (err, user) {
            if (err) {
                logger.logError('userController - getChannels - error fetching user: ' + req.query.user_id);
                logger.logError(err);
                return res.status(500).end();
            }
            if (user) {
            	var channelFound = false;
            	var channel = undefined;
            	for(var i = 0; i < user.channels.length; ++i) {
            		channel = user.channels[i].channel;
            		if(_.isEmpty(_.xor(channel.members, user_ids))) {
            			channelFound = true;
            			break;
            		}
            	}
            	if(channelFound == true) {
            		logger.logInfo('channel exists' + channel);
            		return res.status(200).send(channel);
            	} else {
            		logger.logInfo('channel does not exist create a new one');
            		// create new channel
            		async.waterfall([
    		                function(callback) {
    		                	//logger.logInfo(user_ids);
    		                	createNewChannel(user_ids, function(err, channel) {
    		            			if(callback) {
    		            				logger.logInfo('new channel');
    		            				//logger.logInfo(channel);
    		            				callback(err, user_ids, channel);
    		            			}
    		            		});
    		                },
    		                function(user_ids, channel, callback) {
    		                	async.forEach(user_ids, function(item, cb) {
    		                		logger.logInfo(item);
    		                		User.findOne({user_id: item}).populate('channels.channel').exec(function (err, user) {
    		                            if (err) {
    		                                logger.logError('userController - getChannels - error fetching user: ' + req.query.user_id);
    		                                logger.logError(err);
    		                                cb(err);
    		                            }
    		                            if (user) {
    		                            	logger.logInfo('find the user');
    		                            	//logger.logInfo(user);
//    		                            	user.channels.push({channel: channel, last_access: channel.create_at});
//    		                            	pubnub.addChannels(user.channel_group, channel.name, function(err, status) {
//    		                            		if(err) {
//    		                            			cb(err);
//    		                            		} else {
//    		                            			logger.logInfo('add new channel into channel group');
//    		                            			user.save(function(err) {
//    		                            				if(err) {
//    		                            					cb(err);
//    		                            				} else {
//    		                            					cb(null, channel)
//    		                            				}
//    		                            			})
//    		                            		}
//    		                            	})

    		                            	// add channel into each user's channels and channel group
    		                            	// grant for each user on that new channel
    		                            	async.waterfall([
                            	                function(cb1) {
                            	                	user.channels.push({channel: channel, last_access: channel.create_at});
                            	                	user.save(function(err) {
                            	                		if(err) {
                            	                			cb1(err);
                            	                		} else {
                            	                			cb1(null, channel);
                            	                		}
                            	                	})
                            	                },
                            	                function(channel, cb1) {
                            	                	pubnub.addChannels(user.channel_group, channel.name, function(err, status) {
            		                            		if(err) {
            		                            			cb1(err);
            		                            		} else {
            		                            			logger.logInfo('add new channel into channel group');
            		                            			cb1(null, channel);
            		                            		}
            		                            	})
                            	                },
                            	                function(channel, cb1) {
                            	                	pubnub.grant(channel.name, null, user.auth_key, true, true, function(err, status) {
                            	        	    		if(err) {
                            	        	    			logger.logError('user-controller - getChatAccount - failed in pubnub grant');
                            	        	    			logger.logError(err);
                            	        	    			cb1(err);
                            	        	    		} else {
                            	        	    			logger.logInfo('pubnub grant success when create new channel');
                            	        	    			cb1(null, channel);
                            	        	    		}
                            	        	    	});
                            	                }
                        	                ], function(err, channel) {
    		                            		if(err) {
    		                            			logger.logError('user-controller - getChannel - failed to add new channel into channel group');
    		                            			logger.logError(err);
    		                            			cb(err);
    		                            		} else {
    		                            			cb(null, channel)
    		                            		}
    		                            	});

    		                            } else {
    		                            	cb('user not found', null);
    		                            }
    		                        });
    		                	}, function(err) {
    		                		if(err) {
    		                			logger.logError('user-controller - getChannel - failed to add new channel');
    		                			logger.logError(err);
    		                			callback(err, null);
    		                		} else {
    		                			callback(null, channel);
    		                		}
    		                	})
		                		//callback(null, channel);
    		                }
		                ], function(err, channel) {
        				if(err) {
        					return res.status(500).send('failed to get channel');
        				} else {
        					return res.status(200).send(channel);
        				}
            		})

            	}
            } else {
            	logger.logInfo('channel does not exist');
        		// create new channel
        		createNewChannel(user_ids, function(err, channel, channelName) {
        			if(err) {
        				logger.logError('userController - getChannel - error in creating new channel' + user_ids);
        				logger.logError(err);
        				return res.status(500).send(err);
        			} else {
        				logger.logInfo('new channel');
        				logger.logInfo(channel);
        				logger.logInfo(channelName);
        				return res.status(200).send(channel);
        			}
        		});
                //return res.status(404).send('UserNotFound');
            }
        });

	}
};

function createNewChannel(members, cb) {
	var channel = new Channel();
	channel.name = uuidV4();
	channel.members = members;
	channel.type = members.length;
	channel.create_at = (new Date()).toUTCString();
	channel.save(function(err) {
		if(cb) {
			cb(err, channel);
		}
	});
}

function createChatUser(userId, cb) {
	async.waterfall([
	    function(callback) {
	    	createUser(userId, function(err, userObj) {
	    		if(err) {
	    			logger.logError('user-controller - creatChatUser - failed in createUser');
	    			logger.logError(err);
	    		}
	    		callback(err, userObj);
	    	});
	    },
	    function(userObj, callback) {
	    	// add dummy channel into channel group
	    	logger.logInfo('channel group: ' + userObj.channel_group);
	    	pubnub.addChannels(userObj.channel_group, 'ch_dummy', function(err, res) {
	    		if(callback) {
	    			callback(err, userObj);
	    		}
	    	});
	    },
	    function(userObj, callback) {
	    	logger.logInfo(userObj);
	    	pubnub.grant(null, userObj.channel_group, userObj.auth_key, true, true, function(err, status) {
	    		if(callback) {
	    			logger.logInfo('grant status');
	    			logger.logInfo(status);
	    			//pubnub.subscribe(null, userObj.channel_group, true, null);
	    			callback(err, status);
	    		}
	    	});
	    }
	    /*function(userObj, callback) {
	    	//subscribe channel group
	    	logger.logInfo(userObj.channel_group);
	    	pubnub.subscribe(null, userObj.channel_group, true, function(err, status) {
	    		if(callback) {
	    			callback(err, userObj);
	    		}
	    	});
	    	callback(null, userObj);
	    }*/
    ], function (err, userObj) {
		if(cb) {
			cb(err, userObj);
		}
	});

}

function createUser(userId, callback) {
	var userObj = new User();
    userObj.user_id = userId;
    userObj.create_at = (new Date()).toUTCString();
    userObj.auth_key = uuidV4();
    userObj.channel_pub = userId;
    userObj.channel_group = uuidV4();
    userObj.save(function (err) {
        if (callback) {
            callback(err, userObj);
        }
    });
}

function validateCredentials(clientId, apiKey, cb) {
    if (clientId && apiKey) {
        if (!(/^[0-9a-fA-F]{24}$/.test(clientId))) {
            cb(null, false);
        } else {
            ApiClient.findOne({_id: clientId}, function (err, client) {
                if (err) {
                    logger.logError('clientController - validateCredentials - error fetching api client: ' + clientId);
                    logger.logError(err);
                    cb(err);
                } else {
                    cb(null, (client !== null && client.apiKey === apiKey && client.apiType === 'CRM'));
                }
            });
        }
    } else {
        cb(null, false);
    }
}
