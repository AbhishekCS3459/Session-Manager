import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  preferences: {
    theme: string;
    notifications: boolean;
    language: string;
  };
  sessionData: {
    pagesVisited: string[];
    startTime: Date;
  };
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    theme: { type: String, default: "light" },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: "en" },
  },
  sessionData: {
    pagesVisited: { type: [String], default: [] },
    startTime: { type: Date },
  },
});

export default mongoose.model<IUser>("User", UserSchema);
