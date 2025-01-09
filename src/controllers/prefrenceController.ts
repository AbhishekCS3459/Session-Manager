import { Request, Response } from "express";
import User, { IUser } from "../model/User";

export const savePreferences = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { theme, notifications, language, email } = req.body;
    //@ts-ignore
    // const userEmail=req.user?.email;
    const userEmail = email; // Check if the user is authenticated
    if (userEmail) {
      // Authenticated user: Save preferences in MongoDB
      const user: IUser | null = await User.findOne({ email: userEmail });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      user.preferences = { theme, notifications, language };
      await user.save();

      res.status(200).json({
        message: "Preferences saved successfully",
        preferences: user.preferences,
      });
    } else {
      // Guest user: Save preferences in cookies
      res
        .cookie(
          "preferences",
          { theme, notifications, language },
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          }
        )
        .status(200)
        .json({ message: "Preferences saved in cookies" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: "Error while saving the preferences",
    });
  }
};

// Get preferences
export const getPreferences = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    //@ts-ignore
    // const userEmail = req.body?.email; // Get email from request body user
    const email = req.body?.email;
    const userEmail = email;
    if (userEmail) {
      // Authenticated user: Retrieve preferences from MongoDB
      const user: IUser | null = await User.findOne({ email: userEmail });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json({ preferences: user.preferences });
    } else {
      // Guest user: Retrieve preferences from cookies
      const preferences = req.cookies.preferences;

      if (!preferences) {
        res.status(404).json({ message: "No preferences found in cookies" });
        return;
      }

      res.status(200).json({ preferences });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: "Error while getting preferences",
    });
  }
};
