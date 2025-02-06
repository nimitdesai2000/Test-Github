
const RepliesServies = require('../service/RepliesServies');
const logger = require("../config/logger/logger.config");
const { APIResponse } = require("../utility/apihandler/APIResponse");
const { HttpStatusCode } = require("../utility/HttpStatusCode");
const { Result } = require("../utility/Result");

const addQuestionReply = async( request, response)=>{
    
    try {
        logger.info("QuestionReplyController ---> addQuestionReply ---> Reached.");

        const replyData   = request.body
        const replydata = await RepliesServies.addQuestionReply(replyData)
        
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, replydata, t('reply.added.success'));

        logger.info("QuestionReplyController ---> addQuestionReply ---> End.");
    } catch (error) {

        logger.error("QuestionReplyController ---> addQuestionReply ---> Error: ", error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
    }
}

const getAllReplyCount = async(request, response)=>{   

    try {
        logger.info("QuestionReplyController ---> getAllReplyCount ---> Reached.");

        const questionId = request.params.id;
        const repliesdata = await RepliesServies.getAllReplyCount([questionId]);

        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, repliesdata, t('reply.get.success.count'));

        logger.info("QuestionReplyController ---> getAllReplyCount ---> Reached.");
    } catch (error) {

        logger.error("QuestionReplyController ---> getAllReplyCount ---> Error: ", error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
    }
}

const getReplyByQuestionId = async(request, response)=>{
   
    try {
        logger.info("QuestionReplyController ---> getReplyByQuestionId ---> Reached.");

        const questionId = request.params.id
        const limit = request.params.limit
        const offset = request.params.offset
        const repliesdata = await RepliesServies.getReplyByQuestionId(questionId, limit, offset);
        
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, repliesdata, t('reply.get.success'));

        logger.info("QuestionReplyController ---> getReplyByQuestionId ---> End.");
    } catch (error) {

        logger.error("QuestionReplyController ---> getReplyByQuestionId ---> Error: ", error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
       
    }
}

const getReplyByQuestionsId = async(request, response)=>{
    
    try {
        logger.info("QuestionReplyController ---> getReplyByQuestionsId ---> Reached.");

        const questionid = request.params.id
        const limit = request.params.limit
        const offset = request.params.offset

        const repliesdata = await RepliesServies.getReplyByQuestionsId(questionid, limit, offset);
       
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, repliesdata, t('reply.get.success'));

        logger.info("QuestionReplyController ---> getReplyByQuestionsId ---> End.");

    } catch (error) {
        
        logger.error("QuestionReplyController ---> getReplyByQuestionsId ---> Error: ", error);
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));       
    }
}


module.exports = { addQuestionReply , getAllReplyCount, getReplyByQuestionId, getReplyByQuestionsId}
