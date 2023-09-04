const mongoose= require('mongoose');
mongoose.set('strictQuery', false);
const connectDB= async()=>{
    try {
        const conn= await mongoose.connect('mongodb+srv://Deepika:4g5YdVJIIZ2RWVx8@cluster0.r3lq5bl.mongodb.net/');
        console.log(`Database Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error)
    }
}

module.exports= connectDB ;