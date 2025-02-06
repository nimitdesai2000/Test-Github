const dbconfig = require("../config/dbconfig/dbconfigmain");
const { ModuleRights, ModuleOperationRights, Sequelize, Group, Module, OperationType, UserGroup, User } = dbconfig.models;
const logger = require("../config/logger/logger.config");

/**
 * @desc Method to create new User Group
 * @param {Object} userGroupData 
 */

const getUserGroups = async (companyId) => {
  try {
    logger.info("UserRightsServices ---> getUserGroups ---> Reached.");

    const group = await UserGroup.findAndCountAll({
      where: { company_id: companyId },
      include: [
        {
          model: Group,
          as: "groupId",
          attributes: ["group_name", "id"],
        },
      ],
    });

    logger.info("UserRightsServices ---> getUserGroups ---> End.");
    return { data: group };
  } catch (error) {
    logger.error("UserRightsServices ---> getUserGroups ---> Error: ", error);
    throw error;
  }
}

const crateUserGroups = async (userGroupData) => {
  try {
    logger.info("UserRightsServices ---> crateUserGroups ---> Reached.");
    const {
      user_group_name,
      group_id,
      module_rights,
      companyId,
      userId
    } = userGroupData;
    const userGroupLastId = await UserGroup.create({
      user_group_name: user_group_name,
      group_id: group_id,
      company_id: companyId,
      created_by: userId,
    });

    const module_id = module_rights.map(item => parseInt(item.module_id));

    const operationRightsId = module_rights.map(item => item.operation_rights);

    for (const [index, moduleId] of module_id.entries()) {
      const moduleRightsLastId = await ModuleRights.create({
        user_group_id: userGroupLastId.dataValues.id,
        module_id: parseInt(moduleId),
        company_id: companyId,
      });

      if (moduleRightsLastId) {
        const innerArray = operationRightsId[index]
        for (const operationRightsId of innerArray) {

          await ModuleOperationRights.create({
            module_rights_id: moduleRightsLastId.dataValues.id,
            operation_id: operationRightsId,
            company_id: companyId
          });
        }

      }
    }

    logger.info("UserRightsServices ---> crateUserGroups ---> End.");

  } catch (error) {
    logger.error("UserRightsServices ---> crateUserGroups ---> Error: ", error);
    throw error;
  }
};

const editUserGroupById = async (UserGroupData, userGroupId) => {
  try {
    logger.info("UserRightsServices ---> editUserGroupById ---> Reached.");
    const {
      user_group_name,
      group_id,
      module_rights,
      companyId
    } = UserGroupData;

    const userGroupLastId = await UserGroup.findOne({ where: { id: userGroupId } });
    userGroupLastId.user_group_name = user_group_name;
    userGroupLastId.group_id = group_id;
    userGroupLastId.company_id = companyId;
    await userGroupLastId.save()

    const moduleRightsRecords = await ModuleRights.findAll({
      where: {
        user_group_id: userGroupLastId.dataValues.id,
      },
    });

    const moduleRightsIds = moduleRightsRecords.map(record => record.dataValues.id);


    const moduleOperationRightsRecords = await ModuleOperationRights.findAll({
      where: {
        module_rights_id: moduleRightsIds,
      },
    });

    await Promise.all(moduleOperationRightsRecords.map(record => record.destroy()));

    await Promise.all(moduleRightsRecords.map(record => record.destroy()));

    const module_id = module_rights.map(item => parseInt(item.module_id));

    const operationRightsId = module_rights.map(item => item.operation_rights);

    for (const [index, moduleId] of module_id.entries()) {
      const moduleRightsLastId = await ModuleRights.create({
        user_group_id: userGroupLastId.dataValues.id,
        module_id: parseInt(moduleId),
        company_id: companyId
      });

      if (moduleRightsLastId) {
        const innerArray = operationRightsId[index]
        for (const operationRightsId of innerArray) {

          await ModuleOperationRights.create({
            module_rights_id: moduleRightsLastId.dataValues.id,
            operation_id: operationRightsId,
            company_id: companyId
          });
        }

      }
    }

    logger.info("UserRightsServices ---> editUserGroupById ---> End.");
    return { result: 1 };
  } catch (error) {
    logger.error("UserRightsServices ---> editUserGroupById ---> Error: ", error);
    throw error;
  }
};

const deleteUserGroupById = async (userGroupId, companyId) => {
  try {
    logger.info("UserRightsServices ---> deleteUserGroupById ---> Reached.");
    const existingUserGroup = await UserGroup.findOne({
      where: { id: userGroupId, company_id: companyId },
    });

    if (existingUserGroup === null) {
      return { result: 0 }
    }

    const moduleRightsRecords = await ModuleRights.findAll({
      where: {
        user_group_id: existingUserGroup.dataValues.id,
      },
    });

    const moduleRightsIds = moduleRightsRecords.map(record => record.dataValues.id);


    const moduleOperationRightsRecords = await ModuleOperationRights.findAll({
      where: {
        module_rights_id: moduleRightsIds,
      },
    });

    await Promise.all(moduleOperationRightsRecords.map(record => record.destroy()));

    await Promise.all(moduleRightsRecords.map(record => record.destroy()));

    await existingUserGroup.destroy();
    logger.info("UserRightsServices ---> deleteUserGroupById ---> End.");
    return { result: 1 };
  } catch (error) {
    logger.error("UserRightsServices ---> deleteUserGroupById ---> Error: ", error);
    throw error;
  }
};

const getOperations = async (companyId) => {
  try {
    logger.info("UserRightsServices ---> getOperations ---> Reached.");

    const moduleOperationRights = await OperationType.findAndCountAll({
      where: { company_id: companyId }
    });

    logger.info("UserRightsServices ---> getOperations ---> End.");
    return { data: moduleOperationRights };
  } catch (error) {
    logger.error("UserRightsServices ---> getOperations ---> Error: ", error);
    throw error;
  }
};

const getGroups = async (companyId) => {
  try {
    logger.info("UserRightsServices ---> getGroups ---> Reached.");

    const group = await Group.findAndCountAll({
      where: { company_id: companyId }
    });

    logger.info("UserRightsServices ---> getGroups ---> End.");
    return { data: group };
  } catch (error) {
    logger.error("UserRightsServices ---> getGroups ---> Error: ", error);
    throw error;
  }
};

const getModules = async (companyId) => {
  try {
    logger.info("UserRightsServices ---> getModules ---> Reached.");

    const module = await Module.findAndCountAll({
      where: { company_id: companyId }
    });

    logger.info("UserRightsServices ---> getModules ---> End.");
    return { data: module };
  } catch (error) {
    logger.error("UserRightsServices ---> getModules ---> Error: ", error);
    throw error;
  }
};

const getUserRights = async (userRightsObject) => {
  try {
    logger.info("UserRightsServices ---> getUserRights ---> Reached.");
    let uniqueModulesIds = new Set();
    let jsonObjectUserGroupRightsData = [];
    let uniqueModuleRightsIds = new Set();
    let moduleIdWiseModuleNameData = {};
    let moduleIdWiseModuleKeyData = {};
    let userGroupWiseModuleId = {};
    let userGroupWiseModuleRightsId = {};
    let userGroupWiseModuleRightIdWithModuleId = {};
    let tmpModuleArray = [];
    let tmpUserGroupId;
    let tmpModuleRightsId;
    let userModuleOperationRights;
    let moduleData;
    let tmpModuleData;
    let moduleRightsIdWiseOperationType = {};

    const userModuleRights = await ModuleRights.findAll({
      where: {
        company_id: userRightsObject.companyId,
        user_group_id: userRightsObject.userGroupIds,
      },
      include: [
        {
          model: UserGroup,
          as: "userGroupId",
          attributes: ['user_group_name', 'group_id', ['id', 'user_group_id']]
        }

      ]
    });

    if (userModuleRights) {
      for (let i = 0; i < userModuleRights.length; i++) {
        uniqueModulesIds.add(userModuleRights[i].dataValues.module_id);
        uniqueModuleRightsIds.add(userModuleRights[i].dataValues.id);
        tmpUserGroupId = userModuleRights[i].dataValues.user_group_id;
        tmpUserGroupId = userModuleRights[i].dataValues.userGroupId;
        tmpModuleRightsId = userModuleRights[i].dataValues.id;
        if (userGroupWiseModuleId.hasOwnProperty(tmpUserGroupId)) {
          tmpModuleArray = userGroupWiseModuleId[tmpUserGroupId];
          tmpModuleArray.push(userModuleRights[i].dataValues.module_id);
          userGroupWiseModuleId[tmpUserGroupId] = tmpModuleArray;
        } else {
          userGroupWiseModuleId[tmpUserGroupId] = [
            userModuleRights[i].dataValues.module_id,
          ];
        }

        if (userGroupWiseModuleRightsId.hasOwnProperty(tmpUserGroupId)) {
          tmpModuleArray = userGroupWiseModuleRightsId[tmpUserGroupId];
          tmpModuleArray.push(userModuleRights[i].dataValues.id);
          userGroupWiseModuleRightsId[tmpUserGroupId] = tmpModuleArray;
        } else {
          userGroupWiseModuleRightsId[tmpUserGroupId] = [
            userModuleRights[i].dataValues.id,
          ];
        }

        if (
          userGroupWiseModuleRightIdWithModuleId.hasOwnProperty(tmpUserGroupId)
        ) {
          let tmpJsonObjet =
            userGroupWiseModuleRightIdWithModuleId[tmpUserGroupId];
          tmpJsonObjet[userModuleRights[i].dataValues.module_id] =
            userModuleRights[i].dataValues.id;
          tmpJsonObjet["user_group_id"] = tmpUserGroupId;
          userGroupWiseModuleRightIdWithModuleId[tmpUserGroupId] = tmpJsonObjet;
        } else {
          let tmpJsonObject = {};
          tmpJsonObject[userModuleRights[i].dataValues.module_id] =
            userModuleRights[i].dataValues.id;
          tmpJsonObject["user_group_id"] = tmpUserGroupId;
          userGroupWiseModuleRightIdWithModuleId[tmpUserGroupId] =
            tmpJsonObject;
        }
      }
    }

    if (uniqueModuleRightsIds) {
      userModuleOperationRights = await ModuleOperationRights.findAll({
        where: {
          module_rights_id: {
            [Sequelize.Op.in]: Array.from(uniqueModuleRightsIds),
          },
        },
      });
    }

    if (userModuleOperationRights) {
      for (let i = 0; i < userModuleOperationRights.length; i++) {
        let modulesOpeartionTypeData = userModuleOperationRights[i].dataValues;
        let moduleRightsId = modulesOpeartionTypeData.module_rights_id;
        if (moduleRightsIdWiseOperationType.hasOwnProperty(moduleRightsId)) {
          let tmpOperationTypeArray =
            moduleRightsIdWiseOperationType[moduleRightsId];
          tmpOperationTypeArray.push(modulesOpeartionTypeData.operation_id);
          moduleRightsIdWiseOperationType[moduleRightsId] =
            tmpOperationTypeArray;
        } else {
          moduleRightsIdWiseOperationType[moduleRightsId] = [
            modulesOpeartionTypeData.operation_id,
          ];
        }
      }
    }

    if (uniqueModulesIds) {
      moduleData = await Module.findAll({
        where: {
          id: {
            [Sequelize.Op.in]: Array.from(uniqueModulesIds),
          },
        },
      });
    }

    if (moduleData) {
      for (let i = 0; i < moduleData.length; i++) {
        tmpModuleData = moduleData[i].dataValues;
        moduleIdWiseModuleNameData[tmpModuleData.id] = tmpModuleData.module_name;
        moduleIdWiseModuleKeyData[tmpModuleData.id] = tmpModuleData.module_key;
      }
    }

    if (userGroupWiseModuleRightIdWithModuleId) {
      for (const userGroupId in userGroupWiseModuleRightIdWithModuleId) {
        if (
          userGroupWiseModuleRightIdWithModuleId.hasOwnProperty(userGroupId)
        ) {
          let modulesRightsDetails =
            userGroupWiseModuleRightIdWithModuleId[userGroupId];
          for (const moduleId in modulesRightsDetails) {
            if (modulesRightsDetails.hasOwnProperty(moduleId)) {
              if (uniqueModulesIds.has(parseInt(moduleId))) {
                let value = modulesRightsDetails[moduleId];
                if (moduleRightsIdWiseOperationType.hasOwnProperty(value)) {
                  let operations = moduleRightsIdWiseOperationType[value];
                  let moduleName = moduleIdWiseModuleNameData.hasOwnProperty(moduleId) ? moduleIdWiseModuleNameData[moduleId] : "";
                  let moduleKey = moduleIdWiseModuleKeyData.hasOwnProperty(moduleId) ? moduleIdWiseModuleKeyData[moduleId] : "";
                  let tmpJsonObject = {};
                  tmpJsonObject["module_name"] = moduleName;
                  tmpJsonObject["module_key"] = moduleKey;
                  tmpJsonObject["operations"] = operations;
                  modulesRightsDetails[moduleId] = tmpJsonObject;
                }
              }
            }
          }
        }
      }
    }

    const userGroupModuleRightsValues = Object.values(userGroupWiseModuleRightIdWithModuleId);

    for (let i = 0; i < userGroupModuleRightsValues.length; i++) {
      const userRightsData = createJSONObjectForUserRights(userGroupModuleRightsValues[i]);
      jsonObjectUserGroupRightsData.push(userRightsData);
    }
    logger.info("UserRightsServices ---> getUserRights ---> End.");
    return jsonObjectUserGroupRightsData;
  } catch (error) {
    logger.error("UserRightsServices ---> getUserRights ---> Error: ", error);
    throw error;
  }
};

function createJSONObjectForUserRights(userGroupWiseModuleRightIdWithModuleId) {
  let tmpJsonObjectForUserRights = {
    user_group_id: userGroupWiseModuleRightIdWithModuleId["user_group_id"],
    rights: {
      all_rights: [],
      module_rights_detail: {},
    },
    module_rights: []
  };

  for (const moduleId in userGroupWiseModuleRightIdWithModuleId) {
    if (moduleId !== "user_group_id") {
      const moduleData = userGroupWiseModuleRightIdWithModuleId[moduleId];
      tmpJsonObjectForUserRights["rights"]["all_rights"].push(moduleData["module_name"]);
      tmpJsonObjectForUserRights["rights"]["module_rights_detail"][moduleId] = {
        id: parseInt(moduleId),
        module_name: moduleData["module_name"],
        module_key: moduleData["module_key"],
        operations: moduleData["operations"],
      };
      const moduleRights = {
        module_id: parseInt(moduleId),
        operation_rights: moduleData["operations"],
      };
      tmpJsonObjectForUserRights["module_rights"].push(moduleRights);
    }
  }

  return tmpJsonObjectForUserRights;
}

const getUserGroupId = async (req) => {
  try {
    const { userId } = req
    logger.info("UserRightsServices ---> getUserGroupId ---> Reached.");

    const userGroupId = await User.findOne({
      where: { id: userId },
      attributes: ['user_group_id']
    });

    logger.info("UserRightsServices ---> getUserGroupId ---> End.");
    if (userGroupId) {
      return userGroupId.user_group_id;
    }
  } catch (error) {
    logger.error("UserRightsServices ---> getUserGroupId ---> Error: ", error);
    throw error;
  }
};

module.exports = {
  getUserRights,
  getGroups,
  getModules,
  crateUserGroups,
  getOperations,
  getUserGroups,
  editUserGroupById,
  deleteUserGroupById,
  getUserGroupId
};


