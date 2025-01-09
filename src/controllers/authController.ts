import { Request, Response } from "express";
import User, { IUser } from "../model/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: IUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
const login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
  
      // Check if the user exists
      const user: IUser | null = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ message: "Invalid credentials: user not found" });
        return;
      }
  
      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({ message: "Invalid credentials: password incorrect" });
        return;
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });
  
      // Sync session data
      req.session.user = { name: user.username, email: user.email }; // Save user details in session
      req.session.startTime = user.sessionData?.startTime || new Date().toISOString(); // Sync or initialize start time
      req.session.pagesVisited = user.sessionData?.pagesVisited || []; // Sync or initialize visited pages
  
      // Save updated session data to MongoDB
      user.sessionData = {
        startTime: req.session.startTime,
        pagesVisited: req.session.pagesVisited,
      };
      await user.save();
  
      // Respond with success and token
      res.status(200).json({
        token,
        message: "Logged in successfully. Session synced.",
      });
    } catch (error) {
      res.status(500).json({ error: "Error while logging in" });
    }
  };
  
export { register, login };
