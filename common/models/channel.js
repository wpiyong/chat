'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Channel = new Schema({
    name: String,
    members: [String],
    displayName: String,
    type: Number,
    create_at: Date
}, {collection: 'Channels'});

mongoose.model('Channel', Channel);