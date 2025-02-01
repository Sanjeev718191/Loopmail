const mongoose = require('mongoose');
// aDjptO4XV1unf5IB
// User name - sanjeev718191
//mongodb+srv://sanjeev718191:aDjptO4XV1unf5IB@test-loop-mail.qzsg3.mongodb.net/?retryWrites=true&w=majority&appName=test-loop-mail
const connectDB = async () => {
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // const conn = await mongoose.connect('mongodb+srv://sanjeev718191:aDjptO4XV1unf5IB@test-loop-mail.qzsg3.mongodb.net/?retryWrites=true&w=majority&appName=test-loop-mail');
    console.log(`MongoDB connected : ${conn.connection.host}`.cyan.bold);
}
module.exports = connectDB;