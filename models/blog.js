import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title: String,
    author: String,
    image: Buffer,
    body: String
    });

export default mongoose.model('Blog', BlogSchema);