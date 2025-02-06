const dbconfig = require("../config/dbconfig/dbconfigmain");
const { QuestionUpvotes,sequelize,Sequelize } = dbconfig.models;

const addQuestionUpvotes = async (req, res) => {
    const { question_id, userId, companyId } = req;

    try {
        QuestionUpvotes.create({
          question_id: question_id,
          company_id: companyId,
          upvoted_by: userId,
        }).then((createdQuestion) => {
            return res
            .status(200)
            .json({ message: "Question Upvotes Successfully" });
        });
      } catch (error) {
        console.error("Error during question upvotes:", error);
        res.sendStatus(500).json({ message: "ERROR during adding Question Upvotes" });;
      }
  };

  const deleteQuestionUpvotes = async (req, res) => {
    const { question_id, userId, companyId } = req;

    try {
        const existingQuestionUpvotes = await QuestionUpvotes.findOne({
          where: { question_id: question_id, company_id: companyId, upvoted_by:userId },
        });
    
        if (!existingQuestionUpvotes) {
          return { status: 404, error: "QuestionUpvote not found" };
        }
    
        await existingQuestionUpvotes.destroy();
    
        return res
            .status(200)
            .json({ message: "Question Upvotes Deleted Successfully" });
      } catch (error) {
        console.error("Error during question upvotes:", error);
        res.sendStatus(500).json({ message: "ERROR during deleting Question Upvotes" });;
      }
  };

  const getQuestionUpvotes = async (questionIds,companyId) => {
    try {
      const upvotes = await QuestionUpvotes.findAll({
        attributes: ['question_id', [sequelize.fn('COUNT', 'question_id'), 'count']],
        where: {
          question_id: {
            [Sequelize.Op.in]: questionIds,
          },
          company_id: companyId,
        },
        group: ['question_id'],
      });
      return upvotes
    }
    catch (error) {
      console.error("Error during question upvotes:", error);
      return undefined;
    }
  }

  const isQuestionUpvotesByUser = async (questionIds,userId,companyId) => {
    try {
      const upvotesUserData = await QuestionUpvotes.findAll({
        where: { question_id: questionIds, company_id: companyId, upvoted_by: userId },
      });
      return upvotesUserData
    }
    catch (error) {
      console.error("Error during question upvotes:", error);
      return undefined;
    }
  }


  module.exports = {addQuestionUpvotes,deleteQuestionUpvotes,getQuestionUpvotes,isQuestionUpvotesByUser};
  