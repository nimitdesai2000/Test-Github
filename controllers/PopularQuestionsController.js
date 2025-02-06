const popularQuestionService = require("../service/PopularQuestionsService");

const getAllPopularQuestions = async (req, res) => {
  try {
    const response = await popularQuestionService.getAllPopularQuestionData(
      req.body
    );
    if (response.status == 1) {
      res.status(200).json(response.data);
    } else {
      console.error("Error during get all questions:", response.error);
      res.sendStatus(500);
    }
  } catch (error) {
    console.error("Error during question registeration:", error);
    res.sendStatus(500);
  }
};

module.exports = {
  getAllPopularQuestions,
};
