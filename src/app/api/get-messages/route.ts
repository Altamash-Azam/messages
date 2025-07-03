import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";


export async function GET(request: Request) {
    
    await dbConnect()

    const session = await getServerSession(authOptions)
    // console.log('Session in API:', JSON.stringify(session, null, 2))

    const user: User = session?.user
    // console.log('User from session:', JSON.stringify(user, null, 2))

    if (!session || !session.user) {
        console.log('No session or user found')
        return Response.json({
            success: false,
            message: "not authenticated"
        }, { status: 401 })
    }

    // Add validation for user._id
    if (!user._id) {
        console.log('User ID is missing from session')
        return Response.json({
            success: false,
            message: "User ID not found in session"
        }, { status: 401 })
    }

    const userId = new mongoose.Types.ObjectId(user._id);
    // console.log('Searching for user with ID:', userId)
    
    try {
        // First, let's check if the user exists at all
        const userExists = await UserModel.findById(userId)
        // console.log('User exists check:', userExists ? 'Found' : 'Not found')

        if (!userExists) {
            return Response.json({
                success: false,
                message: 'User not found in database'
            }, { status: 404 })
        }
        
        if (!userExists.messages || userExists.messages.length === 0) {
            return Response.json({
                success: true,
                messages: []
            }, { status: 200 })
        }

        const user = await UserModel.aggregate([
            { $match: { _id: userId } }, // Changed from 'id' to '_id'
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } }
        ])
        
        // console.log('Aggregation result:', user)
        
        if (!user || user.length === 0) {
            return Response.json({
                success: false,
                message: 'User not found'
            }, { status: 404 }) // Changed from 401 to 404
        }

        return Response.json({
            success: true,
            messages: user[0].messages
        }, { status: 200 })

    } catch (error) {
        console.log("An unexpected error occurred", error)
        return Response.json({
            success: false,
            message: 'Unexpected error'
        }, { status: 500 }) // Changed from 401 to 500
    }
}