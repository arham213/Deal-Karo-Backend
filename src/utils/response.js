export const successResponse = (res, message, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        responseMessage: message,
        ...(data && {data: data})
    })
}

export const failureResponse = (res, err, statusCode) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            message: err.message || err || "Internal Server Error",
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        },
    });
}

export const failureResponseWithData = (res, err, data, statusCode) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            message: err.message || err || "Internal Server Error",
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        },
        ...(data && {data: data})
    });
}