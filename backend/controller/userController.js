const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//User Registration
exports.registerUser = catchAsyncError( async(req,res,next) => {

    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"sample id",
            url: "profilepicUrl"
        }
    });

    sendToken(user,201,res);
});


//login User
exports.loginUser = catchAsyncError( async(req,res,next) => {

    const{email,password} = req.body;

    //checking if both password and email has been provided by the user
    if(!email || !password){
        return next(new ErrorHandler("please enter email and password",400));
    }

    const user = await User.findOne({email:email}).select("+password");

    if(!user){
        return next(new ErrorHandler("sorry email or password is wrong",401));
    }

    const isPasswordMatched = user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("invalid password or email",401));
    }
    sendToken(user,200,res);
});

//logout user
exports.logoutUser = catchAsyncError(async(req,res,next) =>{

    res.cookie("token",null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success : true,
        message : "logged out"
    });
});


//forgot password
exports.forgotPassword = catchAsyncError(async(req,res,next) =>{


    const user = await User.findOne({ email: req.body.email });

    if(!user){
        return next(new ErrorHandler("user not found", 404));
    }

    //get resetPassword token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `your password reset token is :- \n\n ${resetPasswordUrl} \n\n if you have not requested this email then please ignore it`;

    try{
        await sendEmail({
            email:user.email,
            subject: `Reset Password`,
            message,
        });

        res.status(200).json({
            success: true,
            message : `Email sent to ${user.email} successfully`,
        });

    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message,500));

    }

});

//reset password
exports.resetPassword = catchAsyncError(async (req,res,next) => {

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await user.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },

    });

    if(!user){
        return next(new ErrorHandler("user reset password token is invalid oe expired", 400));
    }

    if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});

//get user detail
exports.getUserDetail = catchAsyncError(async (req,res,next) => {

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});

//update user profile
exports.updateProfile = catchAsyncError(async (req,res,next) => {

    
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });


    res.status(200).json({
        success: true,
    });
});

//update user password
exports.updatePassword = catchAsyncError(async (req,res,next) => {

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("old Password is incorrect", 400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);

    res.status(200).json({
        success: true,
        user
    });
});

//get all user
exports.getAllUser = catchAsyncError(async (req,res,next)=>{

    const users = await User.find();
    
    res.status(200).json({
        success:true,
        users
    });
});

//get single user
exports.getOneUser = catchAsyncError(async (req,res,next)=>{

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`user does not exist with id: ${req.params.id}`));
    }
    
    res.status(200).json({
        success:true,
        user
    });
});

//update user role
exports.updateRole = catchAsyncError(async (req,res,next) => {

    
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });


    res.status(200).json({
        success: true,
    });
});


//delete user 
exports.deleteUser = catchAsyncError(async (req,res,next) => {

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`user does not exist with id: ${req.params.id}`));
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: "user deleted successfully"
    });
});
