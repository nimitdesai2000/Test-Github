const questionService = require("../service/QuestionsService")
const elsearch = require("../service/elsearch/elSearchUtility")
const logger = require("../config/logger/logger.config");
const { APIResponse } = require("../utility/apihandler/APIResponse");
const { Result } = require("../utility/Result");
const { HttpStatusCode } = require("../utility/HttpStatusCode");

exports.createNewQuestionsController = async (request, response) => {
  try {
    logger.info("QuestionsController ---> createNewQuestionsController ---> Reached.");

    const { title, description, product_id, tags, visibility, company_id, modified_date, companyId, userId } = request.body;
    const questiondata = { title, description, product_id, tags, visibility, company_id, modified_date, companyId, userId };

    await questionService.createNewQuestions(questiondata);

    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('question.save.success'));

    logger.info("QuestionsController ---> createNewQuestionsController ---> End.");
  } catch (error) {

    logger.error("QuestionsController ---> createNewQuestionsController ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));

  }
}

exports.getAllQuestionsController = async (request, response) => {
  try {
    logger.info("QuestionsController ---> getAllQuestionsController ---> Reached.");
    const { companyId } = request.body;
    const questiondata = await questionService.getAllQuestions(companyId);

    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, questiondata, t('questions.get.success'));

    logger.info("QuestionsController ---> getAllQuestionsController ---> End.");
  } catch (error) {

    logger.error("QuestionsController ---> getAllQuestionsController ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));

  }
}

exports.getQuestionByIdController = async (request, response) => {
  try {
    logger.info("QuestionsController ---> getQuestionByIdController ---> Reached.");

    const questionId = request.params.id
    const { companyId, userId } = request.body

    const questiondata = await questionService.getQuestionById(questionId, userId, companyId);

    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, questiondata, t('question.get.success'));

    logger.info("QuestionsController ---> getQuestionByIdController ---> End.");
  } catch (error) {

    logger.error("QuestionsController ---> getQuestionByIdController ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));

  }
}

exports.editQuestionsController = async (request, response) => {

  try {
    logger.info("QuestionsController ---> editQuestionsController ---> Reached.");

    const { title, description, product_id, tag_id, visibility, modified_date, companyId, userId } = request.body;

    const questiondata = { title, description, product_id, tag_id, visibility, modified_date, companyId, userId };

    const questionId = request.params.id;

    const { result } = await questionService.editQuestions(questiondata, questionId);

    if (result == 1) {
      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('question.edited.success'));
    } else {
      APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('question.notfound'));
    }

    logger.info("QuestionsController ---> editQuestionsController ---> End.");
  } catch (error) {

    logger.error("QuestionsController ---> editQuestionsController ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));

  }
}

exports.deleteQuestionsController = async (request, response) => {
  try {
    logger.info("QuestionsController ---> deleteQuestionsController ---> Reached.");

    const questionId = request.params.id;
    const { companyId } = request.body;

    const { result } = await questionService.deleteQuestions(questionId, companyId);
    if (result == 1) {
      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('question.deleted.success'));
    } else {
      APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('question.notfound'));
    }
    logger.info("QuestionsController ---> deleteQuestionsController ---> End.");
  } catch (error) {

    logger.error("QuestionsController ---> deleteQuestionsController ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));

  }
}

exports.getQuestionsByUser = async (request, response) => {
  try {
    logger.info("QuestionsController ---> getQuestionsByUser ---> End.");

    const { companyId, userId } = request.body;
    const { user_id } = request.query;
    let setUserId = userId || user_id

    const questiondata = await questionService.getQuestionsByUser(setUserId, companyId);

    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, questiondata, t('question.get.success'));

    logger.info("QuestionsController ---> getQuestionsByUser ---> End.");
  } catch (error) {

    logger.error("QuestionsController ---> getQuestionsByUser ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));

  }
}

exports.searchQuestion = async (request, response) => {
  try {
    logger.info("QuestionsController ---> searchQuestion ---> Reached.");

    const { companyId, content } = request.body;
    const questiondata = await elsearch.searchQuestions(companyId, content);
    const sourceArray = questiondata.map(question => question._source);

    APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, sourceArray, t('question.search.success'));

    logger.info("QuestionsController ---> searchQuestion ---> End.");
  } catch (error) {

    logger.error("QuestionsController ---> searchQuestion ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));

  }
}

exports.getQuestionsData = async (request, response) => {
  try {
    logger.info("QuestionsController ---> getQuestionsData ---> Reached.");
    const questionTypeData = request.query.type;
    const { offset, limit } = request.query
    var questionsIds;
    var questionsCount;
    var { companyId, questionsIds, userId } = request.body;

    if (questionTypeData == "all") {
      questionsIds = await questionService.getQuestionIds(companyId, offset, limit);
      questionsCount = await questionService.getQuestionsCount(companyId)
    }
    else if (questionTypeData == "users") {
      questionsIds = await questionService.getUserQuestionIds(companyId, userId, offset, limit);
      questionsCount = await questionService.getQuestionsCount(companyId, userId)
    }
    else if (Number.isInteger(parseInt(questionTypeData))) {
      questionsIds = [parseInt(questionTypeData)];
    }
    if (questionsIds) {
      const questionsdata = await questionService.getQuestionsData(companyId, userId, questionsIds);

      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, { count: questionsCount, data: questionsdata }, t('question.search.success'));

      logger.info("QuestionsController ---> getQuestionsData ---> End.");
    }

  } catch (error) {

    logger.error("QuestionsController ---> getQuestionsData ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));

  }
}

exports.getQuestionId = async (request, response) => {
  try {
    logger.info("QuestionsController ---> getQuestionId ---> Reached.");

    const id = request.params.id;
    const { companyId } = request.body

    const { data } = await questionService.getQuestionId(id, companyId);
    if (data == 0) {
      APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('question.notfound'));
    } else {
      APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('question.get.id.success'));
    }

    logger.info("QuestionsController ---> getQuestionId ---> End.")
  } catch (error) {
    logger.error("QuestionsController ---> getQuestionId ---> Error: ", error);
    APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
  }
}