// app.js
const mongoose = require('mongoose');

export const connectDb=(dbUri:string)=>{
    mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const db = mongoose.connection;
    
    // Event listeners for Mongoose connection
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
    });
    
}