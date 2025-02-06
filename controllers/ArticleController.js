const { response } = require("express");
const logger = require("../config/logger/logger.config");
const { createNewArticle, getAllArticles, getArticleById, getArticleByUserId, editArticle, deleteArticle, getArticleIds, getArticlesData, getArticlesCount, getUserArticleIds, getArticleId, getArticleIdsByCategoryId, getArticlesCountByCategory, getArticlesCountByCategoryId } = require("../service/ArticlesService");
const { APIResponse } = require("../utility/apihandler/APIResponse");
const { HttpStatusCode } = require("../utility/HttpStatusCode");
const { Result } = require("../utility/Result");
const dbconfig = require("../config/dbconfig/dbconfigmain.js");
const { Article, User, Category, Tag } = dbconfig.models;
const { request } = require("https");


exports.createArticle = async (request, response) => {
  try {
    logger.info("ArticleController ---> createArticle ---> Reached.");
    await createNewArticle(request.body);
    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('article.save.success'))
    logger.info("ArticleController ---> createArticle ---> End.");
  }
  catch (error) {
    logger.error(error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('article.save.error'));
  }
};

exports.getAllArticles = async (req, response) => {
  try {
    logger.info("ArticleController ---> getAllArticles ---> Reached.");
    const { data } = await getAllArticles(req.body);
    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data);
    logger.info("ArticleController ---> getAllArticles ---> End.");
  } catch (error) {
    logger.error(error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('article.save.error'));
  }
};

exports.getAllArticlesPagination = async (req, response) => {
  try {
    logger.info("ArticleController ---> getAllArticlesPagination ---> Reached.");
    const { offset, limit } = req.params;
    req.body.offset = offset;
    req.body.limit = limit;
    const { data } = await getAllArticles(req.body);
    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data);
    logger.info("ArticleController ---> getAllArticlesPagination ---> End.");
  } catch (error) {
    logger.error(error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('article.save.error'));
  }
};

exports.getArticleById = async (req, response) => {
  try {
    logger.info("ArticleController ---> getArticleById ---> Reached.");
    const articleId = req.params.id;
    const { companyId } = req.body;

    const { data } = await getArticleById({ articleId, companyId });
    if (!data) {
      APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {});
    } else {
      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data);
    }
    logger.info("ArticleController ---> getArticleById ---> End.");
  } catch (error) {
    logger.error(error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('article.save.error'));
  }
};

exports.getArticleByUserId = async (req, response) => {
  try {
    logger.info("ArticleController ---> getArticleByUserId ---> Reached.");
    logger.info("Article User Id Start " + Date.now());
    const { offset, limit } = req.params;
    req.body.offset = offset;
    req.body.limit = limit;
    const { data } = await getArticleByUserId(req.body);
    if (!data) {
      APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {});
    } else {
      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data);
    }
    logger.info("Article User Id End " + Date.now());
    logger.info("ArticleController ---> getArticleByUserId ---> End.");
  } catch (error) {
    logger.error(error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('article.save.error'));

  }
};

exports.editArticlesById = async (request, response) => {
  try {
    logger.info("ArticleController ---> editArticlesById ---> Reached.");
    const articledata = request.body;
    const articleId = request.params.id;
    
    const { result } = await editArticle(articledata, articleId);
    if (result == 1) {
      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('article.update.success'));
    } else {
      APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('article.notfound'));
    }
    logger.info("ArticleController ---> editArticlesById ---> End.");
  } catch (error) {

    logger.error("ArticleController ---> editArticlesById ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('article.save.error'));
  }
};

exports.deleteArticleById = async (req, res) => {
  try {
    logger.info("ArticleController ---> deleteArticleById ---> Reached.");
    const articleId = req.params.id;
    const { companyId } = req.body;

    const { result } = await deleteArticle({ articleId, companyId });
    if (result == 1) {
      APIResponse(res, HttpStatusCode.OK, Result.SUCCESS, {}, t('article.delete.success'));
    } else {
      APIResponse(res, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('question.notfound'));
    }
    logger.info("ArticleController ---> deleteArticleById ---> End.");
  } catch (error) {
    logger.error(error);
    APIResponse(res, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('article.save.error'));
  }
};

exports.getArticlesData = async (request, response) => {
  try {
    logger.info("ArticleController ---> getArticlesData ---> Reached.");
    logger.info("ArticleController ---> getArticlesData ---> Reached. " + Date.now());
    const { type, limit, offset, categoryId } = request.query;
    var { companyId, userId } = request.body;
    console.log("BODY ", request.body)
    var articlesIds;
    var articlesCount;

    if (type == "ALL") {
      articlesIds = await getArticleIds(companyId, limit, offset);
      articlesCount = await getArticlesCount(companyId)
    }
    else if (type == "USERS") {
      articlesIds = await getUserArticleIds(companyId, userId, limit, offset);
      articlesCount = await getArticlesCount(companyId, userId)
    }
    else if (type == "CATEGORY") {
      articlesIds = await getArticleIdsByCategoryId(companyId, categoryId, limit, offset);
      articlesCount = await getArticlesCountByCategoryId(companyId, categoryId);
    }
    else if (Number.isInteger(parseInt(type))) {
      articlesIds = [parseInt(type)];
    }
    if (articlesIds) {
      const articlesdata = await getArticlesData(companyId, userId, articlesIds);

      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, { count: articlesCount, data: articlesdata }, t('article.get.success'));

      logger.info("ArticleController ---> getArticlesData ---> End.");
      logger.info("ArticleController ---> getArticlesData ---> End. " + Date.now());
    }

  } catch (error) {

    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
    logger.error("ArticleController ---> getArticlesData ---> Error: ", error);
  }
}

exports.getArticleId = async (request, response) => {
  try {
    logger.info("ArticleController ---> getArticleId ---> Reached.");

    const id = request.params.id;
    const { companyId } = request.body
    const responsedata = await getArticleId(id, companyId);

    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, responsedata, t('article.get.id.success'));

    logger.info("ArticleController ---> getArticleId ---> End.")
  } catch (error) {
    logger.error("ArticleController ---> getArticleId ---> Error: ", error);
    throw error
  }
}

exports.getArticleByCategoryId = async (request, response) => {
  try {
    const { categoryId, offset, limit } = request.query;
    //const {offset,limit}=request.params
    const { companyId, userId } = request.body
    var articlesIds = await getArticleIdsByCategoryId(companyId, categoryId, limit, offset);
    var articlesCount = await getArticlesCountByCategoryId(companyId, categoryId);
    if (articlesIds) {
      const articlesdata = await getArticlesData(companyId, userId, articlesIds);

      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, { count: articlesCount, data: articlesdata }, t('article.get.success'));

      logger.info("ArticleController ---> getArticleByCategoryId ---> End.");
      logger.info("ArticleController ---> getArticleByCategoryId ---> End. " + Date.now());
    }

  } catch (error) {
    logger.error("ArticleController ---> getArticleId ---> Error: ", error);
    throw error
  }
}

exports.getArticleCountByCategory = async (request, response) => {
  try {
    const data = await getArticlesCountByCategory(request);
    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('article.get.success'));

  } catch (error) {
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
    logger.error("ArticleController ---> getArticleId ---> Error: ", error);

  }
}