const dbconfig=require("../config/dbconfig/dbconfigmain.js");
const {UserNotification,sequelize,Sequelize,Notification} = dbconfig.models;
const logger = require("../config/logger/logger.config.js");
const {getMessaging} =require("firebase-admin/messaging");


exports.AddUserToken=async(UserTokenData)=>{
    try{
    logger.info("UserNotificationService ---> AddUserToken ---> Reached.");
    const isTokenWithUserIdExist=await checkUserTokenByUserId(UserTokenData.token,UserTokenData.userId)
    if(!isTokenWithUserIdExist){
        UserNotification.create({
            user_id:UserTokenData.userId,
            notification_token:UserTokenData.token,
            notification_type:1,
            company_id:UserTokenData.companyId
        })
    }
    //await sendNotificationToUsers([1])
    logger.info("UserNotificationService ---> AddUserToken ---> End.");
    }catch(error){
        console.log("UserNotificationService Error",error);
    }

}

const checkUserTokenByUserId= async(UserToken,UserId)=>{

    const result=await UserNotification.findOne({
        where:{"User_id":UserId,"Notification_Token":UserToken}
    });
    if(result){
        return true;
    }else{
        return false;
    }
}
// NotificationObject:{"title":"Test","body":"test"}
exports.sendNotificationToUsers= async(includedUserIds,NotificationObject,transaction)=>{
    try{
    const notificationTokens = await UserNotification.findAll({
        attributes: ['notification_token'],
        where: {
          User_id: {
            [Sequelize.Op.in]: includedUserIds,
          },
        },
      });
    const tokensArray = notificationTokens.map(token => token.notification_token);
    const message = {
        notification: {
          title:NotificationObject.title,
          body:NotificationObject.content
        },
        tokens: tokensArray
      };
    const bulkCreateObject=includedUserIds.map((userId)=>({user_id:userId,title:NotificationObject.title,content:NotificationObject.content,entity_id:NotificationObject.entity_id,entity_value:NotificationObject.entity_value}));
    const insertDataIntoToken=await Notification.bulkCreate(bulkCreateObject,{transaction})
      if(tokensArray.length>0){
        getMessaging().sendMulticast(message)
        .then((response) => {
          // Response is a message ID string.
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });
      }
     
    }catch(error){
        console.log("Error",error);
        throw error;
    }
}

exports.getNotificationBasedOnUser = async (NotificationData) => {
  try {
    logger.info("NotificationService ---> getNotificationBasedOnUser ---> Reached.");
    const { userId, page, limit } = NotificationData;
    const intoffset = parseInt(page);
    const intlimit = parseInt(limit);

    const notificationRows = await Notification.findAndCountAll({
      attributes: ['title', 'content'],
      where: { user_id: userId },
      limit: intlimit,
      offset: intoffset
    });
    logger.info("NotificationService ---> getNotificationBasedOnUser ---> end.");
    return { data: notificationRows }
  } catch (error) {
    logger.error("NotificationService ---> getNotificationBasedOnUser ---> Error: ", error);
    throw error;
  }
}