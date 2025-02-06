const logger = require("../config/logger/logger.config");
const usernotificationservice = require("../service/NotificationService")
const { APIResponse } = require("../utility/apihandler/APIResponse");
const { Result } = require("../utility/Result");
const { HttpStatusCode } = require("../utility/HttpStatusCode");

exports.AddUserNotificationToken = async (request, response) => {
    try {
        logger.info("UserNotificationController ---> AddUserNotificationToken ---> Reached.");
        await usernotificationservice.AddUserToken(request.body);
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('Notification.save.success'));
        logger.info("UserNotificationController ---> AddUserNotificationToken ---> End.");

    } catch (error) {
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
        logger.error("UserNotificationController ---> AddUserNotificationToken ---> Error: ", error);
    }
}
exports.getUserNotifications = async (request, response) => {
    try {
        logger.info("UserNotificationController ---> getNotification ---> Reached.");

        const { userId } = request.body;
        const { page, limit } = request.query;
        const data = await usernotificationservice.getNotificationBasedOnUser({ userId, page, limit });

        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data);
        logger.info("UserNotificationController ---> getNotification ---> End.");

    } catch (error) {
        APIResponse(response, HttpStatusCode.INTERNAL_SERVER, Result.FAIL, {}, t('internal.server.error'));
        logger.error("UserNotificationController ---> getNotification ---> Error: ", error);
    }
}