import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const { messageId } = await request.json()

    const user = session?.user

    if (!session || !session.user) {
        console.log("no session or user found")
        return NextResponse.json({
            success: false,
            message: "no session or user found"
        }, { status: 500 })
    }

    if (!user._id) {
        console.log(" no id found for this user")
        return NextResponse.json({
            success: false,
            message: "no user id found for this user"
        }, { status: 404 })
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const result = await UserModel.findByIdAndUpdate(
            userId,
            { $pull: { messages: { _id: messageId } } },
            { new: true }
        );
        // await user.save()
        return NextResponse.json({
            success: true,
            message: "message deleted successfully"
        },{status: 200})
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "could not delete the message"
        })
    }


}