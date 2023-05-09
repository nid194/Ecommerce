import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter product name"],
        trim:true
    },
    slug: {
        type: String,
        required: true,
    },
    description:{
        type:String,
        required:[true,"please enter product description"]
    },
    price:{
        type:Number,
        required:[true,"please enter your product price"],
        maxLenght:[8,"price cannot exceed 8 characters"]
    },
    photo: {
        data: Buffer,
        contentType: String,
    },
    shipping: {
        type: Boolean,
    },
    category: {
        type: mongoose.ObjectId,
        ref: "Category",
        required: true,
      },

},
    { timestamps: true }
  );

  export default mongoose.model("Products", productSchema);