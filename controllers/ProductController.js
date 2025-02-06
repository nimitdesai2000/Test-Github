const logger = require("../config/logger/logger.config");
const {
    createProductService,
    getAllProductsService,
    getProductByIdService,
    editProductByIdService,
    deleteProductByIdService,
    checkDuplicateProductKeyService,
    getProductCountService
} = require("../service/ProductService");
const { APIResponse } = require("../utility/apihandler/APIResponse");
const { HttpStatusCode } = require("../utility/HttpStatusCode");
const { Result } = require("../utility/Result");

const createProduct = async (request, response) => {
    try {
        const { product_name, product_key, product_icon_id, companyId, userId } = request.body;
        const { result } = await createProductService({ product_name, product_key, product_icon_id, companyId, userId });
        if (result === 1) {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('product.add.success'))
        }
    }
    catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

const getAllProducts = async (request, response) => {
    try {
        const { companyId } = request.body;
        const { offset, limit } = request.query;
        const { data } = await getAllProductsService({ companyId, offset, limit });
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data);
    } catch (error) {
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

const getProductById = async (request, response) => {
    try {
        const productId = request.params.id;
        const { companyId } = request.body;

        const { data } = await getProductByIdService({ productId, companyId });
        if (data == 0) {
            APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('product.notfound'));
        } else {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('product.fetch.success'));
        }
    } catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

const editProductById = async (request, response) => {
    try {
        const { product_name, product_key, product_icon_id, companyId, userId, modified_date } = request.body;
        const productId = request.params.id;

        const { result } = await editProductByIdService({ product_name, product_key, product_icon_id, companyId, userId, modified_date, productId });
        if (result == 1) {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('product.edit.success'));
        } else {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('product.notfound'));
        }
    } catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

const deleteProductById = async (request, response) => {
    try {
        const { companyId } = request.body
        const productId = request.params.id;

        const { result } = await deleteProductByIdService({ productId, companyId });
        if (result == 1) {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('product.delete.success'));
        } else {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('product.notfound'));
        }
    } catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

const checkDuplicateProductKey = async (request, response) => {
    try {
        const { companyId, product_key } = request.body;
        const { data } = await checkDuplicateProductKeyService({ companyId, product_key });
        if (data.length > 0) {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('product.duplicate.validate'));
        } else {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('product.notfound'));
        }
    } catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};

const getProductCount = async (request, response) => {
    try {
        const { companyId } = request.body;
        const data = await getProductCountService({ companyId });
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data);
    } catch (error) {
        logger.error(error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('somthing.went.wrong'));
    }
};


module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    editProductById,
    deleteProductById,
    checkDuplicateProductKey,
    getProductCount
};