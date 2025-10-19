import axios from "axios";

export const sendOTPviaSMS = async (phoneNumber, otpCode) => {
  const message = `Your DealKaro verification code is ${otpCode}. Do not share it with anyone.`;

  try {
    const response = await axios.get("https://sendpk.com/api/sms.php", {
      params: {
        username: 923211629973,
        password: 12345678,
        sender: "DealKaro",
        mobile: 923164523179,
        message: message
      }
    });

    if (response.data.includes("OK")) {
      console.log("OTP sent successfully");
      return true;
    } else {
      console.error("Failed to send OTP:", response.data);
      return false;
    }
  } catch (error) {
    console.error("SMS sending error:", error.message);
    return false;
  }
};