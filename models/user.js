import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    accountType: {
        type: String,
        default: 'user'
    },
});

UserSchema.plugin(passportLocalMongoose);

export default mongoose.model('User', UserSchema);