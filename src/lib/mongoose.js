   // lib/mongoose.js
   "use server"
   import mongoose from 'mongoose';

   export const connectDB = async () => {
     if (mongoose.connection.readyState >= 1) {
       return;
     }
     return mongoose.connect(process.env.MONGODB_URI, {
       useNewUrlParser: true,
       useUnifiedTopology: true,
     });
   };