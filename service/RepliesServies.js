const { INTEGER } = require('sequelize')
const dbconfig = require('../config/dbconfig/dbconfigmain')
const logger = require("../config/logger/logger.config");
const redisClient=require("../config/dbconfig/cachedbconfig/redisconfig");
const { sendNotificationToUsers } = require('./NotificationService');
const { QuestionReply, User,Sequelize,sequelize,Question } = dbconfig.models


const addQuestionReply = async(replydata)=>{
    const transaction = await sequelize.transaction();
    try {
        logger.info("RepliesServies ---> addQuestionReply ---> Reached.");

        const { reply, question_id, parent_question_reply_id, reply_date, companyId, userId } = replydata;
        const replysdata = await QuestionReply.create({
            reply: reply,
            question_id: question_id,
            parent_question_reply_id: parent_question_reply_id,
            reply_by: userId,
            reply_date: reply_date,
            company_id: companyId,
        },{transaction});
        const getRedisEntityData=await redisClient.get('ENTITY_DATA');
        const jsonEntityData=JSON.parse(getRedisEntityData);
        const entity_id=jsonEntityData.questions_mst;
        const notifcationObject={
            "title":"New Reply Added",
            "content":"On Question",
            "entity_id":entity_id,
            "entity_value":replysdata.id

        }
        const {QuestionUserId,ReplyUserId}=await getQuestionRelatedData(question_id,parent_question_reply_id);
        if(parent_question_reply_id!=null){
            if(QuestionUserId!=ReplyUserId){
                await sendNotificationToUsers([QuestionUserId,ReplyUserId],notifcationObject,transaction);
            }else{
                await sendNotificationToUsers([ReplyUserId],notifcationObject,transaction);
            }
            
        }else{
                await sendNotificationToUsers([QuestionUserId],notifcationObject,transaction);
        }
        await transaction.commit();
        logger.info("RepliesServies ---> addQuestionReply ---> End.");
        return replysdata;        
    } catch (error) {
        await transaction.rollback();
        logger.error("RepliesServies ---> addQuestionReply ---> Error: ", error);
        throw error;
    }
    
}
//Get Questions UserId
const getQuestionRelatedData=async(questionId,replyId)=>{
    try{
        logger.info("RepliesServies ---> getQuestionOwner ---> Reached.");
        const object={};
        if(questionId!=null && questionId!=undefined){
            const QuestionOwnerId=await Question.findOne({
                attributes:["created_by"],
                where:{id:questionId}
            })
            object["QuestionUserId"]=QuestionOwnerId.created_by;
        }
        
        if(replyId!=null && replyId!=undefined){
            const mainReplyId=await QuestionReply.findOne({
                attributes:["reply_by"],
                where:{id:replyId}
            })
            object["ReplyUserId"]=mainReplyId.reply_by;
        }
        return object;

    }catch(error){
        logger.error("RepliesServies ---> getQuestionOwner ---> Error: ", error);
        throw error;
    }
}

const getAllReplyCount = async(questionIds)=>{
    console.log(questionIds)

    try {
        const repliesCount = await QuestionReply.findAll({
            attributes: [
              [sequelize.fn("COUNT", sequelize.col("*")), "question_reply_count"],
              "question_id",
            ],
            where: {
              question_id: {
                [Sequelize.Op.in]: questionIds.map(Number),
              },
              parent_question_reply_id: null,
            },
            group: ["question_id"],
          });
          return repliesCount;                   
    } catch (error) {

        logger.error("RepliesServies ---> getAllReplyCount ---> Error: ", error);
        throw error;
    }
}

async function getReplyByQuestionid(questionid, limitvalue, offsetvalue){
    const id = questionid
    try{
        const mainReplies = await QuestionReply.findAll({
            where: { 
                question_id: id,
                parent_question_reply_id: null
            },
            order: [
               
                ['reply_date', 'DESC'],
            ],
            attributes: ['id','reply','reply_date', 'reply_by'],
            offset:Number(offsetvalue),
            limit:Number(limitvalue),
            include:[
            {
                model: User,
                as: "createdBy",
                attributes: ['id','name','created_date']
            }
            ]
        });
        
        const childReplies = await QuestionReply.findAll({
            where: { 
                question_id: id
            },
            order: [
                ['reply_date', 'DESC'],
                ['id', 'DESC'],
            ],
            attributes: ['id','reply','reply_date', 'reply_by', 'parent_question_reply_id'],
            include:[
            {
                model: User,
                as: "createdBy",
                attributes: ['id','name','created_date']
            }
            ]
        });

        const questionReplyWisedata = mainReplies.map(item => {
            const childData = childReplies
                .filter(item2 => item2.parent_question_reply_id === item.id)
                .map((childReply) => ({
                    reply: childReply.reply,
                    createdBy: {
                        id: childReply.createdBy.id,
                        name: childReply.createdBy.name,
                        created_date: childReply.createdBy.created_date
                    },
                    updated_date: childReply.reply_date,
                    id: childReply.id
                }));

            return {
                id: item.id,
                reply: item.reply,
                question_id: item.question_id,
                parent_question_reply_id: item.parent_question_reply_id,
                createdBy: {
                    id: item.createdBy.id,
                    name: item.createdBy.name,
                    created_date: item.createdBy.created_date
                },
                reply_date: item.reply_date,
                company_id: item.company_id,
                child_data: childData
            };
        });

        return questionReplyWisedata;
    }catch(error){
        console.error('Error:', error)
        throw error
    }
}

async function getReplyByQuestionId(questionid, limitvalue, offsetvalue){    
    
    try{
        logger.info("RepliesServies ---> getReplyByQuestionId ---> Reached.");

        let jArrFinalResponse=[];
        const arrQuestionMainReplyData = await QuestionReply.findAll({
            where: { 
                question_id: questionid,
                parent_question_reply_id: null
            },
            order: [
                ['reply_date', 'DESC'],
            ],
            attributes: ['id','reply','reply_date', 'reply_by'],
            offset:Number(offsetvalue),
            limit:Number(limitvalue),
            include:[
            {
                model: User,
                as: "createdBy",
                attributes: ['id','name','created_date']
            }
            ]
        });

        let arrQuestionReplyMasterIds = []
        arrQuestionMainReplyData.map(reply => arrQuestionReplyMasterIds.push(reply.id))
    
        const arrQuestionReplyData = await QuestionReply.findAll({
            where: { 
                question_id: questionid,
                parent_question_reply_id: arrQuestionReplyMasterIds,
            },
            order: [
                ['reply_date', 'DESC'],
            ],
            attributes: ['id','reply','reply_date', 'reply_by', 'parent_question_reply_id'],
            include:[
            {
                model: User,
                as: "createdBy",
                attributes: ['id','name','created_date']
            }
            ]
        });
        
        let arrMainQuestionReplyIds = [];
        let objChildReplyData = {};
        let objMainReplyData={};
        
        arrQuestionMainReplyData.map(({ id, reply, reply_date, createdBy }) => {
            const tempMainReplyData = {
                id,
                reply,
                reply_date,
                createdBy: {
                    id: createdBy.id,
                    name: createdBy.name,
                    created_date: createdBy.created_date,
                },
                child_data:[]
                
            };
          
            arrMainQuestionReplyIds.push(id);
            objMainReplyData[id] = tempMainReplyData;           
        });

        arrQuestionReplyData.map(({ id, reply, reply_date, parent_question_reply_id, createdBy }) => {
           
            const tempChildReplyData = {
                id,
                reply,
                reply_date,
                parent_question_reply_id,
                createdBy: {
                    id: createdBy.id,
                    name: createdBy.name,
                    created_date: createdBy.created_date,
                }
                
            };
                 
            objChildReplyData[id] = tempChildReplyData;            
        });

        Object.keys(objChildReplyData).forEach(childId => {
            const parentReplyId = objChildReplyData[childId].parent_question_reply_id;
            
            if (objMainReplyData[parentReplyId]) {                
                objMainReplyData[parentReplyId].child_data.push(objChildReplyData[childId]);
            }
        });

        Object.keys(objMainReplyData).map(replyId => {
            jArrFinalResponse.push(objMainReplyData[replyId]);
        });
        
        jArrFinalResponse.forEach(mainReply => {
            if (mainReply.child_data) {
                mainReply.child_data.reverse();
            }
        });
        
        logger.info("RepliesServies ---> getReplyByQuestionId ---> End.");
        return jArrFinalResponse.reverse();
                
    }catch(error){
        logger.error("RepliesServies ---> getReplyByQuestionId ---> Error: ", error);
        throw error
    }
}

async function getReplyByQuestionsId(questionids, limit, offset){
    
    try{
        logger.info("RepliesServies ---> getReplyByQuestionsId ---> Reached.");

        const id = questionids.split(",");    
        const dataAllQuestions = await Promise.all(id.map(async item => {
            const data = await getReplyByQuestionId(item, limit, offset)
            console.log("Data", data);
            return { question_id: item, data: data}
        }))
       
        logger.info("RepliesServies ---> getReplyByQuestionsId ---> End.");

        return({
            data:dataAllQuestions
        })
        
    }catch(error){
        logger.error("RepliesServies ---> getReplyByQuestionId ---> Error: ", error);
        throw error
    }
}

module.exports = { addQuestionReply , getAllReplyCount, getReplyByQuestionId, getReplyByQuestionsId}
