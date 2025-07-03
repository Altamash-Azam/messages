import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function POST(request: Request) {
    // console.log('🔄 POST /api/accept-messages called')
    
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user

    // console.log('📋 Session check:', session ? 'Found' : 'Not found')
    // console.log('👤 User ID:', user?._id)

    if (!session || !session.user) {
        console.log('❌ No session/user found')
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, { status: 401 })
    }

    try {
        // Parse request body
        const body = await request.json()
        // console.log('📥 Request body:', body)
        
        const { acceptMessages } = body
        // console.log('🎛️ Accept messages value:', acceptMessages)

        // Convert to ObjectId for MongoDB query
        const userId = new mongoose.Types.ObjectId(user._id)
        // console.log('🔍 Searching for user ID:', userId)

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        )
        
        // console.log('📝 Update result:', updatedUser ? 'Success' : 'Failed')
        // console.log('✅ Updated isAcceptingMessages to:', updatedUser?.isAcceptingMessages)
        
        if (!updatedUser) {
            console.log('❌ User not found during update')
            return Response.json({
                success: false,
                message: "Failed to update user - user not found"
            }, { status: 404 })
        }

        return Response.json({
            success: true,
            message: `Message accepting status updated to ${acceptMessages ? 'enabled' : 'disabled'}`,
            isAcceptingMessages: updatedUser.isAcceptingMessages
        }, { status: 200 })

    } catch (error) {
        console.error("❌ Error in POST /api/accept-messages:", error)
        return Response.json({
            success: false,
            message: "Failed to update user status"
        }, { status: 500 })
    }
}

export async function GET(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)

    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "not authenticated"
        }, { status: 401 })
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const foundUser = await UserModel.findById(userId)
        if (!foundUser) {
            return Response.json({
                status: false,
                message: " User not found"
            }, { status: 404 })
        }

        return Response.json({
            status: true,
            isAcceptingMessages: foundUser.isAcceptingMessages
        }, { status: 200 })
    } catch (error) {
        console.log("Error in getting message accepting status")
        return Response.json({
            status: false,
            message: "Error in getting message accepting status"
        },{status: 500})
    }
}
