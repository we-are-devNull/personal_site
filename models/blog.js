const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title: String,
    author: String,
    image: String,
    body: String
    });

module.exports = mongoose.model('Blog', BlogSchema);