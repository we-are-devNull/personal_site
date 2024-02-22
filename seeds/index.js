const mongoose = require('mongoose');   
const Blog = require('../models/blog');
const blogs = require('./blog_seed');
const fs = require('fs').promises;
const path = require('path');

mongoose.connect('mongodb://localhost:27017/blogDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

const seedDB = async () => {
  await Blog.deleteMany({});
  for (let blog of blogs) {
      if (blog.image) {
          const imagePath = path.join(__dirname, blog.image); // Correctly resolve the path to the image
          try {
              const imageData = await fs.readFile(imagePath);
              blog.image = imageData; // Replace the file path with the actual binary data
          } catch (error) {
              console.error(`Error reading image file ${blog.image}:`, error);
              continue; // Skip this entry or handle the error appropriately
          }
      }
      const newBlog = new Blog(blog);
      await newBlog.save();
  }
};

seedDB().then(() => {
  console.log('Seeding completed!');
  mongoose.connection.close();
});