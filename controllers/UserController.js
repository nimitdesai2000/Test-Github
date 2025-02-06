const userService = require("../service/UserService");
const logger = require("../config/logger/logger.config");
const { APIResponse } = require("../utility/apihandler/APIResponse");
const { HttpStatusCode } = require("../utility/HttpStatusCode");
const { Result } = require("../utility/Result");

const getUserById = async (req, res) => {
  return userService.getUserById(req.body, res);
};

const saveUserDataInRedis = async (req, res) => {
  const data = await userService.saveUserDataInRedis(req.body);
  res.json(data);
};

const uploadUserImgController = async (request, response) => {
  try {
    logger.info("UserController-> uploadUserImgController ---> Reached.");
    const { myData } = request;
    APIResponse(
      response,
      HttpStatusCode.OK,
      Result.SUCCESS,
      {
        success: true,
        time: "2024-01-02 04:56:17",

        data: {
          baseurl: `${request.protocol}://${request.get("host")}${process.env.ATTACHMENTS_PATH}/attachments/user/${myData.userId}/${myData.fileName}`,
          msg: ["image was uploaded"],
          files: [myData.fileName],
          isImages: [true],
          code: 220,
        },
        elapsedTime: 0,
      },
      t("userImg.edit.success")
    );
    logger.info("UserController-> uploadUserImgController ---> End.");
  } catch (error) {
    logger.error(
      "UserController ---> uploadUserImgController ---> Error: ",
      error
    );
    APIResponse(
      response,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("internal.server.error")
    );
  }
};

const editProfile = async (request, response) => {
  try {
    logger.info("UserController-> editProfile ---> Reached.");

    const {
      name,
      contactNo,
      languageId,
      timezoneId,
      userId,
      companyId,
      userProfileImg,
      date,
      time,
    } = request.body;

    const editProfileObject = {
      name,
      contactNo,
      languageId,
      timezoneId,
      companyId,
      userId,
      userProfileImg,
      date,
      time,
    };
    const {result, data} =  await userService.editProfile(editProfileObject);

    if (result == 1) {
      APIResponse(
        response,
        HttpStatusCode.OK,
        Result.SUCCESS,
        data,
        t("user.edit.success")
      );
    } else {
      APIResponse(
        response,
        HttpStatusCode.OK,
        Result.SUCCESS,
        t("user.edit.success")
      );
    }
    logger.info("UserController-> editProfile ---> End.");
  } catch (error) {
    logger.error("UserController ---> editProfile ---> Error: ", error);
    APIResponse(
      response,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("internal.server.error")
    );
  }
};
const resetUserPassword=async(request,response)=>{
  try{
    logger.info("UserController-> resetUserPassword ---> Reached.");
    const {result} = await userService.resetUserPassword(request.body);
    if(result==-1){
      APIResponse(
        response,
        HttpStatusCode.NOT_FOUND,
        Result.SUCCESS,
        t("user.resetpassword.notexist")
      );
    }
    else if(result==1){
      APIResponse(
        response,
        HttpStatusCode.OK,
        Result.SUCCESS,
        t("user.resetpassword.success")
      );
    }else if(result == 0){
      APIResponse(
        response,
        HttpStatusCode.Forbidden,
        Result.SUCCESS,
        t("user.resetpassword.fail")
      );
    }
    else{
      APIResponse(
        response,
        HttpStatusCode.OK,
        Result.SUCCESS,
        t("user.resetpassword.fail")
      );
    }
    
    logger.info("UserController-> resetUserPassword ---> End.");
  }catch(error){
    logger.error("UserController ---> resetUserPassword ---> Error: ", error);
    APIResponse(
      response,
      HttpStatusCode.INTERNAL_SERVER,
      Result.FAIL,
      {},
      t("internal.server.error")
    );

  }

}

module.exports = {
  getUserById,
  uploadUserImgController,
  editProfile,
  saveUserDataInRedis,
  resetUserPassword
};
