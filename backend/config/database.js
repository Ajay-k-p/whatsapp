import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://ajaykaliparambil916_db_user:kqjb1sE2CNDrvJgn@whatsapp.ks8oyhq.mongodb.net/whatsapp?retryWrites=true&w=majority&appName=whatsapp",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("MongoDB Atlas Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
