const dashboardService = require("../service/DashboardService");
const articlesService = require("../service/ArticlesService");
const popularQuestionsService = require("../service/PopularQuestionsService");

const getDashBoardData = async (req, res) => {
  const data = await dashboardService.getDashBoardData(req.body, res);
  res.status(200).json(data);
};
const getPopularQuestions = async (req, res) => {
  const data = await popularQuestionsService.getAllPopularQuestionData(
    req.body
  );
  res.status(200).json(data.data);
};
const getLatestArticles = async (req, res) => {
  const data = await articlesService.getLatestArticles(req.body, res);
  res.status(200).json(data);
};

module.exports = {
  getDashBoardData,
  getPopularQuestions,
  getLatestArticles,
};
