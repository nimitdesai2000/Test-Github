const dbconfig = require("../config/dbconfig/dbconfigmain");
const { QuestionTag ,Tag} = dbconfig.models;

const addQuestionTags = async (createQuestionData) => {

    try {
      let questionTagsIDs = [];
      let newQuestionTagObject;
      let tags = createQuestionData.tags;

      if(tags && tags.length > 1) {
        for(let i=0;i<tags.length;i++) {
          newQuestionTagObject = {
            question_id:createQuestionData.question_id,
            tag_id:tags[i],
          }
          questionTagsIDs.push(newQuestionTagObject)
        }
      }
      else if(tags.length == 1) {
        newQuestionTagObject = {
          question_id:createQuestionData.question_id,
          tag_id:tags[0],
        }
        questionTagsIDs.push(newQuestionTagObject)
      }

      const questionTags = await QuestionTag.bulkCreate(
        questionTagsIDs
    );
      } catch (error) {
        console.error("Error during question upvotes:", error);
        res.sendStatus(500).json({ message: "ERROR during adding Question Tag Add" });;
      }
  };

  const getQuestionTags = async(questionIds) => {
    try {
      const questionTags = await QuestionTag.findAll({
        where: { question_id: questionIds },
      });
      return questionTags;
    } catch (error) {
      console.error("Error during question upvotes:", error);
    }
  }

module.exports = {addQuestionTags,getQuestionTags};
  