'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var User = new Schema({
	user_id: String,
	channel_pub: String,
	channel_group: String,
	auth_key: String,
	create_at: Date,
	channels: [{
		channel: {
			type: mongoose.Schema.Types.ObjectId,
            ref: 'Channel'
		},
		last_access: Date
	}],
}, {collection: 'Users'});

mongoose.model('User', User);
