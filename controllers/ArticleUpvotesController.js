const articleUpvotesService = require("../service/ArticleUpvotesService");

exports.addArticleUpvotes=(req,res)=>{
    return articleUpvotesService.addArticleUpvotes(req.body, res);
}
exports.deleteArticleUpvotes=(req,res)=>{
    return articleUpvotesService.deleteArticleUpvotes(req.body, res);
}