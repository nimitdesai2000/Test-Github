const QuestionTagService = require("../service/QuestionTagService");

exports.getQuestionTags=(req,res)=>{
    return QuestionTagService.getQuestionTags(req, res);
}