const dbconfig = require("../config/dbconfig/dbconfigmain");
const { ArticleTag, Tag } = dbconfig.models;

const addArticleTags = async (createArticleData) => {
  try {
    let ArticleTagsIDs = [];
    let newArticleTagObject;
    let tags = createArticleData.tags;

    if (tags && tags.length > 1) {
      for (let i = 0; i < tags.length; i++) {
        newArticleTagObject = {
          article_id: createArticleData.article_id,
          tag_id: tags[i],
        }
        ArticleTagsIDs.push(newArticleTagObject)
      }
    }
    else if (tags.length == 1) {
      newArticleTagObject = {
        article_id: createArticleData.article_id,
        tag_id: tags[0],
      }
      ArticleTagsIDs.push(newArticleTagObject)
    }

    const articleTags = await ArticleTag.bulkCreate(
      ArticleTagsIDs
    );
  } catch (error) {
    console.error("Error during Article Tag id:", error);
  }
};

const getArticeTags = async (req, res) => {
  const question_id = req.params.id
  try {
    const questionTags = await QuestionTag.findAll({
      where: { question_id: question_id },
      include: [
        {
          model: Tag,
          as: "tagId",
          attributes: ["tag_name"],
        },
      ],
    });
    res.status(200).json({ data: questionTags });
  } catch (error) {
    console.error("Error during question upvotes:", error);
    res.sendStatus(500).json({ message: "ERROR during adding Question Upvotes" });;
  }
}

const getArticleTags = async (articleIds) => {
  try {
    const articleTags = await ArticleTag.findAll({
      where: { article_id: articleIds },
    });
    return articleTags;
  } catch (error) {
    console.error("Error during question upvotes:", error);
  }
}

const editArticleTags = async (editArticleData) => {
  try {
    let ArticleTagsIDs = [];
    let newArticleTagObject;
    let tags = editArticleData.tags;
    let prevTags = editArticleData.prevtags;

    if (prevTags && prevTags.length > 0) {
      console.log("Previus Tag Length: ", prevTags.length);
      for (let i = 0; i < prevTags.length; i++) {
        const existingTag = await ArticleTag.findOne({
          where: { article_id: editArticleData.article_id, tag_id: prevTags[i] },
        });
        if (!existingTag) {
          return { status: 404, error: "Tag not found" }
        } else {
          existingTag.destroy();
        }
      }
    }

    if (tags && tags.length > 1) {
      for (let i = 0; i < tags.length; i++) {
        newArticleTagObject = {
          article_id: editArticleData.article_id,
          tag_id: tags[i],
        }
        ArticleTagsIDs.push(newArticleTagObject)
      }
    }
    else if (tags.length == 1) {
      newArticleTagObject = {
        article_id: editArticleData.article_id,
        tag_id: tags[0],
      }
      ArticleTagsIDs.push(newArticleTagObject)
    }

    const articleTags = await ArticleTag.bulkCreate(
      ArticleTagsIDs
    );
  } catch (error) {
    console.error("Error during Article Tag id:", error);
  }
};

module.exports = { addArticleTags, getArticeTags, getArticleTags, editArticleTags };
