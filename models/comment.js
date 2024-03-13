import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';


const CommentSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    blogPost: {
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    },
    body: String
    });

export default mongoose.model('Comment', CommentSchema);