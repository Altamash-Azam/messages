import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmails";
import { ApiResponse } from "@/types/ApiResponse";

const myFromAddress = process.env.MY_SENDER_EMAIL as string;

// --- ADD THIS LOG TO DEBUG ---
console.log("Attempting to use this 'from' address:", myFromAddress);

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{
    console.log("SEND EMAIL FUNCTION WAS TRIGGERED.");
    try {
        await resend.emails.send({
            from: myFromAddress,
            to: email,
            subject: 'Messages | Verification Code',
            react: VerificationEmail({username, otp: verifyCode}),
          });
        return {success:true, message: 'Verification email sent sucessfully'}
    } catch (emailError) {
        console.error("--- FULL EMAIL ERROR ---"); // <-- Change the label
        console.error(JSON.stringify(emailError, null, 2)); // <-- Change the log
        return {success: false, message: 'failed to send verification email'}
    }  finally {
        // --- ADD THIS BLOCK ---
        console.log("EMAIL FUNCTION EXECUTION FINISHED.");
    }
}