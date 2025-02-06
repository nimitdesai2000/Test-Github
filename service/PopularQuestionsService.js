const dbconfig = require("../config/dbconfig/dbconfigmain");
const { PopularQuestion, Question } = dbconfig.models;

const insertUpdatePopularQuestions = async (
  popularQuestionsInsertUpdateData
) => {
  try {
    let newPopularQuestion;
    let popularQuestionInsertQueries = [];
    let popularQuestionUpdateQueries = [];
    let questionId;
    let popularQuestion;
    let ifPopularQuestionExist;
    let existingPopularQuestions = await getAllPopularQuestionData();

    for (let i = 0; i < popularQuestionsInsertUpdateData.length; i++) {
      popularQuestion = popularQuestionsInsertUpdateData[i];
      questionId = popularQuestion.question_id;
      ifPopularQuestionExist = await checkExistingPopularQuestion(
        questionId,
        existingPopularQuestions
      );
      if (ifPopularQuestionExist) {
        popularQuestionUpdateQueries.push(popularQuestion);
      } else {
        newPopularQuestion = {
          question_id: popularQuestion.question_id,
          no_of_reply: popularQuestion.no_of_reply,
          no_of_upvotes: popularQuestion.no_of_upvotes,
          company_id: popularQuestion.company_id,
        };
        popularQuestionInsertQueries.push(newPopularQuestion);
      }

      //   if (existingPopularQuestion) {
      //     //Update Popular Question
      //     popularQuestionUpdateQueries.push(existingPopularQuestion);
      //   } else {
      //     // Insert Popular Question
      //     newPopularQuestion = {
      //       question_id: popularQuestion.question_id,
      //       no_of_reply: popularQuestion.no_of_replies,
      //       no_of_upvotes: popularQuestion.no_of_upvotes,
      //       company_id: popularQuestion.company_id,
      //     };
      //     popularQuestionInsertQueries.push(newPopularQuestion);
      //   }
    }
    await Promise.all(
      popularQuestionUpdateQueries.map(async (update) => {
        await PopularQuestion.update(
          {
            no_of_reply: update.no_of_reply,
            no_of_upvotes: update.no_of_upvotes,
          },
          {
            where: {
              question_id: update.question_id,
            },
          }
        );
      })
    );
    const newPopularQuestions = await PopularQuestion.bulkCreate(
      popularQuestionInsertQueries
    );
  } catch (error) {
    console.error("Error:", error);
  }
};

const getAllPopularQuestionData = async (param) => {
  try {
    if (param) {
      const { limit, companyId } = param;
      const options = {
        where: { company_id: companyId },
        order: [["no_of_upvotes", "DESC"]],
        include: [
          {
            model: Question,
            as: "questionId",
            attributes: ["title", "id", "question_key"],
          },
        ],
      };
      if (param && limit && typeof limit === "number" && limit > 0) {
        options.limit = limit;
      }
      const popularQuestions = await PopularQuestion.findAll(options);
      return { status: 1, data: popularQuestions };
    } else {
      const popularQuestions = await PopularQuestion.findAll();
      return { status: 1, data: popularQuestions };
    }
  } catch (error) {
    console.error("Error during get top 10 questions:", error);
    return { status: 0, error: error.message || "Unknown error" };
  }
};

const checkExistingPopularQuestion = async (
  questionId,
  existingPopularQuestions
) => {
  let questionIds = [];
  for (const popularQuestionData of existingPopularQuestions.data) {
    questionIds.push(popularQuestionData.dataValues.question_id);
  }

  if (questionIds.includes(parseInt(questionId))) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  insertUpdatePopularQuestions,
  getAllPopularQuestionData,
};
