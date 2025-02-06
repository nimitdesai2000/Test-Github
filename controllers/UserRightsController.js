const userRightsService = require("../service/UserRightsService");
const logger = require("../config/logger/logger.config");
const { APIResponse } = require("../utility/apihandler/APIResponse");
const { HttpStatusCode } = require("../utility/HttpStatusCode");
const { Result } = require("../utility/Result");

const crateUserGroups = async (request, response) => {
  try {
    logger.info("UserRightsController ---> crateUserGroups ---> Reached.");
    const userGroupData = request.body;
    await userRightsService.crateUserGroups(userGroupData);
    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, t('UserGroup.add.success'));
    logger.info("UserRightsController ---> crateUserGroups ---> End.");
  } catch (error) {
    logger.error("UserRightsController ---> crateUserGroups ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
  }
};

const getUserGroups = async (request, response) => {
  try {
    logger.info("UserRightsController ---> getUserGroups ---> Reached.");
    const { companyId } = request.body;
    const { limit, offset } = request.query;
    const { data } = await userRightsService.getUserGroups(companyId);
    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('UserGroup.get.success'));
    logger.info("UserRightsController ---> getUserGroups ---> End.");
  } catch (error) {
    logger.error("UserRightsController ---> getUserGroups ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
  }
}

const editUserGroupById = async (request, response) => {
  try {
    logger.info("UserRightsController ---> editUserGroupById ---> Reached.");
    const UserGroupData = request.body;
    const userGroupId = request.params.id;
    const result = await userRightsService.editUserGroupById(UserGroupData, userGroupId);
    if (result == 1) {
      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, t('UserGroup.edit.success'));
    } else {
      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, t('UserGroup.edit.success'));
    }
    logger.info("UserRightsController ---> editUserGroupById ---> End.");
  } catch (error) {
    logger.error("UserRightsController ---> editUserGroupById ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
  }
};

const deleteUserGroupById = async (request, response) => {
  try {
    logger.info("UserRightsController ---> deleteUserGroupById ---> Reached.");
    const userGroupId = request.params.id;
    const { companyId } = request.body;

    const { result } = await userRightsService.deleteUserGroupById(userGroupId, companyId);
    if (result == 1) {
      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('UserGroup.delete.success'));
    } else {
      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('userGroups.notFound'));
    }
    logger.info("UserRightsController ---> deleteUserGroupById ---> End.");
  } catch (error) {
    logger.error("UserRightsController ---> deleteUserGroupById ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
  }
};

const getOperations = async (request, response) => {
  try {
    logger.info("UserRightsController ---> getOperations ---> Reached.");
    const { companyId } = request.body;

    const { data } = await userRightsService.getOperations(companyId);
    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('operationType.get.success'));
    logger.info("UserRightsController ---> getOperations ---> End.");
  } catch (error) {
    logger.error("UserRightsController ---> getOperations ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
  }
};

const getModules = async (request, response) => {
  try {
    logger.info("UserRightsController ---> getModules ---> Reached.");
    const { companyId } = request.body;

    const { data } = await userRightsService.getModules(companyId);
    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('module.get.success'));
    logger.info("UserRightsController ---> getModules ---> End.");
  } catch (error) {
    logger.error("UserRightsController ---> getModules ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
  }
};


const getGroups = async (request, response) => {
  try {
    logger.info("UserRightsController ---> getGroups ---> Reached.");
    const { companyId } = request.body;

    const { data } = await userRightsService.getGroups(companyId);
    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('group.get.success'));
    logger.info("UserRightsController ---> getGroups ---> End.");
  } catch (error) {
    logger.error("UserRightsController ---> getGroups ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
  }
};


const getUserRights = async (request, response) => {
  try {
    logger.info("UserRightsController-> getUserRights ---> Reached.");

    const { userId, companyId } =
      request.body;

    const userGroupIds = request.query.data;
    const userRightsObject = {
      userId,
      companyId,
      userGroupIds
    };
    const userModuleRightsData = await userRightsService.getUserRights(userRightsObject);
    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, userModuleRightsData, t('UserGroup.get.success'));
    logger.info("UserController-> getUserRights ---> End.");
  } catch (error) {
    logger.error("UserController ---> getUserRights ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
  }
};

module.exports = {
  crateUserGroups,
  getUserGroups,
  getUserRights,
  getGroups,
  getModules,
  getOperations,
  editUserGroupById,
  deleteUserGroupById
};




