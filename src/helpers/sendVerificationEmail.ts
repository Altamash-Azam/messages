import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmails";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: '<onboarding@resend.dev>',
            to: email,
            subject: 'Messages | Verification Code',
            react: VerificationEmail({username, otp: verifyCode}),
          });
        return {success:true, message: 'Verification email sent sucessfully'}
    } catch (emailError) {
        console.error("Error sending verification email", emailError)
        return {success: false, message: 'failed to send verification email'}
    }
}