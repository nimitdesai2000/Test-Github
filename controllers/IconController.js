const logger = require("../config/logger/logger.config");
const { createIconService, getAllIconsService } = require("../service/IconService");
const { APIResponse } = require("../utility/apihandler/APIResponse");
const { HttpStatusCode } = require("../utility/HttpStatusCode");
const { Result } = require("../utility/Result");

const createIcon = async (request, response) => {
    try {
        const { icon_name, unique_identifier, icon_image_name, icon_image, companyId } = request.body;
        const { result } = await createIconService({ icon_name, unique_identifier, icon_image_name, icon_image, companyId });
        if (result === 1) {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('icon.add.success'))
        }
    }
    catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

const getAllIcons = async (request, response) => {
    try {
        const { companyId } = request.body;
        const { data } = await getAllIconsService({ companyId });
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data);
    } catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

module.exports = { createIcon, getAllIcons }