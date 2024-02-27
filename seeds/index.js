import mongoose from 'mongoose';
import Blog from '../models/blog.js';
import blogs from './blog_seed.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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