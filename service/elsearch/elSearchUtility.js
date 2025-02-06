const elClientConfig = require("../../config/dbconfig/searchdbconfig/elconfig")

const questionIndexParams = {
  index: "questions",
}

async function checkElasticSearchClusterHealth() {
  try {
    const health = await elClientConfig.cluster.health({})
    console.log("EL Cluster Health:", health)
  } catch (error) {
    console.error("EL - Error Checking EL Health:", error)
  }
}

async function addQuestion(questionData) {
  try {
    questionIndexParams["body"] = questionData
    const responsedata = await elClientConfig.index(questionIndexParams)
    console.log("EL - Document Added:", responsedata)
  } catch (error) {
    console.error("EL - Error adding document:", error)
  }
}

async function updateQuestionById(questionId, questionData) {
  try {
    questionIndexParams["id"] = questionId
    questionIndexParams["body"] = { doc: questionData }
    questionIndexParams["refresh"] = "wait_for"
    await elClientConfig.update(questionIndexParams)
  } catch (error) {
    console.error("EL - Error updating document:", error)
  }
}

async function searchQuestions(companyId, content) {
  console.log(content)
  let resultData = {}
  try {
    questionIndexParams.body = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: content,
                fields: ["title", "description"],
              },
            },
          ],
          filter: [
            {
              term: {
                visibility: 1
              },
            },
          ],
        },
      },
    }

    const searchResultData = await elClientConfig.search(questionIndexParams)

    let searchHits = []

    if (searchResultData) {
      searchHits = searchResultData.hits.hits
      if (searchHits) {
        resultData = searchHits.map((hit) => hit._source)
      }
    }

    return searchHits
  } catch (error) {
    console.error("EL - Error Search document:", error)
  }
}

module.exports = {
  checkElasticSearchClusterHealth,
  addQuestion,
  updateQuestionById,
  searchQuestions,
}
