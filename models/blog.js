import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    image: Buffer,
    body: String
    });

export default mongoose.model('Blog', BlogSchema);