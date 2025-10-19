import bcrypt from "bcrypt";

export const generateOTP = () => {
    const OTP = String(Math.floor(100000 + Math.random() * 900000));

    return OTP;
}

export const verifyOTP = async (sentOTP, storedOTP) => {
    const expiryTime = storedOTP.expiryTime;

    const currentTime = new Date(Date.now());

    if (currentTime.getTime() > expiryTime.getTime()) {
        throw new Error("OTP expired");
    }

    const isMatch = await bcrypt.compare(sentOTP, storedOTP.code)

    if (!isMatch) {
        throw new Error("Invalid OTP");
    }

    return true;
}