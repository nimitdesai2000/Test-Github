const dbconfig = require("../config/dbconfig/dbconfigmain");
const { User, TimeZone, Language } = dbconfig.models;
const logger = require("../config/logger/logger.config");
const redisClient = require("../config/dbconfig/cachedbconfig/redisconfig");
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const LanguageModel = require("../models/LanguageModel");

const getUserById = async (req, res) => {
  const { userId, companyId } = req;
  try {
    if (userId) {
      const user = await User.findOne({
        where: { id: userId, company_id: companyId },
        attributes: {
          exclude: ["timezoneId"],
          include: [
            [Sequelize.literal("timezoneId.timezone_identifier"), "time_zone"],
            [Sequelize.literal("languageId.language_name"), "language_name"],
          ],
        },
        include: [
          {
            model: TimeZone,
            as: "timezoneId",
            attributes: [],
          },
          {
            model: Language,
            as: "languageId",
          },
        ],
        raw: true,
      });
      res.json(user);
    }
  } catch (error) {
    console.error("Error getting User:", error);
    res.sendStatus(500);
  }
};

const saveUserDataInRedis = async (req) => {
  const { userId, companyId } = req;
  const user = await User.findOne({
    where: { id: userId, company_id: companyId },
    include: [
      {
        model: TimeZone,
        as: "timezoneId",
        attributes: ["timezone_identifier"],
      },
      {
        model: Language,
        as: "languageId",
        attributes: ["language_name"],
      },
    ],
  });
  if (!user) {
    return null; // Return null if user is not found
  }

  // Convert Sequelize instance to JSON
  const userJSON = user.toJSON();
  // Save user data to Redis
  const redisKey = `USER_DATA_${companyId}`;
  const redisField = userId.toString(); // Assuming userId is a number
  const redisValue = JSON.stringify(userJSON);

  // Use your Redis client (replace redisClient with your actual client)
  redisClient.HSET(redisKey, redisField, redisValue);

  return userJSON;
};

const editProfile = async (editProfileObject) => {
  try {
    logger.info("UserServices ---> editProfile ---> Reached.");
    const {
      name,
      contactNo,
      languageId,
      timezoneId,
      companyId,
      userId,
      userProfileImg,
      date,
      time,
    } = editProfileObject;
    const existingProfile = await User.findOne({
      where: {
        id: userId,
        company_id: companyId,
      },
    });
    existingProfile.name = name;
    existingProfile.contact_no = contactNo;
    existingProfile.language_id = languageId;
    existingProfile.timezone_id = timezoneId;
    existingProfile.profile_image = userProfileImg;
    existingProfile.date_format = date;
    existingProfile.time_format = time;
    
    await existingProfile.save();
    logger.info("UserServices ---> editProfile ---> End.");
    return { result: 1 , data: existingProfile};
  } catch (error) {
    logger.error("UserServices ---> editProfile ---> Error:", error);
    throw error;
  }
};
const resetUserPassword = async (req) => {
  const { currentPassword, newPassword, confirmPassword, userId } = req;
  logger.info("UserServices ---> resetUserPassword ---> Reached.");

  const user = await User.findOne({
    where: { id: userId },
  });
  if (!user) {
    return { message: "Something Went wrong", result: -1 };
  }
  const hashedPassword = await bcrypt.compare(currentPassword, user.password);
  if (!hashedPassword) {
    return { message: "Please Enter the Correct Password", result: 0 };
  }
  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  const updatePassword = await User.update(
    {
      password: newHashedPassword,
    },
    {
      where: {
        id: userId,
      },
    }
  );
  return { message: "Your Password has been updated sucessfully", result: 1 };
};

module.exports = {
  getUserById,
  editProfile,
  saveUserDataInRedis,
  resetUserPassword,
};
