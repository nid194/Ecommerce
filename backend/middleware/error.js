const ErrorHandler = require("../utils/errorHandler");

module.exports = (err,req,res,next)=>{
 
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Inrernal server error";

    //mongodb id error
    if(err.name === "CastError"){
        const message = `resource not found. invalid: ${err.path}`;
        err = new ErrorHandler(message,400);
    }

    //mongoose duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message,400);
    }

    //wrong jwtToken error
    if(err.name === "JSONWebTokenError"){
        const message = `JSON web Token is invalid, try again!`;
        err = new ErrorHandler(message,400);
    }

    //wrong jwtToken expire error
    if(err.name === "TokenExpiredError"){
        const message = `JSON Web Token has expired, try again!`;
        err = new ErrorHandler(message,400);
    }


    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};