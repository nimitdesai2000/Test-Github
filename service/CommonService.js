const dotenv = require("dotenv");
const dbconfig = require("../config/dbconfig/dbconfigmain");
const { Language, TimeZone, User, Company, Product, Icon,Entity,Group,Module,UserGroup,ModuleRights,ModuleOperationRights,OperationType } = dbconfig.models;
const logger = require("../config/logger/logger.config");
const initialData = require("../helpers/initialdata");
const redisClient = require("../config/dbconfig/cachedbconfig/redisconfig.js");
dotenv.config();

const getAllLanguage = async () => {
  try {
    logger.info("CommonServices ---> getAllLanguage ---> Reached.");
    const language = await Language.findAndCountAll({
      where: {}
    });
    logger.info("CommonServices ---> getAllLanguage ---> End.");
    return { data: language };
  } catch (error) {
    logger.error("CommonServices ---> getAllLanguage ---> Error: ", error);
    throw error;
  }
};

const getAllTimeZone = async () => {
  try {
    logger.info("CommonServices ---> getAllTimeZone ---> Reached.");
    const timezone = await TimeZone.findAndCountAll({
      where: {},
    });
    logger.info("CommonServices ---> getAllTimeZone ---> End.");
    return { data: timezone };
  } catch (error) {
    logger.error("CommonServices ---> getAllTimeZone ---> Error: ", error);
    throw error;
  }
};



const initializeCompany = async (req, res) => {
  let company;
  let initialCompanyFromInitialDataFile = initialData.companyData;
  let initialCompanyNameData = initialData.companyData.map((companyDomain) => companyDomain.company_domain);
  let initialCompanyData = [];
  let tmpInitialCompanyData;
  let companyDataToBeInserted;
  let companyData = {};
  let companyIdsArray = [];
  let newCompanyIdsArray = [];

  try {
      for (let j = 0; j < initialCompanyFromInitialDataFile.length; j++) {
        tmpInitialCompanyData = {
          company_name: initialCompanyFromInitialDataFile[j].company_name,
          company_domain: initialCompanyFromInitialDataFile[j].company_domain,
        };
        initialCompanyData.push(tmpInitialCompanyData);
      }

      company = await Company.findAll({
      where: { company_domain: initialCompanyNameData },
    });

    if (company) {
      companyDataToBeInserted = initialCompanyData.filter((item2) =>!company.some((item1) =>
      item1.dataValues.company_domain == item2.company_domain && 
      item1.dataValues.company_name == item2.company_name
      )
      );
    } 
    else {
      companyDataToBeInserted = initialCompanyData;
    }
    
    const addCompanyBulk = await Company.bulkCreate(companyDataToBeInserted);
    for(let i=0;i<addCompanyBulk.length;i++) {
      newCompanyIdsArray.push(addCompanyBulk[i].id)
    }
    companyData = await Company.findAll({});
    if (companyData) {
      for (let i = 0; i < companyData.length; i++) {
        companyIdsArray.push(companyData[i].id);
      }
    }

    return {company_id_array:companyIdsArray,new_company_ids_array:newCompanyIdsArray};
  } catch (error) {
    logger.error("Error adding Company:", error);
    throw error;
  }
};

const initializeProduct = async (companyIdsArray) => {
  let product;
  let initialProductFromInitialDataFile = initialData.productData;
  let initialProductNameData = initialData.productData.map((product) => product.product_name);
  let initialProductData = [];
  let tmpInitialProductData;
  let productDataToBeInserted;

  try {
    for (let i = 0; i < companyIdsArray.length; i++) {
      for (let j = 0; j < initialProductFromInitialDataFile.length; j++) {
        tmpInitialProductData = {
          product_name: initialProductFromInitialDataFile[j].product_name,
          product_key: initialProductFromInitialDataFile[j].product_key,
          company_id: companyIdsArray[i],
        };
        initialProductData.push(tmpInitialProductData);
      }
    }

    product = await Product.findAll({
      where: { product_name: initialProductNameData },
    });

    if (product) {
      productDataToBeInserted = initialProductData.filter((item2) =>!product.some((item1) =>
      item1.dataValues.product_name == item2.product_name &&
      item1.dataValues.product_key == item2.product_key &&
      item1.dataValues.company_id == item2.company_id
      )
      );
    } 
    else {
      productDataToBeInserted = initialProductData;
    }

    const addProductsBulk = await Product.bulkCreate(productDataToBeInserted);

    return addProductsBulk;
  } catch (error) {
    logger.error("Error adding Product:", error);
    throw error;
  }
};

const initializeLanguage = async (companyIdsArray) => {
  let language;
  let initialLanguageFromInitialDataFile = initialData.languageData;
  let initialLanguageNameData = initialData.languageData.map((language) => language.language_name);
  let initialLanguageData = [];
  let tmpInitialLanguageData;
  let languageDataToBeInserted;

  try {
      for (let j = 0; j < initialLanguageFromInitialDataFile.length; j++) {
        tmpInitialLanguageData = {
          language_name: initialLanguageFromInitialDataFile[j].language_name,
        };
        initialLanguageData.push(tmpInitialLanguageData);
      }

      language = await Language.findAll({
      where: { language_name: initialLanguageNameData },
    });

    if (language) {
      languageDataToBeInserted = initialLanguageData.filter((item2) =>!language.some((item1) =>
      item1.dataValues.language_name == item2.language_name
      )
      );
    } 
    else {
      languageDataToBeInserted = initialLanguageData;
    }
    
    const addCompanyBulk = await Language.bulkCreate(languageDataToBeInserted);

    return addCompanyBulk;
  } catch (error) {
    logger.error("Error adding Language:", error);
    throw error;
  }
};

const initializeIcons = async (companyIdsArray) => {
  let icon;
  let initialIconsFromInitialDataFile = initialData.iconData;
  let initialIconsNameData = initialData.iconData.map((icon) => icon.icon_name);
  let initialCompanyData = [];
  let tmpInitialIconsData;
  let iconsDataToBeInserted;

  try {
    for (let i = 0; i < companyIdsArray.length; i++) {
      for (let j = 0; j < initialIconsFromInitialDataFile.length; j++) {
        tmpInitialIconsData = {
          icon_name: initialIconsFromInitialDataFile[j].icon_name,
          unique_identifier: initialIconsFromInitialDataFile[j].unique_identifier,
          icon_image_name:initialIconsFromInitialDataFile[j].icon_image_name,
          company_id: companyIdsArray[i],
        };
        initialCompanyData.push(tmpInitialIconsData);
      }
    }

    icon = await Icon.findAll({
      where: { icon_name: initialIconsNameData },
    });

    if (icon) {
      iconsDataToBeInserted = initialCompanyData.filter((item2) =>!icon.some((item1) =>
      item1.dataValues.icon_name == item2.icon_name &&
      item1.dataValues.unique_identifier == item2.unique_identifier &&
      item1.dataValues.icon_image_name == item2.icon_image_name &&
      item1.dataValues.company_id == item2.company_id
      )
      );
    } 
    else {
      iconsDataToBeInserted = initialCompanyData;
    }

    const addIconsBulk = await Icon.bulkCreate(iconsDataToBeInserted);

    return addIconsBulk;
  } catch (error) {
    logger.error("Error adding Icon:", error);
    throw error;
  }
};

const initializeTimezone = async (companyIdsArray) => {
  let timezone;
  let initialTimeZoneFromInitialDataFile = initialData.timezoneData;
  let initialTimeZoneNameData = initialData.timezoneData.map((timezone) => timezone.timezone_identifier);
  let initialTimeZoneData = [];
  let tmpInitialTimeZoneData;
  let timeZoneDataToBeInserted;

  try {
      for (let j = 0; j < initialTimeZoneFromInitialDataFile.length; j++) {
        tmpInitialTimeZoneData = {
          timezone_identifier: initialTimeZoneFromInitialDataFile[j].timezone_identifier,
          utc_offset: initialTimeZoneFromInitialDataFile[j].utc_offset,
        };
        initialTimeZoneData.push(tmpInitialTimeZoneData);
      }

      timezone = await TimeZone.findAll({
      where: { timezone_identifier: initialTimeZoneNameData },
    });

    if (timezone) {
      timeZoneDataToBeInserted = initialTimeZoneData.filter((item2) =>!timezone.some((item1) =>
      item1.dataValues.timezone_identifier == item2.timezone_identifier && 
      item1.dataValues.utc_offset == item2.utc_offset
      )
      );
    } 
    else {
      timeZoneDataToBeInserted = initialTimeZoneData;
    }
    
    const addTimeZoneBulk = await TimeZone.bulkCreate(timeZoneDataToBeInserted);

    return addTimeZoneBulk;
  } catch (error) {
    logger.error("Error adding Timezone:", error);
    throw error;
  }
};

const initializeGroupData = async (companyIdsArray) => {
  let group;
  let initialGroupFromInitialDataFile = initialData.groupData;
  let initialGroupNameData = initialData.groupData.map((group) => group.group_name);
  let initialGroupData = [];
  let tmpInitialGroupData;
  let groupDataToBeInserted;

  try {
    for (let i = 0; i < companyIdsArray.length; i++) {
      for (let j = 0; j < initialGroupFromInitialDataFile.length; j++) {
        tmpInitialGroupData = {
          group_name: initialGroupFromInitialDataFile[j].group_name,
          level: initialGroupFromInitialDataFile[j].level,
          company_id: companyIdsArray[i],
        };
        initialGroupData.push(tmpInitialGroupData);
      }
    }

    group = await Group.findAll({
      where: { group_name: initialGroupNameData },
    });

    if (group) {
      groupDataToBeInserted = initialGroupData.filter((item2) =>!group.some((item1) =>
      item1.dataValues.group_name == item2.group_name &&
      item1.dataValues.level == item2.level &&
      item1.dataValues.company_id == item2.company_id
      )
      );
    } 
    else {
      groupDataToBeInserted = initialGroupData;
    }

    const addGroupsBulk = await Group.bulkCreate(groupDataToBeInserted);

    return addGroupsBulk;
  } catch (error) {
    logger.error("Error adding Groups:", error);
    throw error;
  }
};

const initializeModuleData = async (companyIdsArray) => {
  let module;
  let initialModuleFromInitialDataFile = initialData.moduleData;
  let initialModuleNameData = initialData.moduleData.map((module) => module.module_name);
  let initialModuleData = [];
  let tmpInitialModuleData;
  let moduleDataToBeInserted;

  try {
    for (let i = 0; i < companyIdsArray.length; i++) {
      for (let j = 0; j < initialModuleFromInitialDataFile.length; j++) {
        tmpInitialModuleData = {
          module_name: initialModuleFromInitialDataFile[j].module_name,
          module_key: initialModuleFromInitialDataFile[j].module_key,
          company_id: companyIdsArray[i],
        };
        initialModuleData.push(tmpInitialModuleData);
      }
    }

    module = await Module.findAll({
      where: { module_name: initialModuleNameData },
    });

    if (module) {
      moduleDataToBeInserted = initialModuleData.filter((item2) =>!module.some((item1) =>
      item1.dataValues.module_name == item2.module_name &&
      item1.dataValues.module_key == item2.module_key &&
      item1.dataValues.company_id == item2.company_id
      )
      );
    } 
    else {
      moduleDataToBeInserted = initialModuleData;
    }

    const addModulesBulk = await Module.bulkCreate(moduleDataToBeInserted);

    return addModulesBulk;
  } catch (error) {
    logger.error("Error adding Modules:", error);
    throw error;
  }
};

const initializeOperationTypeData = async (companyIdsArray) => {
  let operationType;
  let initialOperationTypeFromInitialDataFile = initialData.operationTypeData;
  let initialOperationTypeNameData = initialData.operationTypeData.map((operationType) => operationType.operation_name);
  let initialOperationTypeData = [];
  let tmpInitialOperationTypeData;
  let operationTypeDataToBeInserted;

  try {
    for (let i = 0; i < companyIdsArray.length; i++) {
      for (let j = 0; j < initialOperationTypeFromInitialDataFile.length; j++) {
        tmpInitialOperationTypeData = {
          operation_name: initialOperationTypeFromInitialDataFile[j].operation_name,
          unique_identifier: initialOperationTypeFromInitialDataFile[j].unique_identifier,
          company_id: companyIdsArray[i],
        };
        initialOperationTypeData.push(tmpInitialOperationTypeData);
      }
    }

    operationType = await OperationType.findAll({
      where: { operation_name: initialOperationTypeNameData },
    });

    if (operationType) {
      operationTypeDataToBeInserted = initialOperationTypeData.filter((item2) =>!operationType.some((item1) =>
      item1.dataValues.operation_name == item2.operation_name &&
      item1.dataValues.unique_identifier == item2.unique_identifier &&
      item1.dataValues.company_id == item2.company_id
      )
      );
    } 
    else {
      operationTypeDataToBeInserted = initialOperationTypeData;
    }

    const addOperationTypeBulk = await OperationType.bulkCreate(operationTypeDataToBeInserted);

    return addOperationTypeBulk;
  } catch (error) {
    logger.error("Error adding Operation Types:", error);
    throw error;
  }
};

/**
  @desc Method to create Article, Questions Unique Key
        It is Based On Product key
  @param {String} companyId 
  @param {String} productId 
  @param {String} entity_type 
 */

const getUniqueKey = async (companyId, productId, entity_type) => {
  try {
    logger.info("CommonService ---> getUniqueKey ---> Reached.");

    let rediskey = "COMPANY_" + entity_type + "_KEY_" + companyId;

    const entityData = await redisClient.hGetAll(rediskey);

    let value = "";
    let entityName;
    let productKeyWithId;
    let currentUniqueKeyId;
    let currentUniqueNumber;
    let productKey;

    if (Object.keys(entityData).length > 0) {

      productKeyWithId = await redisClient.hGet(rediskey, productId);

      if (productKeyWithId) {

        currentUniqueKeyId = entityData[productId];
        currentUniqueNumber = parseInt(currentUniqueKeyId.split('-')[1]);
        productKey = productKeyWithId.split('-')[0];

        if (currentUniqueNumber) {
          const newUniqueKeyId = `${productKey}-${currentUniqueNumber + 1}`;

          redisClient.hDel(rediskey, productId);
          redisClient.hSet(rediskey, productId, newUniqueKeyId);
          value = await redisClient.hGet(rediskey, productId);
        }
        
      } else {

        entityName = await getProductKeyNameById(companyId, productId);
        if (entityName) {
          redisClient.hSet(rediskey, productId, `${entityName}-1`);
          value = await redisClient.hGet(rediskey, productId);
        }
      }      
    } else {

      entityName = await getProductKeyNameById(companyId, productId);

      if (entityName) {

        redisClient.hSet(rediskey, productId, `${entityName}-1`);
        value = await redisClient.hGet(rediskey, productId);
      }
    }
    logger.info(`CommonService ---> getUniqueKey ---> End With Id: ${value}`);
    return value;

  } catch (error) {
    logger.error("CommonService ---> getUniqueKey ---> Error: ", error);
    throw error;
  }
};


const getProductKeyNameById = async (companyId, productId) => {
  try {
    logger.info("CommonService ---> getProductKeyNameById ---> Reached.");

    const productKeyName = await Product.findOne({
      where: {
        id: productId,
        company_id: companyId
      },
      attributes: ['id', 'product_key'],
    });

    logger.info(`CommonService ---> getProductKeyNameById ---> End With Product Name: ${productKeyName.dataValues.product_key}`);
    return productKeyName.dataValues.product_key;

  } catch (error) {

    logger.error("CommonService ---> getProductKeyNameById ---> Error: ", error);
    throw error;
  }
};

const initializeEntityData= async ()=>{
  try{
    logger.info("CommonService ---> initializeEntityData ---> Reached.");
    var entityData= await Entity.findAll();
    const commonData=initialData.Entity_Data.filter(obj=>!entityData.some(item=>obj.table_name==item.table_name))
    const insertDataIntoEntity=await Entity.bulkCreate(commonData);
    const entityJson={};
    entityData= await Entity.findAll();
    entityData.map((entity)=>entityJson[entity.table_name]=entity.id)
    redisClient.set("ENTITY_DATA",JSON.stringify(entityJson));
    logger.info("CommonService ---> initializeEntityData ---> Reached.");
  }catch(error){
    logger.error("CommonService ---> getProductKeyNameById ---> Error: ", error);
    throw error;
  }
}

const initializeUserGroupData= async (companyIdsArray)=>{
  let defaultAdminGroupLevel = process.env.DEFAULT_ADMIN_USER_GROUP_LEVEL;
  let initialUserGroupFromInitialDataFile = initialData.userGroupData;
  let initialUserGroupData = [];
  let tmpInitialUserGroupData;
  let userGroupDataToBeInserted;
  let groupData;
  let companyIdWiseAdminGroupId={};

  try {
    groupData = await Group.findAll({
      where: {
      level: defaultAdminGroupLevel,
      company_id: companyIdsArray
    },})

    if(groupData) {
      for(let i=0;i<groupData.length;i++) {
        companyIdWiseAdminGroupId[groupData[i].company_id] = groupData[i].id;
      }
    }

    if(companyIdWiseAdminGroupId) {
      for (let i = 0; i < companyIdsArray.length; i++) {
        for (let j = 0; j < initialUserGroupFromInitialDataFile.length; j++) {
          tmpInitialUserGroupData = {
            user_group_name: initialUserGroupFromInitialDataFile[j].user_group_name,
            group_id: companyIdWiseAdminGroupId[companyIdsArray[i]],
            created_date: Date.now(),
            company_id: companyIdsArray[i],
          };
          initialUserGroupData.push(tmpInitialUserGroupData);
        }
      }
      userGroupDataToBeInserted = initialUserGroupData;
    }

    const addUserGroupBulk = await UserGroup.bulkCreate(userGroupDataToBeInserted);

    return addUserGroupBulk;
  }catch(error){
    logger.error("CommonService ---> initializeUserGroupData ---> Error: ", error);
    throw error;
  }
}

const initializeUserData= async (companyIdsArray)=>{
  let defaultUserGroupName = process.env.DEFAULT_USER_GROUP;
  let initialUserFromInitialDataFile = initialData.userData;
  let initialUserData = [];
  let tmpInitialUserData;
  let userDataToBeInserted;
  let userGroupData;
  let companyIdWiseUserGroupId={};

  try {
    userGroupData = await UserGroup.findAll({
      where: {
      user_group_name: defaultUserGroupName,
      company_id: companyIdsArray
    },})

    if(userGroupData) {
      for(let i=0;i<userGroupData.length;i++) {
        companyIdWiseUserGroupId[userGroupData[i].company_id] = userGroupData[i].id;
      }
    }

    if(companyIdWiseUserGroupId) {
      for (let i = 0; i < companyIdsArray.length; i++) {
        for (let j = 0; j < initialUserFromInitialDataFile.length; j++) {
          tmpInitialUserData = {
            name: initialUserFromInitialDataFile[j].name,
            email: initialUserFromInitialDataFile[j].email,
            password: initialUserFromInitialDataFile[j].password,
            user_group_id: companyIdWiseUserGroupId[companyIdsArray[i]],
            created_date: Date.now(),
            company_id: companyIdsArray[i],
          };
          initialUserData.push(tmpInitialUserData);
        }
      }
      userDataToBeInserted = initialUserData;
    }

    const addUserBulk = await User.bulkCreate(userDataToBeInserted);

    return addUserBulk;
  }catch(error){
    logger.error("CommonService ---> initializeUserData ---> Error: ", error);
    throw error;
  }
}

const initializeModuleRightsAndModuleOperationRights= async (companyIdsArray,userGroupJSON)=>{
  let moduleRightsData = [];
  let tmpModuleRightsObjectData;
  let companyWiseModuleDataArray = {};
  let tmpCmpnayModuleOperatinType;

  let moduleData;

  try {
    moduleData = await Module.findAll({
      where: {
      company_id: companyIdsArray
    },})

    if(moduleData) {
      for(let i=0;i<moduleData.length;i++) {
        if(companyWiseModuleDataArray.hasOwnProperty(moduleData[i].company_id)) {
          tmpCmpnayModuleOperatinType = companyWiseModuleDataArray[moduleData[i].company_id];
          tmpCmpnayModuleOperatinType.push(moduleData[i].id)
          companyWiseModuleDataArray[moduleData[i].company_id] = tmpCmpnayModuleOperatinType
        }
        else {
          companyWiseModuleDataArray[moduleData[i].company_id] = [moduleData[i].id];
        }
      }
        
        for(let i=0;i<userGroupJSON.length;i++) {
          if(companyWiseModuleDataArray.hasOwnProperty(userGroupJSON[i].company_id)) {
            tmpCmpnayModuleOperatinType = companyWiseModuleDataArray[userGroupJSON[i].company_id]
            for (let j = 0; j < tmpCmpnayModuleOperatinType.length; j++) {
              tmpModuleRightsObjectData = {
                user_group_id: userGroupJSON[i].id,
                module_id: tmpCmpnayModuleOperatinType[j],
                company_id: userGroupJSON[i].company_id,
              };
              moduleRightsData.push(tmpModuleRightsObjectData);
            }
          }
        }
    }

    const addModuleRightsBulk = await ModuleRights.bulkCreate(moduleRightsData);
    if(addModuleRightsBulk) {
      initializeModuleOperationRights(companyIdsArray,addModuleRightsBulk);
    }

    return addModuleRightsBulk;
  }catch(error){
    logger.error("CommonService ---> initializeModuleRightsAndModuleOperationRights ---> Error: ", error);
    throw error;
  }
}

const initializeModuleOperationRights= async (companyIdsArray,moduleRightsJSON)=>{
  let moduleOperationRightsData = [];
  let tmpModuleOpeationRightsObjectData;
  let operationTypeData;
  let companyWiseOperationTypeArray = {};
  let tmpCmpnayOpeartionType;

  try {
    operationTypeData = await OperationType.findAll({
      where: {
      company_id: companyIdsArray
    },})

    if(operationTypeData) {
      for(let i=0;i<operationTypeData.length;i++) {
        if(companyWiseOperationTypeArray.hasOwnProperty(operationTypeData[i].company_id)) {
          tmpCmpnayOpeartionType = companyWiseOperationTypeArray[operationTypeData[i].company_id];
          tmpCmpnayOpeartionType.push(operationTypeData[i].unique_identifier)
          companyWiseOperationTypeArray[operationTypeData[i].company_id] = tmpCmpnayOpeartionType
        }
        else {
          companyWiseOperationTypeArray[operationTypeData[i].company_id] = [operationTypeData[i].unique_identifier];
        }
      }
        
        for(let i=0;i<moduleRightsJSON.length;i++) {
          if(companyWiseOperationTypeArray.hasOwnProperty(moduleRightsJSON[i].company_id)) {
            tmpCmpnayOpeartionType = companyWiseOperationTypeArray[moduleRightsJSON[i].company_id]
            for (let j = 0; j < tmpCmpnayOpeartionType.length; j++) {
              tmpModuleOpeationRightsObjectData = {
                module_rights_id: moduleRightsJSON[i].id,
                operation_id: tmpCmpnayOpeartionType[j],
                company_id: moduleRightsJSON[i].company_id,
              };
              moduleOperationRightsData.push(tmpModuleOpeationRightsObjectData);
            }

          }
        }
    }

    const addModuleOperationRightsBulk = await ModuleOperationRights.bulkCreate(moduleOperationRightsData);

    return addModuleOperationRightsBulk;
  }catch(error){
    logger.error("CommonService ---> initializeModuleOperationRights ---> Error: ", error);
    throw error;
  }
}




module.exports = {
  getAllLanguage,
  getAllTimeZone,
  initializeCompany,
  initializeProduct,
  initializeLanguage,
  initializeIcons,
  initializeTimezone,
  getUniqueKey,
  initializeEntityData,
  initializeGroupData,
  initializeModuleData,
  initializeOperationTypeData,
  initializeUserGroupData,
  initializeUserData,
  initializeModuleRightsAndModuleOperationRights
};
