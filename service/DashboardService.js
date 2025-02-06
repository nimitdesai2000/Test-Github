const questionsService = require("../service/QuestionsService");
const articlesService = require("../service/ArticlesService");
const TagService = require("../service/TagService");
const CategoryService = require("../service/CategoryService");
const ProductService = require("../service/ProductService")
const UserRightsService = require("../service/UserRightsService")

const getDashBoardData = async (req, res) => {
  try {
    const allQuestionsCount = await questionsService.getAllQuestionsCount(
      req,
      res
    );
    const myQuestionsCount = await questionsService.getQuestionsCountByUserId(
      req,
      res
    );
    const allArticlesCount = await articlesService.getAllArticlesCount(
      req,
      res
    );
    const myArticlesCount = await articlesService.getArticlesCountByUserId(
      req,
      res
    );
    const categoryCount = await CategoryService.getCategoryCount(
      req,
      res
    );
    const tagCount = await TagService.getTagCount(
      req,
      res
    );
    const productCount = await ProductService.getProductCountService(
      req,
      res
    );

    const userGroupId = await UserRightsService.getUserGroupId(req);
    const dashboardData = {
      all_articles_count: allArticlesCount,
      all_questions_count: allQuestionsCount,
      my_questions_count: myQuestionsCount,
      my_article_count: myArticlesCount,
      category_count: categoryCount,
      tag_count: tagCount,
      product_count: productCount,
      user_group_id:userGroupId,
    };

    return dashboardData;
  } catch (error) {
    console.error("Error getting Dashboard Data:", error);
    res.status(500).json(error);
  }
};

module.exports = {
  getDashBoardData,
};
