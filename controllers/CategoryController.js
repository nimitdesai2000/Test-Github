const logger = require("../config/logger/logger.config");
const { createCategory, getAllCategories, getCategoryById, editCategoryById, deleteCategoryById } = require("../service/CategoryService");
const { APIResponse } = require("../utility/apihandler/APIResponse");
const { HttpStatusCode } = require("../utility/HttpStatusCode");
const { Result } = require("../utility/Result");

exports.createCategory = async (request, response) => {
    try {
        logger.info("CategoryController ---> createCategory ---> Reached.");
        const categoryData = request.body;
        await createCategory(categoryData);
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('category.add.success'));
        logger.info("CategoryController ---> createCategory ---> End.");
    }
    catch (error) {
        logger.error("CategoryController ---> createCategory ---> Error: ", error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
    }
};

exports.getAllCategories = async (request, response) => {
    try {
        logger.info("CategoryController ---> getAllCategory ---> Reached.");
        const { companyId } = request.body;
        const { limit, offset, content } = request.query;
        const { data } = await getAllCategories(companyId, limit, offset, content);
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('category.get.success'));
        logger.info("CategoryController ---> getAllCategory ---> End.");
    } catch (error) {
        logger.error("CategoryController ---> getAllCategory ---> Error: ", error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
    }
};

exports.getCategoryById = async (request, response) => {
    try {
        logger.info("CategoryController ---> getCategoryById ---> Reached.");
        const categoryId = request.params.id;
        const { companyId } = request.body;

        const { data } = await getCategoryById(categoryId, companyId);
        if (data == 0) {
            APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('category.notfound'));
        } else {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('category.get.success'));
        }
        logger.info("CategoryController ---> getCategoryById ---> End.");
    } catch (error) {
        logger.error("CategoryController ---> getCategoryById ---> Error: ", error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
    }
};

exports.editCategoryById = async (request, response) => {
    try {
        logger.info("CategoryController ---> editCategoryById ---> Reached.");
        const categoryData = request.body;
        const categoryId = request.params.id;

        const { result } = await editCategoryById(categoryData, categoryId);
        if (result == 1) {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('category.edit.success'));
        } else {
            APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('category.notfound'));
        }

        logger.info("CategoryController ---> editCategoryById ---> End.");
    } catch (error) {
        logger.error("CategoryController ---> editCategoryById ---> Error: ", error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
    }
};

exports.deleteCategoryById = async (request, response) => {
    try {
        logger.info("CategoryController ---> deleteCategoryById ---> Reached.");
        const categoryId = request.params.id;
        const { companyId } = request.body;

        const { result } = await deleteCategoryById(categoryId, companyId);
        if (result == 1) {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('category.delete.success'));
        } else {
            APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('category.notfound'));
        }
        logger.info("CategoryController ---> deleteCategoryById ---> End.");
    } catch (error) {
        logger.error("CategoryController ---> deleteCategoryById ---> Error: ", error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
    }
};