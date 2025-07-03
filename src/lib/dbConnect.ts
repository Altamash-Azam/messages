import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

const connection: ConnectionObject = {};

export async function dbConnect(): Promise<void> {
    if(connection.isConnected) {
        console.log("Already connected to the database");
        return;
    }    try{
         const db = await mongoose.connect(process.env.MONGODB_URI as string || "", {
            dbName: 'messages'
         });
         connection.isConnected = db.connections[0].readyState;
         console.log("DB Connected Succesfully");

    }catch (error){
        console.log("Database connection failed", error);
        process.exit(1)
    }
}