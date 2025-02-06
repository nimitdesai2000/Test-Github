const dbconfig = require("../config/dbconfig/dbconfigmain");
const { Tag, Sequelize } = dbconfig.models;
const logger = require("../config/logger/logger.config")

/**
 * @desc Method to create new Tag
 * @param {Object} tagdata 
 */
const createTagService = async (tagdata) => {
    logger.info("TagService : createTagService Reached...........");
    const { tag_name, companyId, userId } = tagdata;
    await Tag.create({
        tag_name: tag_name,
        company_id: companyId,
        created_by: userId,
    });
    logger.info("TagService : createTagService End...........");
    return { result: 1 }
};

/**
 * @desc Method to Get All Tag Data
 * @param {Object} alltagdata 
 */
const getAllTagsService = async (alltagdata) => {
    logger.info("TagService: getAllTagsService Reached...........");
    const { companyId, limit, offset } = alltagdata;

    // Check if limit and offset are provided
    const intLimit = limit ? parseInt(limit) : null;
    const intOffset = offset ? parseInt(offset) : null;
    let tag;
    if (intOffset !== null) {
        // Calculate offset based on page number and page size
        // const setOffset = (intOffset - 1) * intLimit;

        // Retrieve tags with pagination
        tag = await Tag.findAndCountAll({
            where: { company_id: companyId },
            offset: intOffset,
            limit: intLimit,
            order: [["id", "DESC"]]
        });
    } else {
        // Retrieve all tags if limit and offset are not provided
        tag = await Tag.findAndCountAll({
            where: { company_id: companyId },
            order: [["id", "DESC"]]
        });
    }
    logger.info("TagService: getAllTagsService End...........");
    return { data: tag };
};


/**
 * @desc Method to Get Tag By Id
 * @param {Object} tagbyid 
 */
const getTagByIdService = async (tagbyid) => {
    logger.info("TagService : getTagByIdService Reached...........");
    const { tagId, companyId } = tagbyid;
    const tag = await Tag.findOne({
        where: { id: tagId, company_id: companyId }
    });
    if (tag === null) {
        return { data: 0 }
    } else {
        logger.info("TagService : getTagByIdService End...........");
        return { data: tag };
    }
};

/**
 * @desc Method to Edit Tag By Id
 * @param {Object} tagById
 */
const editTagByIdService = async (tagById) => {
    logger.info("TagService : editTagByIdService Reached...........");
    const { tag_name, tagId, companyId, userId } = tagById;
    const existingTag = await Tag.findOne({ where: { id: tagId, company_id: companyId } });

    if (existingTag === null) {
        return { result: 0 }
    }

    existingTag.tag_name = tag_name;
    existingTag.company_id = companyId;
    existingTag.modified_by = userId;
    existingTag.modified_date = Date.now();

    await existingTag.save();
    logger.info("TagService : editTagByIdService End...........");
    return { result: 1 };
};


/**
 * @desc Method to Delete Tag By Id
 * @param {Object} deleteTag
 */
const deleteTagByIdService = async (deleteTag) => {
    logger.info("TagService : deleteTagByIdService Reached...........");

    const { tagId, companyId } = deleteTag
    const existingTag = await Tag.findOne({
        where: { id: tagId, company_id: companyId },
    });

    if (existingTag === null) {
        return { result: 0 }
    }

    await existingTag.destroy()
    logger.info("TagService : deleteTagByIdService End...........");
    return { result: 1 };
}

const getTagCount = async (request, response) => {
    logger.info("TagService : getTagCount Reached...........");
    const { companyId } = request;
    const tagCount = await Tag.count({
        where: { company_id: companyId },
    });
    logger.info("TagService : getTagCount End...........");
    return tagCount;
};

const getQuestionTagsName = async (uniqueQuestionTagsSet) => {
    try {
        const questionTagsName = await Tag.findAll({
            where: {
                id: {
                    [Sequelize.Op.in]: Array.from(uniqueQuestionTagsSet),
                },
            },
            attributes: ["tag_name", "id"],
        });
        return questionTagsName;
    } catch (error) {
        console.error("Error during question upvotes:", error);
    }
}

const getArticleTagsName = async (uniqueArticleTagsSet) => {
    try {
        const questionTagsName = await Tag.findAll({
            where: {
                id: {
                    [Sequelize.Op.in]: Array.from(uniqueArticleTagsSet),
                },
            },
            attributes: ["tag_name", "id"],
        });
        return questionTagsName;
    } catch (error) {
        console.error("Error during question upvotes:", error);
    }
}

const getTagCountService = async (data) => {
    try {
        const { companyId } = data;
        const tagCount = await Tag.count({
            where: { company_id: companyId },
        });
        return tagCount;
    } catch (error) {
        console.error("Error during getTagCountService:", error);
    }
};

module.exports = {
    createTagService,
    getAllTagsService,
    getTagByIdService,
    editTagByIdService,
    deleteTagByIdService,
    getTagCount,
    getQuestionTagsName,
    getArticleTagsName,
    getTagCountService
};
