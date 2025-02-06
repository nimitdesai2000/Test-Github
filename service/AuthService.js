const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const dbconfig = require("../config/dbconfig/dbconfigmain");
const mailer = require("../helpers/mailer");
const { LoginType } = require("../utility/LoginType");
const { templates } = require("../helpers/templates");
const { Token, User, OTP, ForgotPassword } = dbconfig.models;
const { OAuth2Client } = require("google-auth-library");
const { ConfidentialClientApplication } = require("@azure/msal-node");
const { downloadImage } = require("../helpers/imageDownloader");
const axios = require("axios");
const redisClient = require("../config/dbconfig/cachedbconfig/redisconfig");
const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
const accessTokenExpiration = process.env.ACCESS_TOKEN_EXPIRATION;
const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;
const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUrl = process.env.GOOGLE_REDIRECT_URL;
const microsoftClientId = process.env.MICROSOFT_CLIENT_ID;
const microsoftClientSecret = process.env.MICROSOFT_CLIENT_SECRET;
const microsoftRedirectUrl = process.env.MICROSOFT_REDIRECT_URL;
const microsoftTenantId = process.env.MICROSOFT_TENANT_ID;

const loginUser = async (req) => {
  const { email, password, hostname } = req;

  const key = process.env.COMPANY;
  const companyDetailsList = await redisClient.HGETALL(key);

  let companyIdFromDomain = Object.keys(companyDetailsList).find(key => companyDetailsList[key] == hostname);

  // Find the user by email
  const user = await User.findOne({
    where: { email: email, company_id: companyIdFromDomain },
  });

  if (user && bcrypt.compareSync(password, user.password)) {
    // Generate access token
    const accessToken = jwt.sign(
      { companyId: user.company_id, id: user.id },
      accessTokenSecretKey,
      { expiresIn: accessTokenExpiration }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { companyId: user.company_id, id: user.id },
      refreshTokenSecretKey,
      { expiresIn: refreshTokenExpiration }
    );

    // Save refresh token to the database
    await Token.create({
      token: refreshToken,
      user_id: user.id,
      expiry_date: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days.
      company_id: user.company_id,
      login_type: LoginType.PASSWORD,
    });
    return { data: { api_token: accessToken, refreshToken }, result: 1 };
  } else {
    return { data: {}, result: 0 };
  }
};

const registerUser = async (req) => {
  const { name, email, password, hostname, otp, languageId, timezoneId } = req;
  const key = process.env.COMPANY;
  const companyDetailsList = await redisClient.HGETALL(key);

  let companyIdFromDomain = Object.keys(companyDetailsList).find(key => companyDetailsList[key] == hostname);

  // Check if the user with the provided email already exists
  const existingUser = await User.findOne({
    where: { email: email, company_id: companyIdFromDomain },
  });

  if (existingUser) {
    return { result: 2 };
  }
  // Verify OTP
  const otpVerification = await verifyOTP(req);
  // OTP is valid, proceed with registration
  if (otpVerification.result === 1) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
      company_id: companyIdFromDomain,
      language_id: languageId,
      timezone_id: timezoneId,
    });
    return { result: 1 };
  } else {
    // OTP is invalid or expired
    return { result: 0 };
  }
};

// Create a new Google Auth Client
const googleAuthClient = new OAuth2Client(
  googleClientId,
  googleClientSecret,
  googleRedirectUrl
);

const loginWithGoogle = async (req) => {
  const { code, hostname, languageId, timezoneId } = req.body;
  const key = process.env.COMPANY;
  const companyDetailsList = await redisClient.HGETALL(key);

  let companyIdFromDomain = Object.keys(companyDetailsList).find(key => companyDetailsList[key] == hostname);
  // Check if the Auth Code exist
  if (code) {
    // Get all the Tokens (eg. Access Token, Refresh Token, Id Token, etc) from Google using the AUth Code
    const { tokens } = await googleAuthClient.getToken(code);
    // Set the Tokens in the Auth Client
    googleAuthClient.setCredentials(tokens);
    // Fetch the User information
    const { data } = await googleAuthClient.request({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
      method: "GET",
    });

    // Check if the user already exist
    let user = await User.findOne({
      where: { email: data.email, company_id: companyIdFromDomain },
    });

    // If not, create a new User
    if (!user) {
      user = await User.create({
        name: data.name,
        email: data.email,
        company_id: companyIdFromDomain,
        language_id: languageId,
        timezone_id: timezoneId,
      });
      // Get the Url Path to download the Image
      const currentUrl = `${req.protocol}://${req.headers.host}`;
      const destinationPath = `${process.env.ATTACHMENTS_PATH}attachments/user/${user.id}/${user.id}.jpg`;
      // Use this Helper to downlaod the Image
      await downloadImage(data.picture, `./public${destinationPath}`);

      // Update the user's profile_image field with the correct path
      user.profile_image = currentUrl + destinationPath;
      await user.save();
    }

    // Create a new Access Token
    const accessToken = jwt.sign(
      { companyId: user.company_id, id: user.id },
      accessTokenSecretKey,
      { expiresIn: accessTokenExpiration }
    );

    // Save Refresh Token to the database
    await Token.create({
      token: tokens.refresh_token,
      user_id: user.id,
      expiry_date: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days.
      company_id: user.company_id,
      login_type: LoginType.GOOGLE,
    });
    return {
      data: { api_token: accessToken, refreshToken: tokens.refresh_token },
      result: 1,
    };
  } else {
    return { data: {}, result: 0 };
  }
};

const microsoftAuthClient = new ConfidentialClientApplication({
  auth: {
    clientId: microsoftClientId,
    authority: `https://login.microsoftonline.com/${microsoftTenantId}`,
    clientSecret: microsoftClientSecret,
  },
});

const generateAuthCodeUrl = async (req) => {
  const authCodeUrlParameters = {
    scopes: ["openid", "profile", "offline_access"],
    redirectUri: microsoftRedirectUrl,
    prompt: "select_account",
  };
  // Get the Auth code url.
  const data = await microsoftAuthClient.getAuthCodeUrl(authCodeUrlParameters);
  // After this method is called, the code will be sent back to the front-end(i.e. redirectURI).
  return {
    data: data,
    result: 1,
  };
};

const loginWithMicrosoft = async (req) => {
  const { code, hostname, languageId, timezoneId } = req.body;
  const key = process.env.COMPANY;
  const companyDetailsList = await redisClient.HGETALL(key);

  let companyIdFromDomain = Object.keys(companyDetailsList).find(key => companyDetailsList[key] == hostname);
  // Check if the Auth Code exist
  if (code) {
    const requestParameters = {
      code: code,
      redirectUri: microsoftRedirectUrl,
      scopes: ["openid", "profile", "offline_access"],
    };

    // Get all the Tokens (eg. Access Token, Refresh Token, Id Token, etc) from Microsoft using the AUth Code
    const tokens = await microsoftAuthClient.acquireTokenByCode(
      requestParameters
    );

    // Fetch the User information
    const { data } = await axios.get("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    // Check if the user already exist
    let user = await User.findOne({
      where: { email: data.mail, company_id: companyIdFromDomain },
    });

    // If not, create a new User
    if (!user) {
      user = await User.create({
        name: data.displayName,
        email: data.mail,
        company_id: companyIdFromDomain,
        language_id: languageId,
        timezone_id: timezoneId,
      });
      // Get the profile picture
      const photoResponse = await axios.get(
        "https://graph.microsoft.com/v1.0/me/photo/$value",
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          responseType: "stream",
        }
      );
      // Get the Url Path to download the Image
      const currentUrl = `${req.protocol}://${req.headers.host}`;
      const destinationPath = `${process.env.ATTACHMENTS_PATH}attachments/user/${user.id}/${user.id}.jpg`;

      // Save the photo to the local file system
      await downloadImage("", `./public${destinationPath}`, photoResponse);

      // Update the user's profile_image field with the correct path
      user.profile_image = currentUrl + destinationPath;
      await user.save();
    }

    // Create a new Access Token
    const accessToken = jwt.sign(
      { companyId: user.company_id, id: user.id },
      accessTokenSecretKey,
      { expiresIn: accessTokenExpiration }
    );

    // Get the Refresh Token from the Token Cache
    const tokenCache = microsoftAuthClient.getTokenCache().serialize();
    const refreshTokenObject = JSON.parse(tokenCache).RefreshToken;
    const refreshToken =
      refreshTokenObject[Object.keys(refreshTokenObject)[0]].secret;

    // Save Refresh Token to the database
    await Token.create({
      token: refreshToken,
      user_id: user.id,
      expiry_date: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days.
      company_id: user.company_id,
      login_type: LoginType.MICROSOFT,
    });
    return {
      data: { api_token: accessToken, refreshToken: refreshToken },
      result: 1,
    };
  } else {
    return { data: {}, result: 0 };
  }
};

const verifyOTP = async (req) => {
  const { email, otp } = req;
  // Find the OTP record in the database
  const otpRecord = await OTP.findOne({
    where: {
      email: email,
      otp: otp,
      expiry_time: { [Sequelize.Op.gte]: new Date() }, // Check if not expired
    },
  });
  if (otpRecord) {
    // OTP is valid
    return { result: 1 };
  } else {
    // OTP is invalid or expired
    return { result: 0 };
  }
};

const generateOTP = async (req) => {
  const { email, hostname } = req;
  const key = process.env.COMPANY;
  const companyDetailsList = await redisClient.HGETALL(key);

  let companyIdFromDomain = Object.keys(companyDetailsList).find(key => companyDetailsList[key] == hostname);
  // Check if a user with the provided email already exists
  const existingUser = await User.findOne({
    where: { email: email, company_id: companyIdFromDomain },
  });

  if (existingUser) {
    return { result: 2 };
  }
  let otp = mailer.randomNumber(6);

  const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // Set expiration time (e.g., 10 minutes)

  // Check if an OTP has already been sent
  const existingOTP = await OTP.findOne({
    where: { email: email, company_id: companyIdFromDomain },
  });
  if (existingOTP) {
    // Delete the Old OTP
    await OTP.destroy({
      where: {
        email: email,
      },
    });
  }
  // Create a new OTP
  await OTP.create({
    email: email,
    otp: otp,
    expiry_time: expirationTime,
    company_id: companyIdFromDomain
  });
  // Send the mail using mailer
  mailer.send(
    templates.confirmEmails.from,
    email,
    templates.confirmEmails.subject,
    otp + templates.confirmEmails.message
  );
  return { result: 1 };
};

const forgotPassword = async (req) => {
  const { email, hostname } = req;
  const key = process.env.COMPANY;
  const companyDetailsList = await redisClient.HGETALL(key);

  let companyIdFromDomain = Object.keys(companyDetailsList).find(key => companyDetailsList[key] == hostname);
  // Find the user by email
  const user = await User.findOne({
    where: { email: email, company_id: companyIdFromDomain },
  });

  if (user) {
    // Generate an otp and save it to the database
    let otp = mailer.randomNumber(6);

    await ForgotPassword.create({
      otp: otp,
      user_id: user.id,
      email: email,
      company_id: companyIdFromDomain,
      expiry_time: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiration
    });

    // Send an email to the user with the OTP
    mailer.send(
      templates.resetPassword.from,
      email,
      templates.resetPassword.subject,
      otp + templates.resetPassword.message
    );
    return { result: 1 };
  } else {
    return { result: 2 };
  }
};

const resetPassword = async (req, res) => {
  const { otp, password } = req;

  // Verify the reset token in the database
  const resetOTP = await ForgotPassword.findOne({
    where: { otp: otp, expiry_time: { [Sequelize.Op.gte]: new Date() } },
  });

  if (resetOTP) {
    // Update the user's password
    const user = await User.findByPk(resetOTP.user_id);
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashedPassword });

    // Delete the used reset token
    await resetOTP.destroy();

    return { result: 1 };
  } else {
    return { result: 0 };
  }
};

const logoutUser = async (req, res) => {
  const { userId, companyId } = req;
  userId &&
    companyId &&
    Token.destroy({ where: { user_id: userId, company_id: companyId } });
  return {
    data: {},
    result: 1,
  };
};

module.exports = {
  loginUser,
  registerUser,
  loginWithGoogle,
  generateAuthCodeUrl,
  loginWithMicrosoft,
  verifyOTP,
  generateOTP,
  forgotPassword,
  resetPassword,
  logoutUser,
  googleAuthClient,
  microsoftAuthClient,
};
