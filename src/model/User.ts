import mongoose, {Schema , Document} from "mongoose";


export interface Message extends Document{
    content: string;
    createdAt: Date;
}

const messageSchema: Schema<Message> = new Schema<Message>({
    content: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
});

export interface User extends Document{
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiresAt: Date;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    messages: Message[];
}

const userSchema: Schema<User> = new Schema<User>({
    username: {type: String, required: [true, "Username is required"], unique: true},
    email: {type: String, required: [true, "Email is required"], unique: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"]},
    password: {type: String, required: [true, "Password is required"]},
    verifyCode: {type: String, required: [true, "Verify code is required"]},
    verifyCodeExpiresAt: {type: Date, required: [true, "Verify code expires at is required"]},
    isVerified: {type: Boolean, default: false},
    isAcceptingMessages: {type: Boolean, default: true},
    messages: {type: [messageSchema], default: []},
});

const User = mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User", userSchema);

export default User;