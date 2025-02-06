const { APIResponse } = require("../utility/apihandler/APIResponse");
const { HttpStatusCode } = require("../utility/HttpStatusCode");
const { Result } = require("../utility/Result");
const logger = require("../config/logger/logger.config");
const {
    createTagService,
    getAllTagsService,
    getTagByIdService,
    editTagByIdService,
    deleteTagByIdService,
    getTagCountService
} = require("../service/TagService");

const createTag = async (request, response) => {
    try {
        const { tag_name, companyId, userId } = request.body;
        const { result } = await createTagService({ tag_name, companyId, userId });
        if (result === 1) {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('tag.add.success'))
        }
    }
    catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

const getAllTags = async (request, response) => {
    try {
        const { companyId } = request.body;
        const { offset, limit } = request.query;
        const { data } = await getAllTagsService({ companyId, offset, limit });
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data);
    } catch (error) {
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

const getTagById = async (request, response) => {
    try {
        const tagId = request.params.id;
        const { companyId } = request.body;

        const { data } = await getTagByIdService({ tagId, companyId });
        if (data == 0) {
            APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('tag.notFound.error'));
        } else {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data);
        }
    } catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

const editTagById = async (request, response) => {
    try {
        const { tag_name, companyId, userId } = request.body;
        const tagId = request.params.id;

        const { result } = await editTagByIdService({ tag_name, tagId, companyId, userId });
        if (result == 1) {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('tag.edit.success'));
        } else {
            APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('tag.notFound.error'));
        }
    } catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

const deleteTagById = async (request, response) => {
    try {
        const { companyId } = request.body
        const tagId = request.params.id;

        const { result } = await deleteTagByIdService({ tagId, companyId });
        if (result == 1) {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('tag.delete.success'));
        } else {
            APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('tag.notFound.error'));
        }
    } catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};


const getTagCount = async (request, response) => {
    try {
        const { companyId } = request.body;
        const data = await getTagCountService({ companyId });
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data);
    } catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

module.exports = { createTag, getAllTags, getTagById, editTagById, deleteTagById, getTagCount }