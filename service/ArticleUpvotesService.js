const dbconfig = require("../config/dbconfig/dbconfigmain");
const { ArticleUpvotes,sequelize,Sequelize } = dbconfig.models;

const addArticleUpvotes = async (req, res) => {
    const { article_id, userId, companyId } = req;

    try {
        ArticleUpvotes.create({
          article_id: article_id,
          company_id: companyId,
          upvoted_by: userId,
        }).then((createdArticle) => {
            return res
            .status(200)
            .json({ message: "Article Upvotes Successfully" });
        });
      } catch (error) {
        console.error("Error during Article upvotes:", error);
        res.sendStatus(500).json({ message: "ERROR during adding Article Upvotes" });;
      }
  };

  const deleteArticleUpvotes = async (req, res) => {
    console.log(req)
    const { article_id, userId, companyId } = req;

    try {
        const existingArticleUpvotes = await ArticleUpvotes.findOne({
          where: { article_id: article_id, company_id: companyId, upvoted_by:userId },
        });
    
        if (!existingArticleUpvotes) {
          return { status: 404, error: "ArticleUpvote not found" };
        }
    
        await existingArticleUpvotes.destroy();
    
        return res
            .status(200)
            .json({ message: "Article Upvotes Deleted Successfully" });
      } catch (error) {
        console.error("Error during Article upvotes:", error);
        res.sendStatus(500).json({ message: "ERROR during deleting Article Upvotes" });;
      }
  };
  const getArticleUpvotes = async (articleIds,companyId) => {
    try {
      const upvotes = await ArticleUpvotes.findAll({
        attributes: ['article_id', [sequelize.fn('COUNT', 'article_id'), 'count']],
        where: {
          article_id: {
            [Sequelize.Op.in]: articleIds,
          },
          company_id: companyId,
        },
        group: ['article_id'],
      });
      return upvotes
    }
    catch (error) {
      console.error("Error during article upvotes:", error);
      return undefined;
    }
  }

  const isArticleUpvotesByUser = async (ArticleIds,userId,companyId) => {
    try {
      const upvotesUserData = await ArticleUpvotes.findAll({
        where: { article_id: ArticleIds, company_id: companyId, upvoted_by: userId },
      });
      return upvotesUserData
    }
    catch (error) {
      console.error("Error during article upvotes:", error);
      return undefined;
    }
  }


  module.exports = {addArticleUpvotes,deleteArticleUpvotes,isArticleUpvotesByUser,getArticleUpvotes};
  