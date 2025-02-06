const dbconfig = require("../config/dbconfig/dbconfigmain.js");
const { Icon } = dbconfig.models;
const logger = require("../config/logger/logger.config");

/**
 * @desc Method to create new Icon
 * @param {Object} insertdata 
 */
const createIconService = async (insertdata) => {
    logger.info("IconService : createIconService Reached...........");
    const { icon_name, unique_identifier, icon_image_name, icon_image, companyId } = insertdata;
    await Icon.create({
        icon_name: icon_name,
        unique_identifier: unique_identifier,
        icon_image_name: icon_image_name,
        icon_image: icon_image,
        company_id: companyId
    });
    logger.info("IconService : createIconService End...........");
    return { result: 1 };
};

/**
 * @desc Method to Get All Icons
 * @param {Object} getallicons
 */
const getAllIconsService = async (getallicons) => {
    try {
        logger.info("IconService : getAllIconsService Reached...........");
        const { companyId } = getallicons;

        const icon = await Icon.findAll({
            where: { company_id: companyId },
        });

        let iconObject = {}
        let iconDataArray = []
        let iconPath = "http://localhost:3001/supportfiles/icons/"

        icon.forEach((item) => {
            iconObject = {
                id: item.id,
                icon_path: `${iconPath}${item.id}/${item.icon_image_name}`,
                icon_name: item.icon_name
            };
            iconDataArray.push(iconObject);
        });

        logger.info("IconService : getAllIconsService End...........");
        return { data: iconDataArray };
    } catch (error) {
        logger.error("Error during get all tags:", error);
    }
};

module.exports = { createIconService, getAllIconsService };