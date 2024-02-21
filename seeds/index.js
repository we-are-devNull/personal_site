const mongoose = require('mongoose');   
const Blog = require('../models/blog');
const blogs = require('./blog_seed');

mongoose.connect('mongodb://localhost:27017/blogDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

const seedDB = async () => {
    await Blog.deleteMany({});
    for (let blog of blogs) {
        const newBlog = new Blog(blog);
        await newBlog.save();
    }
}

seedDB()