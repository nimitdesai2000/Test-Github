const dbconfig = require("../config/dbconfig/dbconfigmain.js");
const { Article, User, Category, Tag } = dbconfig.models;
const Sequelize = require("sequelize");
const logger = require("../config/logger/logger.config");
const addArticleTags = require("../service/ArticleTagService.js");
const upvotesService = require("../service/ArticleUpvotesService.js");
const ArticleTagService = require("../service/ArticleTagService.js");
const tagService = require("../service/TagService.js");
const { Module } = require("../utility/Module.js");
const CommonService = require("../service/CommonService.js")
/**
 * @desc Method to create new Article
 * @param {Object} articledata 
 */
const createNewArticle = async (articledata) => {
  logger.info("ArticleService : createNewArticle Reached...........");

  const articleKey = await CommonService.getUniqueKey(articledata.companyId, articledata.product_id, Module.ARTICLE);

  const {
    title,
    description,
    product_id,
    tag_id,
    visibility,
    companyId,
    userId,
    tags,
    category
  } = articledata;

  Article.create({
    article_key: articleKey,
    title: title,
    description: description,
    product_id: product_id,
    tag_id: tag_id,
    visibility: visibility,
    company_id: companyId,
    created_by: userId,
    tags: tags,
    category_id: category
  }).then((createdArticle) => {
    articledata["article_id"] = createdArticle.id;
    addArticleTags.addArticleTags(articledata)
    //Add Data To EL
  });
};

const getAllArticles = async (req) => {
  const { companyId, offset, limit } = req;
  const intoffset = parseInt(offset);
  const intlimit = parseInt(limit);
  const articles = await Article.findAndCountAll({
    where: { company_id: companyId },
    limit: intlimit,
    offset: intoffset,
    include: [
      {
        model: User,
        as: "createdBy",
        attributes: ["name"],
      },
    ],
    order: [["id", "DESC"]],
  });
  return { data: articles };
};

const getArticleById = async (req) => {
  const { articleId, companyId } = req;
  const article = await Article.findOne({
    where: { id: articleId, company_id: companyId },
    include: [
      {
        model: User,
        as: "createdBy",
        attributes: ["id", "name", "email"],
      },
      {
        model: Tag,
        as: 'tags'
      }
    ],
  });
  return { data: article };
};

const getArticleByUserId = async (req) => {
  const { userId, offset, limit } = req;
  const intoffset = parseInt(offset);
  const intlimit = parseInt(limit);
  const articleCount = await Article.count({
    where: { created_by: userId },
  });
  const article = await Article.findAll({
    where: { created_by: userId },
    limit: intlimit,
    offset: intoffset,
    include: [
      {
        model: User,
        as: "createdBy",
        attributes: ["name"],
      },
      {
        model: Tag,
        as: 'tags'
      }
    ],
    order: [["id", "DESC"]],
  });
  const response = {
    article,
    count: articleCount,
  };
  return { data: response };

};

const editArticle = async (articleObject, articleId) => {
  try {
    logger.info("ArticleService ---> editArticle ---> Reached.");
    const {
      title,
      description,
      product_id,
      tags,
      visibility,
      companyId,
      userId,
      category,
      prevtags,
      tag_id
    } = articleObject;

    const existingArticle = await Article.findOne({ where: { id: articleId, company_id: companyId } });
    if (existingArticle === null) {
      return { result: 0 }
    }

    existingArticle.title = title;
    existingArticle.description = description;
    existingArticle.product_id = product_id;
    existingArticle.tag_id = tag_id;
    existingArticle.company_id = companyId;
    existingArticle.modified_date = Date.now();
    existingArticle.modified_by = userId;
    existingArticle.visibility = visibility;
    existingArticle.category_id = category;

    await existingArticle.save().then((createdArticle) => {
      articleObject["article_id"] = articleId;
      addArticleTags.editArticleTags(articleObject);
    });
    logger.info("ArticleService ---> editArticle ---> End.");
    return { result: 1 };
  } catch (error) {
    logger.error("ArticleService ---> editArticle ---> Error: ", error);
    throw error;
  }
};

const deleteArticle = async (req) => {
  try {
    logger.info("ArticleService ---> deleteArticle ---> Reached.");
    const { articleId, companyId } = req
    const existingArticle = await Article.findOne({ where: { id: articleId, company_id: companyId } });
    if (existingArticle === null) {
      return { result: 0 }
    }

    await existingArticle.destroy();
    logger.info("ArticleService ---> deleteArticle ---> End.");
    return { result: 1 }
  } catch (error) {
    logger.error("ArticleService ---> deleteArticle ---> Error: ", error);
    throw error;
  }
};

const getAllArticlesCount = async (req, res) => {
  const { companyId } = req;
  try {
    const articlesCount = await Article.count({
      where: { company_id: companyId },
    });
    return articlesCount;
  } catch (error) {
    console.error("Error during get all articles count:", error);
    return error;
  }
};

const getArticlesCountByUserId = async (req, res) => {
  const { userId, companyId } = req;
  try {
    const articlesCount = await Article.count({
      where: { company_id: companyId },
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: [],
          where: { id: userId },
        },
      ],
    });
    return articlesCount;
  } catch (error) {
    console.error("Error getting articles count by userId:", error);
    return error;
  }
};

const getLatestArticles = async (req, res) => {
  const { companyId, limit } = req;
  try {
    const options = {
      where: { company_id: companyId },
      order: [["created_date", "DESC"]],
    };
    if (req && limit && typeof limit === "number" && limit > 0) {
      options.limit = limit;
    }
    const latestArticles = await Article.findAll(options);
    return latestArticles;
  } catch (error) {
    console.error("Error getting latest articles count:", error);
    res.status(500).json(error);
  }
};

const getArticlesCountByCategory = async (req, res) => {
  const { companyId } = req.body;

  try {
    const articlesCountByCategory = await Article.findAll({
      attributes: [
        "category_id",
        [Sequelize.literal("COUNT(article_mst.id)"), "count"],
      ],
      where: { company_id: companyId },
      group: ["category_id"],
      include: [
        {
          model: Category,
          as: "categoryId",
          attributes: ["category_name", "id"],
          where: { id: Sequelize.col("category_id") },
        },
      ],
    });

    const result = articlesCountByCategory.map((articleCount) => ({
      name: articleCount.categoryId.category_name,
      count: articleCount.get("count"),
      id: articleCount.categoryId.id
    }));

    return result;
  } catch (error) {
    console.error("Error during get articles count by category:", error);
    return error;
  }
};

const getArticleIds = async (companyId, limit, offset) => {
  try {
    let articleIdsArray = [];
    let articlesIds;
    logger.info("ArticleService ---> getArticleIds ---> Reached.");

    if (limit && offset) {
      articlesIds = await Article.findAll({
        where: { company_id: companyId, visibility: "1" },
        attributes: ["id"],
        order: [
          ["id", "DESC"]
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    }
    else {
      articlesIds = await Article.findAll({
        where: { company_id: companyId },
        attributes: ["id"],
        order: [
          ["id", "DESC"]
        ],
      });
    }
    if (articlesIds) {
      for (let i = 0; i < articlesIds.length; i++) {
        let articleIdObject = articlesIds[i].dataValues;
        articleIdsArray.push(articleIdObject.id)
      }
    }
    logger.info("ArticleService ---> getArticleIds ---> End.");
    return articleIdsArray;
  } catch (error) {

    logger.info("ArticleService ---> getArticleIds ---> Error: ", error);
    throw error;
  }
};

const getUserArticleIds = async (companyId, userId, limit, offset) => {
  try {
    let articleIdsArray = []
    let articlesIds;
    logger.info("ArticleService ---> getUserArticleIds ---> Reached.");

    if (limit && offset) {
      articlesIds = await Article.findAll({
        where: { company_id: companyId, created_by: userId, visibility: "1" },
        attributes: ["id"],
        order: [
          ["id", "DESC"]
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    }
    else {
      articlesIds = await Article.findAll({
        where: { company_id: companyId, created_by: userId, visibility: "1" },
        attributes: ["id"],
      });
    }
    if (articlesIds) {
      for (let i = 0; i < articlesIds.length; i++) {
        let articleIdObject = articlesIds[i].dataValues;
        articleIdsArray.push(articleIdObject.id)
      }
    }
    logger.info("ArticleService ---> getUserArticleIds ---> End.");
    return articleIdsArray;
  } catch (error) {

    logger.info("ArticleService ---> getUserArticleIds ---> Error: ", error);
    throw error;
  }
};


const getArticlesData = async (companyId, userId, articlesIds) => {
  try {
    var articleObject = {};
    let tmpArticleObj;
    let tmpArticle;
    let tmpArticleUpvotesCount = {};
    let tmpArticleUpvotesCountObj = {};
    let tmpArticleTagsObj = {};
    let tmpTagObject = {};
    let tmpArticleArray = [];
    let uniqueArticleTagsSet = new Set();
    let TagIdWithTagName = {};
    let articleTagObject;
    let tmpTagsArray = [];

    logger.info("ArticleService ---> getArticlesData ---> Reached.");

    const article = await getArticleByIds(articlesIds, userId, companyId);
    const upvotes = await upvotesService.getArticleUpvotes(articlesIds, companyId);
    const upvotesUserData = await upvotesService.isArticleUpvotesByUser(articlesIds, userId, companyId);
    const articleTags = await ArticleTagService.getArticleTags(articlesIds);

    if (article) {
      for (let i = 0; i < article.length; i++) {
        tmpArticleObj = {};
        tmpArticle = article[i].dataValues;
        tmpArticleObj["id"] = tmpArticle.id;
        tmpArticleObj["title"] = tmpArticle.title;
        tmpArticleObj["description"] = tmpArticle.description;
        tmpArticleObj["product_id"] = tmpArticle.product_id;
        tmpArticleObj["visibility"] = tmpArticle.visibility;
        tmpArticleObj["company_id"] = tmpArticle.company_id;
        tmpArticleObj["created_date"] = tmpArticle.created_date;
        tmpArticleObj["user_id"] = tmpArticle.created_by;
        tmpArticleObj["user_name"] = tmpArticle.createdBy.dataValues.name;
        tmpArticleObj["user_email"] = tmpArticle.createdBy.dataValues.email;
        tmpArticleObj["avatar"] = tmpArticle.createdBy.dataValues.profile_image;
        tmpArticleObj["article_key"] = tmpArticle.article_key
        articleObject[tmpArticle.id] = tmpArticleObj;
      }
    }

    if (upvotes) {
      for (let i = 0; i < upvotes.length; i++) {
        tmpArticleUpvotesCount = upvotes[i].dataValues;
        if (articleObject.hasOwnProperty(tmpArticleUpvotesCount.article_id)) {
          articleObject[tmpArticleUpvotesCount.article_id]["upvotes_count"] = tmpArticleUpvotesCount.count;
        }
      }
    }

    if (upvotesUserData) {
      for (let i = 0; i < upvotesUserData.length; i++) {
        tmpArticleUpvotesCountObj = upvotesUserData[i].dataValues;
        if (
          articleObject.hasOwnProperty(tmpArticleUpvotesCountObj.article_id)
        ) {
          articleObject[tmpArticleUpvotesCountObj.article_id][
            "isUpvotedByCurrentUser"
          ] = true;
        }
      }
    }

    if (articleTags) {
      for (let i = 0; i < articleTags.length; i++) {
        tmpArticleTagsObj = articleTags[i].dataValues;
        if (articleObject.hasOwnProperty(tmpArticleTagsObj.article_id)) {
          uniqueArticleTagsSet.add(tmpArticleTagsObj.tag_id);
          if (
            articleObject[tmpArticleTagsObj.article_id].hasOwnProperty(
              "tags"
            )
          ) {
            tmpArticleArray =
              articleObject[tmpArticleTagsObj.article_id]["tags"];
            tmpArticleArray.push(tmpArticleTagsObj.tag_id);
            articleObject[tmpArticleTagsObj.article_id]["tags"] =
              tmpArticleArray;
          } else {
            articleObject[tmpArticleTagsObj.article_id]["tags"] = [
              tmpArticleTagsObj.tag_id,
            ];
          }
        }
      }
    }



    if (uniqueArticleTagsSet) {
      articleTagObject = await tagService.getArticleTagsName(
        uniqueArticleTagsSet
      );
      if (articleTagObject) {
        for (let i = 0; i < articleTagObject.length; i++) {
          tmpTagObject = articleTagObject[i].dataValues;
          if (!TagIdWithTagName.hasOwnProperty(tmpTagObject.id)) {
            TagIdWithTagName[tmpTagObject.id] = tmpTagObject.tag_name;
          }
        }
      }
    }
    if (TagIdWithTagName) {

      for (var articleId in articleObject) {
        var articleTagsTmpArray = []
        tmpTagObject = articleObject[articleId]
        tmpTagsArray = tmpTagObject.tags;
        if (tmpTagsArray) {
          for (let i = 0; i < tmpTagsArray.length; i++) {
            if (TagIdWithTagName.hasOwnProperty(tmpTagsArray[i])) {
              articleTagsTmpArray.push(TagIdWithTagName[tmpTagsArray[i]])
            }
          }
        }
        articleObject[articleId]["tags_name"] = articleTagsTmpArray
      }
    }

    logger.info("ArticleService ---> getArticlesData ---> End.");
    if (articleObject) {
      for (let i = 0; i < articlesIds.length; i++) {
        if (articleObject.hasOwnProperty(articlesIds[i])) {
          articlesIds[i] = articleObject[articlesIds[i]]
        }
      }
    }

    return articlesIds

  } catch (error) {
    logger.info("ArticleService ---> getArticlesData ---> Error: ", error);
    throw error;
  }
};

const getArticleByIds = async (articleIds, userId, companyId) => {
  try {
    logger.info("ArticleService ---> getArticleByIds ---> Reached.");

    const article = await Article.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: articleIds,
        },
        company_id: companyId,
      },
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "name", "email", "profile_image"],
        },
      ],
      order: [
        ["id", "DESC"]
      ],
    });

    return article;
  } catch (error) {
    logger.error("ArticleService ---> getArticleByIds ---> Error: ", error);
    throw error
  }
}
const getArticlesCount = async (companyId, userId) => {
  try {
    let articlesCount;
    logger.info("ArticleService ---> getArticlesCount ---> Reached.");

    if (userId) {
      articlesCount = await Article.count({
        where: { company_id: companyId, created_by: userId, visibility: "1" },
      });
    }
    else {
      articlesCount = await Article.count({
        where: { company_id: companyId, visibility: "1" },
      });
    }

    logger.info("ArticleService ---> getArticlesCount ---> End.");
    return articlesCount;
  } catch (error) {

    logger.info("ArticleService ---> getArticlesCount ---> Error: ", error);
    throw error;
  }
}
const getArticleId = async (id, companyId) => {
  try {
    logger.info("ArticleService ---> getArticleId ---> Reached.");

    const articleid = await Article.findOne({
      where: { article_key: id, company_id: companyId },
      attributes: ['id', 'article_key', 'company_id']
    })

    logger.info(`ArticleService ---> getArticleId ---> End With Data: ${articleid}`);
    return articleid;
  } catch (error) {
    logger.error("ArticleService ---> getArticleId ---> Error: ", error);
    throw error;
  }
}
const getArticleIdsByCategoryId = async (companyId, id, limit, offset) => {
  try {
    let articleIdsArray = []
    let articlesIds;
    logger.info("ArticleService ---> getArticleIdsByCategoryId ---> Reached.");

    if (limit && offset) {
      articlesIds = await Article.findAll({
        where: { company_id: companyId, category_id: id, visibility: "1" },
        attributes: ["id"],
        order: [
          ["id", "DESC"]
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    }
    else {
      articlesIds = await Article.findAll({
        where: { company_id: companyId, category_id: id, visibility: "1" },
        attributes: ["id"],
      });
    }
    if (articlesIds) {
      for (let i = 0; i < articlesIds.length; i++) {
        let articleIdObject = articlesIds[i].dataValues;
        articleIdsArray.push(articleIdObject.id)
      }
    }
    logger.info("ArticleService ---> getArticleIdsByCategoryId ---> End.");
    return articleIdsArray;
  } catch (error) {

    logger.info("ArticleService ---> getArticleIdsByCategoryId ---> Error: ", error);
    throw error;
  }
}
const getArticlesCountByCategoryId = async (companyId, id) => {
  try {
    let articlesCount;
    logger.info("ArticleService ---> getArticlesCount ---> Reached.");

    if (id) {
      articlesCount = await Article.count({
        where: { company_id: companyId, category_id: id, visibility: "1" },
      });
    }
    else {
      articlesCount = await Article.count({
        where: { company_id: companyId, visibility: "1" },
      });
    }

    logger.info("ArticleService ---> getArticlesCount ---> End.");
    return articlesCount;
  } catch (error) {

    logger.info("ArticleService ---> getArticlesCount ---> Error: ", error);
    throw error;
  }
}
// const getArticleCountByCategory=async (companyId)=>{
//   try{
//     const articleData=await Article.
//     console.log("Terst",categories);
//     return categories;
//   }catch(error){
//     console.log(error);
//   }
// }
module.exports = {
  createNewArticle,
  getAllArticles,
  getArticleById,
  getArticleByUserId,
  editArticle,
  deleteArticle,
  getAllArticlesCount,
  getArticlesCountByUserId,
  getLatestArticles,
  getArticlesCountByCategory,
  getArticleIds,
  getArticlesData,
  getArticlesCount,
  getUserArticleIds,
  getArticleId,
  getArticleIdsByCategoryId,
  getArticlesCountByCategoryId
};
