
const dbconfig = require("../config/dbconfig/dbconfigmain");
const { Category } = dbconfig.models;
const { Op } = require("sequelize");
const logger = require("../config/logger/logger.config");

/**
 * @desc Method to create new Category
 * @param {Object} categoryData 
 */
const createCategory = async (categoryData) => {
    logger.info("CategoryServices ---> createCategory ---> Reached.");
    const {
        category_name,
        active,
        companyId,
        userId
    } = categoryData;
    await Category.create({
        category_name: category_name,
        active: active,
        created_by: userId,
        company_id: companyId,
    });
    logger.info("CategoryServices ---> createCategory ---> End.");
};

const getAllCategories = async (companyId, limit, offset, content) => {
    try {
        logger.info("CategoryServices ---> getAllCategory ---> Reached.");
        const pageNumber = parseInt(limit, 10);
        const pageSize = parseInt(offset, 10);

        let config = {};
        let whereClause = {};
        whereClause["company_id"] = companyId;
        if (content != undefined && content != "") {
            whereClause["category_name"] = { [Op.like]: "%" + content + "%" }
        }
        config["where"] = whereClause;
        if (limit && offset) {
            config.limit = pageNumber;
            config.offset = pageSize;
        }

        // let likeClause = {};
        // likeClause["where"] = { "company_id": companyId };

        // if (content) {
        //     likeClause[$or] = [
        //         { 'category_name': { like: '%' + content + '%' } }
        //     ];
        // }


        const category = await Category.findAndCountAll(config);

        logger.info("CategoryServices ---> getAllCategory ---> End.");
        return { data: category };
    } catch (error) {
        logger.error("CategoryServices ---> getAllCategory ---> Error: ", error);
        throw error;
    }
};

const getCategoryById = async (categoryId, companyId) => {
    try {
        logger.info("CategoryServices ---> getCategoryById ---> Reached.");
        const category = await Category.findOne({
            where: { id: categoryId, company_id: companyId }
        });
        if (category === null) {
            return { data: 0 }
        } else {
            logger.info("CategoryServices ---> getCategoryById ---> End.");
            return { data: category }
        }
    } catch (error) {
        logger.error("CategoryServices ---> getCategoryById ---> Error: ", error);
        throw error;
    }
};

const editCategoryById = async (categoryData, categoryId) => {
    try {
        logger.info("CategoryServices ---> editCategoryById ---> Reached.");
        const {
            category_name,
            active,
            companyId,
            userId
        } = categoryData;

        const existingCategory = await Category.findOne({ where: { id: categoryId, company_id: companyId } });
        if (existingCategory === null) {
            return { result: 0 }
        }

        existingCategory.category_name = category_name;
        existingCategory.active = active;
        existingCategory.company_id = companyId;
        existingCategory.modified_date = Date.now();
        existingCategory.modified_by = userId;
        await existingCategory.save();
        logger.info("CategoryServices ---> editCategoryById ---> End.");
        return { result: 1 };
    } catch (error) {
        logger.error("CategoryServices ---> editCategoryById ---> Error: ", error);
        throw error;
    }
};

const deleteCategoryById = async (categoryId, companyId) => {
    try {
        logger.info("CategoryServices ---> deleteCategoryById ---> Reached.");
        const existingCategory = await Category.findOne({
            where: { id: categoryId, company_id: companyId },
        });

        if (existingCategory === null) {
            return { result: 0 }
        }

        await existingCategory.destroy();
        logger.info("CategoryServices ---> deleteCategoryById ---> End.");
        return { result: 1 };
    } catch (error) {
        logger.error("CategoryServices ---> deleteCategoryById ---> Error: ", error);
        throw error;
    }
};

const getCategoryCount = async (req, res) => {
    try {
        const { companyId } = req;
        const categoryCount = await Category.count({
            where: { company_id: companyId },
        });
        return categoryCount;
    } catch (error) {
        return APIResponse(res, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('tag.allTypes.error'));
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    editCategoryById,
    deleteCategoryById,
    getCategoryCount
};