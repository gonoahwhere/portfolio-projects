import mongoose from 'mongoose';
import fl from 'fluident';

const init = async () => {
    const dbOptions = {
        autoIndex: false,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        family: 4,
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 10000,
    };

    mongoose.set("strictQuery", false);

    const uri = process.env.MongoURI;

    if (!uri) {
        console.error(fl.red("[MONGOOSE] MongoURI is not defined in environment variables."));
        return;
    }

    try {
        await mongoose.connect(uri, dbOptions);
        console.log(fl.green("[MONGOOSE] Successfully connected to MongoDB."));
    } catch (err: any) {
        console.error(fl.red(`[MONGOOSE] Connection error:\n${err?.stack || err}`));
    }

    mongoose.connection.on("connected", () => {
        console.log(fl.green("[MONGOOSE] MongoDB connection established."));
    });

    mongoose.connection.on("disconnected", () => {
        console.log(fl.green("[MONGOOSE] MongoDB connection disconnected."));
    });

    mongoose.connection.on("error", (err) => {
        console.error(fl.red(`[MONGOOSE] Runtime error:\n${(err as Error).stack}`));
    });
}

export default { init };