const {getAllCompanyQuestionRepliesUpvotedCountData} = require("../service/QuestionsService");
const {insertUpdatePopularQuestions} = require("../service/PopularQuestionsService")
const logger = require("../config/logger/logger.config.js")

const MIN_REPLY_COUNT_FOR_POPULAR_QUESTION = 1;
const MIN_UPVOTES_COUNT_FOR_POPULAR_QUESTION = 1;

const calculatePopularQuestions = async () =>{
    logger.info("============================= Calculation Started For Popular Question==================================")
    try {
      var jsonObjectCompanyWiseQuestionData;
      let popularQuestionInsertUpdateArray = [];
      let popularQuestionObject = {};
      let companyId;
      let arrQuestionObject = [];
      let questionId;
      let popularQuestionData;
      jsonObjectCompanyWiseQuestionData = await getCompnayWisePopularQuestionData();
      if (jsonObjectCompanyWiseQuestionData) {
        for (companyId in jsonObjectCompanyWiseQuestionData) {
            arrQuestionObject = jsonObjectCompanyWiseQuestionData[companyId];
            arrQuestionObject.forEach((question) => {
            questionId = Object.keys(question)[0];
            popularQuestionData = question[questionId];
            popularQuestionObject = {
              question_id: parseInt(questionId),
              no_of_reply: popularQuestionData.reply_count,
              no_of_upvotes: popularQuestionData.upvotes_count,
              company_id: parseInt(companyId),
            };
            popularQuestionInsertUpdateArray.push(popularQuestionObject);
          });
        }
        insertUpdatePopularQuestions(popularQuestionInsertUpdateArray);
      }
    } catch (error) {
      logger.error("Error in calculatePopularQuestions:", error.message);
    }

}

const getCompnayWisePopularQuestionData = async () =>{
    try {
        var jsonObjectCompanyWiseQuestionData = {};
        var questionArray;
        var question;
        var questionJsonObject;
        const questionData = await getAllCompanyQuestionRepliesUpvotedCountData(MIN_REPLY_COUNT_FOR_POPULAR_QUESTION,MIN_UPVOTES_COUNT_FOR_POPULAR_QUESTION);
        if(questionData) {
            for(let i=0;i<questionData.data.length;i++) {
                question = questionData.data[i];
                if (question.company_id in jsonObjectCompanyWiseQuestionData) {
                    questionArray = [...jsonObjectCompanyWiseQuestionData[question.company_id]]
                        questionJsonObject ={
                            [question.question_id]: { reply_count: question.reply_count, upvotes_count: question.upvotes_count },
                        };
                        questionArray.push(questionJsonObject)
                        jsonObjectCompanyWiseQuestionData[question.company_id] = questionArray;
                }
                else {
                        questionJsonObject ={
                            [question.question_id]: { reply_count: question.reply_count, upvotes_count: question.upvotes_count },
                        };
                        jsonObjectCompanyWiseQuestionData[question.company_id] = [questionJsonObject];
                }
            }
        }
    }
    catch(error) {
        logger.error("Error in getCompnayWisePopularQuestionData:", error.message);
    }

    return jsonObjectCompanyWiseQuestionData;
}
module.exports = {
    calculatePopularQuestions
};
  