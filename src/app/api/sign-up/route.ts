import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect();    try {
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return Response.json({
                success: false,
                message: "Invalid JSON in request body"
            }, { status: 400 });
        }

        if (!body || typeof body !== 'object') {
            return Response.json({
                success: false,
                message: "Request body must be a JSON object"
            }, { status: 400 });
        }

        const { username, email, password } = body;

        if (!username || !email || !password) {
            return Response.json({
                success: false,
                message: "Missing required fields: username, email, and password"
            }, { status: 400 });
        }
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })
        if(existingUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: "Username Taken"
            }, {status: 400})
        }

        const existingUserByEmail = await UserModel.findOne({
            email
        })

        const verifyCode = Math.floor(100000+ Math.random()*900000).toString();
        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success: false,
                    message : "user already exists"
                }, {status: 400})
            }
            else{
                const hasedPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hasedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiresAt = new Date(Date.now()+3600000)
                await existingUserByEmail.save();
            }
        }
        else{
            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours()+1)

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiresAt: expiryDate,
                isVerified:false,
                isAcceptingMessages: true,
                messages: [],
            })
            await newUser.save();
        }

        //send verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )
        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status: 500})
        }
        return Response.json({
            success: true,
            message: "User registered sucessfully please verify your email"
        }, {status: 201})    } catch (error: any) {
        console.error('Error registering error:', error)
        return Response.json(
            {
                success: false,
                message: error.message || "Error Registering User",
                error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            {
                status: 500
            }
        )
    }
}