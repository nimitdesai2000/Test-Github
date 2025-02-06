const logger = require("../config/logger/logger.config");
const commonService = require("../service/CommonService");
const { APIResponse } = require("../utility/apihandler/APIResponse");
const { HttpStatusCode } = require("../utility/HttpStatusCode");
const { Result } = require("../utility/Result");


const getAllLanguages = async (request, response) => {
  try {
    logger.info("CommonController ---> getAllLanguages ---> Reached.");
    const { } = request.body;
    const { data } = await commonService.getAllLanguage();
    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('language.get.success'));
    logger.info("CommonController ---> getAllLanguages ---> End.");
  } catch (error) {
    logger.error("CommonController ---> getAllLanguages ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
  }
};

const getAllTimeZones = async (request, response) => {
  try {
    logger.info("CommonController ---> getAllTimeZones ---> Reached.");
    const { } = request.body;
    const { data } = await commonService.getAllTimeZone();
    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('timezone.get.success'));
    logger.info("CommonController ---> getAllTimeZones ---> End.");
  } catch (error) {
    logger.error("CommonController ---> getAllTimeZones ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
  }
};


const initializeData = async (req, res) => {
  try {
    let companyIdsArray = [];
    let newCompanyIdsArray = [];
    let companyData;
    let userGroupData;
    let userGroupIdsArray = [];
    companyData = await commonService.initializeCompany();
    companyIdsArray = companyData.company_id_array;
    newCompanyIdsArray = companyData.new_company_ids_array;
    await commonService.initializeProduct(companyIdsArray);
    await commonService.initializeTimezone(companyIdsArray);
    await commonService.initializeLanguage(companyIdsArray);
    await commonService.initializeIcons(companyIdsArray);
    await commonService.initializeEntityData(companyIdsArray);
    await commonService.initializeGroupData(companyIdsArray);
    await commonService.initializeModuleData(companyIdsArray);
    await commonService.initializeOperationTypeData(companyIdsArray);
    if(newCompanyIdsArray.length >= 0) {
      userGroupData = await commonService.initializeUserGroupData(newCompanyIdsArray);
      if(userGroupData) {
        for(let i=0;i<userGroupData.length;i++) {
          userGroupIdsArray.push(userGroupData[i].id)
        }
         if(userGroupIdsArray.length > 0) {
          await commonService.initializeModuleRightsAndModuleOperationRights(newCompanyIdsArray,userGroupData);
          await commonService.initializeUserData(newCompanyIdsArray);
        }
      }
    }
    console.log("Data Initialized");
  } catch (error) {
    console.error("Error Initializing Data:", error);
    throw error;
  }
};

module.exports = {
  getAllLanguages,
  getAllTimeZones,
  initializeData,
};
