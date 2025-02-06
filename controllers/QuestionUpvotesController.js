const questionUpvotesService = require("../service/QuestionUpvotesService");

exports.addQuestionUpvotes=(req,res)=>{
    return questionUpvotesService.addQuestionUpvotes(req.body, res);
}
exports.deleteQuestionUpvotes=(req,res)=>{
    return questionUpvotesService.deleteQuestionUpvotes(req.body, res);
}