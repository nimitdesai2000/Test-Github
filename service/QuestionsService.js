const dbconfig = require("../config/dbconfig/dbconfigmain");
const { Question, User, Product, QuestionUpvotes, sequelize, Sequelize, QuestionTag, QuestionReply } = dbconfig.models;
const elSearchUtility = require("../service/elsearch/elSearchUtility");
const questionTagService = require("../service/QuestionTagService.js");
const tagService = require("../service/TagService.js");
const replyService = require("../service/RepliesServies.js");
const upvotesService = require("../service/QuestionUpvotesService.js");
const logger = require("../config/logger/logger.config.js");
const CommonService = require("./CommonService.js");
const { Module } = require('../utility/Module.js');

exports.createNewQuestions = async (createQuestionData) => {
  try {
    logger.info("QuestionsService ---> createNewQuestions ---> Reached.");

    const questionKey = await CommonService.getUniqueKey(createQuestionData.companyId, createQuestionData.product_id, Module.QUESTION);

    Question.create({
      question_key: questionKey,
      title: createQuestionData.title,
      description: createQuestionData.description,
      product_id: createQuestionData.product_id,
      tags: createQuestionData.tags,
      visibility: createQuestionData.visibility,
      company_id: createQuestionData.companyId,
      modified_date: createQuestionData.modified_date,
      created_by: createQuestionData.userId,
      modified_by: createQuestionData.userId,

    }).then((createdQuestion) => {
      createQuestionData["question_id"] = createdQuestion.id;
      questionTagService.addQuestionTags(createQuestionData)
      //Add Data To EL
      elSearchUtility.addQuestion(createQuestionData);
    });
    logger.info("QuestionsService ---> createNewQuestions ---> End.")
  } catch (error) {
    logger.error("QuestionsService ---> createNewQuestions ---> Error: ", error)
    throw error;
  }
};

exports.getAllQuestions = async (companyId) => {
  try {
    logger.info("QuestionsService ---> getAllQuestions ---> Reached.");
    const questions = await Question.findAll({
      where: { company_id: companyId },
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [
        ['id', 'DESC'],
      ],
    });
    logger.info("QuestionsService ---> getAllQuestions ---> End.");
    return questions;

  } catch (error) {
    logger.error("QuestionsService ---> getAllQuestions ---> Error: ", error);
    throw error
  }
};

exports.getAllCompanyQuestionRepliesUpvotedCountData = async (MIN_REPLY_COUNT_FOR_POPULAR_QUESTION, MIN_UPVOTES_COUNT_FOR_POPULAR_QUESTION) => {
  try {
    logger.info("QuestionsService ---> getAllCompanyQuestionRepliesUpvotedCountData ---> Reached.");

    const rawQuery = `
    SELECT q.id AS question_id,q.company_id, COUNT(DISTINCT qr.id) AS reply_count, COUNT(DISTINCT qu.id) AS upvotes_count FROM questions_mst q LEFT JOIN question_reply_mst qr ON q.id = qr.question_id LEFT JOIN questions_upvotes qu ON q.id = qu.question_id GROUP BY q.id HAVING COUNT(DISTINCT qr.id) > :minReplyCount OR COUNT(DISTINCT qu.id) > :minUpvotesCount`;
    const questions = await sequelize.query(rawQuery, {
      replacements: { minReplyCount: MIN_REPLY_COUNT_FOR_POPULAR_QUESTION, minUpvotesCount: MIN_UPVOTES_COUNT_FOR_POPULAR_QUESTION },
      type: sequelize.QueryTypes.SELECT,
    });

    logger.info("QuestionsService ---> getAllCompanyQuestionRepliesUpvotedCountData ---> End.");
    return { status: 1, data: questions };
  } catch (error) {

    logger.error("QuestionsService ---> getAllCompanyQuestionRepliesUpvotedCountData ---> Error: ", error);
    throw error;
  }
};

exports.getQuestionById = async (questionId, userId, companyId) => {
  try {
    logger.info("QuestionsService ---> getQuestionById ---> Reached.");

    // const questionTagData = await Question.findByPk(83,{
    //   include:[TagModel]
    // })

    // console.log(questionTagData)
    // console.log(questionTagData[0].dataValues)

    const question = await Question.findOne({
      where: { id: questionId, company_id: companyId },
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "name", "email"],
        },
      ],
    });



    const upvotes = await QuestionUpvotes.count({
      where: { question_id: questionId, company_id: companyId },
    });

    const upvotesUserData = await QuestionUpvotes.findOne({
      where: { question_id: questionId, company_id: companyId, upvoted_by: userId },
    })

    var isUpvotedByUser = 0;

    if (upvotesUserData) {
      isUpvotedByUser = 1
    }

    if (!question) {
      return {};
    }
    logger.info("QuestionsService ---> getQuestionById ---> End.");
    return { question: question, upvotes: upvotes, isUpvotedByUser: isUpvotedByUser };
  } catch (error) {
    logger.error("QuestionsService ---> getQuestionById ---> Error: ", error);
    throw error
  }
};


exports.editQuestions = async (questiondata, questionId) => {
  try {
    logger.info("QuestionsService ---> editQuestions ---> Reached.");
    // const questionId = req.params.id;
    const existingQuestion = await Question.findOne({
      where: { id: questionId, company_id: questiondata.companyId },
    });

    if (existingQuestion === null) {
      return { result: 0 }
    }

    existingQuestion.title = questiondata.title;
    existingQuestion.description = questiondata.description;
    existingQuestion.product_id = questiondata.product_id;
    existingQuestion.tag_id = questiondata.tag_id;
    existingQuestion.visibility = questiondata.visibility;
    existingQuestion.company_id = questiondata.companyId;
    existingQuestion.modified_date = Date.now();
    existingQuestion.modified_by = questiondata.userId;

    await existingQuestion.save();
    logger.info("QuestionsService ---> editQuestions ---> End.");
    return { result: 1 };
  } catch (error) {
    logger.error("QuestionsService ---> editQuestions ---> Error: ", error);
    throw error
  }
};

exports.deleteQuestions = async (questionId, companyId) => {
  try {
    logger.info("QuestionsService ---> deleteQuestions ---> Reached.");

    const existingQuestion = await Question.findOne({
      where: { id: questionId, company_id: companyId },
    });

    if (existingQuestion === null) {
      return { result: 0 }
    }

    await existingQuestion.destroy();

    logger.info("QuestionsService ---> deleteQuestions ---> End.");
    return { result: 1 }
  } catch (error) {

    logger.error("QuestionsService ---> deleteQuestions ---> Error: ", error);
    throw error
  }
};

exports.getQuestionsByUser = async (userId, companyId) => {
  try {
    logger.info("QuestionsService ---> getQuestionsByUser ---> Reached.");

    const questions = await Question.findAll({
      where: { company_id: companyId },
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "name", "email"],
          where: { id: userId },
        },
        {
          model: Product,
          as: "productId",
          attributes: ["id", "product_name"],
        },
      ],
      order: [
        ['id', 'DESC'],
      ],
    });

    if (questions.length < 0) {
      return { status: 404, error: "Question not found" };
    }

    logger.info("QuestionsService ---> getQuestionsByUser ---> End.");
    return questions;
  } catch (error) {

    logger.error("QuestionsService ---> getQuestionsByUser ---> Error: ", error);
    throw error
  }
};

exports.getAllQuestionsCount = async (req, res) => {
  const { companyId } = req;
  try {
    logger.info("QuestionsService ---> getAllQuestionsCount ---> Reached.");
    const questionsCount = await Question.count({
      where: { company_id: companyId },
    });
    logger.info("QuestionsService ---> getAllQuestionsCount ---> End.");
    return questionsCount;
  } catch (error) {

    logger.error("QuestionsService ---> getAllQuestionsCount ---> Error: ", error);
    throw error;
  }
};

exports.getQuestionsCountByUserId = async (req, res) => {
  const { companyId, userId } = req;
  try {
    logger.info("QuestionsService ---> getQuestionsCountByUserId ---> Reached.");

    const questionsCount = await Question.count({
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
    logger.info("QuestionsService ---> getQuestionsCountByUserId ---> End.");
    return questionsCount;
  } catch (error) {

    logger.info("QuestionsService ---> getQuestionsCountByUserId ---> Error: ", error);
    throw error;
  }
};

exports.getQuestionIds = async (companyId, offset, limit) => {
  try {
    let questionIdsArray = []
    let questionsIds;
    logger.info("QuestionsService ---> getQuestionIds ---> Reached.");

    if (limit && offset) {
      questionsIds = await Question.findAll({
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
      questionsIds = await Question.findAll({
        where: { company_id: companyId },
        attributes: ["id"],
        order: [
          ["id", "DESC"]
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    }

    if (questionsIds) {
      for (let i = 0; i < questionsIds.length; i++) {
        let questionIdObject = questionsIds[i].dataValues;
        questionIdsArray.push(questionIdObject.id)
      }
    }
    logger.info("QuestionsService ---> getQuestionIds ---> End.");
    return questionIdsArray;
  } catch (error) {

    logger.info("QuestionsService ---> getQuestionIds ---> Error: ", error);
    throw error;
  }
};

exports.getUserQuestionIds = async (companyId, userId, offset, limit) => {
  try {
    let questionIdsArray = []
    let questionsIds;
    logger.info("QuestionsService ---> getQuestionIds ---> Reached.");

    if (limit && offset) {
      questionsIds = await Question.findAll({
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
      questionsIds = await Question.findAll({
        where: { company_id: companyId, created_by: userId },
        attributes: ["id"],
      });
    }

    if (questionsIds) {
      for (let i = 0; i < questionsIds.length; i++) {
        let questionIdObject = questionsIds[i].dataValues;
        questionIdsArray.push(questionIdObject.id)
      }
    }
    logger.info("QuestionsService ---> getQuestionIds ---> End.");
    return questionIdsArray;
  } catch (error) {

    logger.info("QuestionsService ---> getQuestionIds ---> Error: ", error);
    throw error;
  }
};

exports.getQuestionsCount = async (companyId, userId) => {
  try {
    let questionsCount;
    logger.info("QuestionsService ---> getQuestionsCount ---> Reached.");

    if (userId) {
      questionsCount = await Question.count({
        where: { company_id: companyId, created_by: userId, visibility: "1" },
      });
    }
    else {
      questionsCount = await Question.count({
        where: { company_id: companyId },
      });
    }

    logger.info("QuestionsService ---> getQuestionsCount ---> End.");
    return questionsCount;
  } catch (error) {

    logger.info("QuestionsService ---> getQuestionsCount ---> Error: ", error);
    throw error;
  }
}


exports.getQuestionsData = async (companyId, userId, questionsIds) => {
  try {
    var questionObject = {};
    let tmpQuestionObj;
    let tmpQuestion;
    let tmpQuestionUpvotesCount = {};
    let tmpQuestionUpvotesCountObj = {};
    let tmpQuestionTagsObj = {};
    let tmpReplyCountObj = {};
    let tmpTagObject = {};
    let tmpQuestionArray = [];
    let uniqueQuestionTagsSet = new Set();
    let questionIdWithQuestionName = {};
    let questionTagObject;
    let tmpTagsArray = [];

    logger.info("QuestionsService ---> getQuestionsData ---> Reached.");

    const repliesCount = await replyService.getAllReplyCount(questionsIds);
    const question = await getQuestionByIds(questionsIds, userId, companyId);
    const upvotes = await upvotesService.getQuestionUpvotes(questionsIds, companyId);
    const upvotesUserData = await upvotesService.isQuestionUpvotesByUser(questionsIds, userId, companyId);
    const questionTags = await questionTagService.getQuestionTags(questionsIds);

    if (question) {
      for (let i = 0; i < question.length; i++) {
        tmpQuestionObj = {};
        tmpQuestion = question[i].dataValues;
        tmpQuestionObj["id"] = tmpQuestion.id;
        tmpQuestionObj["title"] = tmpQuestion.title;
        tmpQuestionObj["description"] = tmpQuestion.description;
        tmpQuestionObj["product_id"] = tmpQuestion.product_id;
        tmpQuestionObj["visibility"] = tmpQuestion.visibility;
        tmpQuestionObj["company_id"] = tmpQuestion.company_id;
        tmpQuestionObj["created_date"] = tmpQuestion.created_date;
        tmpQuestionObj["user_id"] = tmpQuestion.created_by;
        tmpQuestionObj["user_name"] = tmpQuestion.createdBy.dataValues.name;
        tmpQuestionObj["user_email"] = tmpQuestion.createdBy.dataValues.email;
        tmpQuestionObj["avatar"] = tmpQuestion.createdBy.dataValues.profile_image;
        tmpQuestionObj["question_key"] = tmpQuestion.question_key;
        questionObject[tmpQuestion.id] = tmpQuestionObj;
      }
    }

    if (upvotes) {
      for (let i = 0; i < upvotes.length; i++) {
        tmpQuestionUpvotesCount = upvotes[i].dataValues;
        if (questionObject.hasOwnProperty(tmpQuestionUpvotesCount.question_id)) {
          questionObject[tmpQuestionUpvotesCount.question_id]["upvotes_count"] = tmpQuestionUpvotesCount.count;
        }
      }
    }

    if (upvotesUserData) {
      for (let i = 0; i < upvotesUserData.length; i++) {
        tmpQuestionUpvotesCountObj = upvotesUserData[i].dataValues;
        if (
          questionObject.hasOwnProperty(tmpQuestionUpvotesCountObj.question_id)
        ) {
          questionObject[tmpQuestionUpvotesCountObj.question_id][
            "isUpvotedByCurrentUser"
          ] = true;
        }
      }
    }

    if (questionTags) {
      for (let i = 0; i < questionTags.length; i++) {
        tmpQuestionTagsObj = questionTags[i].dataValues;
        if (questionObject.hasOwnProperty(tmpQuestionTagsObj.question_id)) {
          uniqueQuestionTagsSet.add(tmpQuestionTagsObj.tag_id);
          if (
            questionObject[tmpQuestionTagsObj.question_id].hasOwnProperty(
              "tags"
            )
          ) {
            tmpQuestionArray =
              questionObject[tmpQuestionTagsObj.question_id]["tags"];
            tmpQuestionArray.push(tmpQuestionTagsObj.tag_id);
            questionObject[tmpQuestionTagsObj.question_id]["tags"] =
              tmpQuestionArray;
          } else {
            questionObject[tmpQuestionTagsObj.question_id]["tags"] = [
              tmpQuestionTagsObj.tag_id,
            ];
          }
        }
      }
    }

    if (repliesCount) {
      for (let i = 0; i < repliesCount.length; i++) {
        tmpReplyCountObj = repliesCount[i].dataValues;
        if (questionObject.hasOwnProperty(tmpReplyCountObj.question_id)) {
          questionObject[tmpReplyCountObj.question_id]["reply_count"] =
            tmpReplyCountObj.question_reply_count;
        }
      }
    }

    if (uniqueQuestionTagsSet) {
      questionTagObject = await tagService.getQuestionTagsName(
        uniqueQuestionTagsSet
      );
      if (questionTagObject) {
        for (let i = 0; i < questionTagObject.length; i++) {
          tmpTagObject = questionTagObject[i].dataValues;
          if (!questionIdWithQuestionName.hasOwnProperty(tmpTagObject.id)) {
            questionIdWithQuestionName[tmpTagObject.id] = tmpTagObject.tag_name;
          }
        }
      }
    }
    if (questionIdWithQuestionName) {

      for (var questionId in questionObject) {
        var questionTagsTmpArray = []
        tmpTagObject = questionObject[questionId]
        tmpTagsArray = tmpTagObject.tags;
        if (tmpTagsArray) {
          for (let i = 0; i < tmpTagsArray.length; i++) {
            if (questionIdWithQuestionName.hasOwnProperty(tmpTagsArray[i])) {
              questionTagsTmpArray.push(questionIdWithQuestionName[tmpTagsArray[i]])
            }
          }
        }
        questionObject[questionId]["tags_name"] = questionTagsTmpArray
      }
    }

    logger.info("QuestionsService ---> getQuestionsData ---> End.");
    if (questionObject) {
      for (let i = 0; i < questionsIds.length; i++) {
        if (questionObject.hasOwnProperty(questionsIds[i])) {
          questionsIds[i] = questionObject[questionsIds[i]]
        }
      }
    }

    return questionsIds

  } catch (error) {

    logger.info("QuestionsService ---> getQuestionsData ---> Error: ", error);
    throw error;
  }
};

const getQuestionByIds = async (questionIds, userId, companyId) => {
  try {
    logger.info("QuestionsService ---> getQuestionByIds ---> Reached.");

    const question = await Question.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: questionIds,
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

    return question;
  } catch (error) {

    logger.error("QuestionsService ---> getQuestionByIds ---> Error: ", error);
    throw error
  }
}

exports.getQuestionId = async (id, companyId) => {
  try {
    logger.info("QuestionsService ---> getQuestionId ---> Reached.");
  
    const question = await Question.findOne({
      where: { question_key: id, company_id: companyId },
      attributes: ['id', 'question_key', 'company_id']
    })

    if (question === null) {
      return { data: 0 }
    } else {
      logger.info(`QuestionService ---> getQuestionId ---> End With Data: ${question}`);
      return { data: question };
    }
  } catch (error) {

    logger.error("QuestionService ---> getQuestionId ---> Error: ", error);
    throw error;
  }
}
