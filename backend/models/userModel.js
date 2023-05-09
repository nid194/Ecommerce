import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,"Please enter your name"],
        maxLength:[30,"name cannot be more than 30 characters"],
        minLength:[5,"name should be atleast of 5 characters"]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
    },
    password:{
        type:String,
        required:[true,"Please enter password"],    
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: {},
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    role:{
          type:Number,
          default:0
    },
   },
    { timestamps: true }
);


export default mongoose.model("users", userSchema);