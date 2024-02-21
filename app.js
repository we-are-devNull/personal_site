const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const Blog = require('./models/blog');
const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/blogDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

app.engine('ejs', engine);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

app.get('/', (req, res) => {
  res.render('home.ejs');
}); 

app.get('/blog', async (req, res) => {
    const blogPosts = await Blog.find({});
    res.render('blogs/index', { blogPosts });

});

app.get('/blog/new', (req, res) => {
    res.render('blogs/new');
});

app.post('/blog', async (req, res) => {
    const blogPost = new Blog(req.body);
    await blogPost.save();
    res.redirect(`/blog/${blogPost._id}`);
});

app.get('/blog/:id', async (req, res) => {
    const blogPost = await Blog.findById(req.params.id);
    res.render('blogs/blog', { blogPost });

});

app.put('/blog/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = {
        title: req.body.title,
        body: req.body.body
    }
    const blogPost = await Blog.findByIdAndUpdate(id, updateData, { new: true });
    res.redirect(`/blog/${blogPost._id}`);
});

app.delete('/blog/:id', async (req, res) => {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    res.redirect('/blog');
});

app.get('/blog/:id/edit', async (req, res) => {
    const blogPost = await Blog.findById(req.params.id);
    res.render('blogs/edit', { blogPost });
});

