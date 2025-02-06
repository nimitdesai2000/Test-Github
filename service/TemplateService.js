const logger = require('../config/logger/logger.config');
const dbconfig =  require('../config/dbconfig/dbconfigmain')
const Sequelize = require("sequelize");
const {Template,TemplateType,Variable} = dbconfig.models;

const createTemplate = (templatedata)=>{
    try {
        logger.info("TemplateService ---. createTemplate ---> Reached.");
        const response = Template.create({
            channel_type:templatedata.channel_type,
            template_name:templatedata.template_name,
            template_type_id: templatedata.template_type,
            title:templatedata.title,
            body:templatedata.body,
            created_by: templatedata.userId,
            company_id: templatedata.companyId
        });
        logger.info("TemplateService ---> createTemplate --->End.")
        return response;
    } catch (error) {
        logger.error("TemplateService ---> createTemplate ---> Error: ", error);
        throw error;
    }
}

const editTemplatebyId = async (templatedata, templateId)=>{
    try {
        logger.info("TemplateService ---> editTemplateId ---> Reached.");
        const response = await Template.update({
            channel_type:templatedata.channel_type,
            template_name:templatedata.template_name,
            template_type_id: templatedata.template_type,
            title:templatedata.title,
            body:templatedata.body,
            created_by: templatedata.userId,
            modified_by: templatedata.userId,
            modified_date: Date.now()
        },
        {where: {id: templateId,company_id:templatedata.companyId}}
        );
        logger.info("TemplateService ---> createTemplate --->End.")
        return response
    } catch (error) {
        logger.error("TemplateService ---> createTemplate ---> Error: ", error);
        throw error;
    }
}

const getTemplates = async (companyId,limit,offset)=>{
    try {
        logger.info("TemplateService ---> getTemplate ---> Reached.");
        const config={
            where: { company_id: companyId },
            attributes:[
                "id",
                "channel_type",
                "template_name",
                "title",
                "body",
                "created_date",
                [Sequelize.literal('`templateTypeId`.`template_type_name`'), 'template_type_name'],
            ],
            include: [
                {
                  model: TemplateType,
                  as: "templateTypeId",
                  attributes: [],
                },
              ],
            order: [["id", "DESC"]],
        }
        if (limit && offset) {
            config.limit = parseInt(limit);
            config.offset = parseInt(offset);
        }
        const response = await Template.findAndCountAll(config)
        logger.info("TemplateService ---> getTemplate ---> End");
        return {data:response}
    } catch (error) {
        logger.error("TemplateService ---> getTemplate ---> Error: ", error);
        throw error;
    }
}
const getTemplatebyId = async (companyId, templateId)=>{
    try {
        logger.info("TemplateService ---> getTemplatebyId ---> Reached.");
        const response = await Template.findOne({
            where: { company_id: companyId , id:templateId},
            attributes:[
                "id",
                "channel_type",
                "template_name",
                "title",
                "body",
                "created_date",
                "template_type_id",
                [Sequelize.literal('`templateTypeId`.`template_type_name`'), 'template_type_name'],
            ],
            include: [
                {
                  model: TemplateType,
                  as: "templateTypeId",
                  attributes: [],
                },
              ],
            order: [["id", "DESC"]],
        })
        logger.info("TemplateService ---> getTemplatebyId ---> End");
        return {data:response}
    } catch (error) {
        logger.error("TemplateService ---> getTemplatebyId ---> Error: ", error);
        throw error;
    }
}
const deleteTemplateById = async (companyId, templateId)=>{
    try {
        logger.info("TemplateService ---> deleteTemplateById ---> Reached.");
        const existingTemplate = await Template.findOne({
            where:{id: templateId,company_id:companyId}
        })
        if (existingTemplate === null) {
            return { result: 0 }
        }
        await existingTemplate.destroy()
        logger.info("TemplateService ---> deleteTemplateById ---> End");
        return { result: 1 };
    } catch (error) {
        logger.error("TemplateService ---> deleteTemplateById ---> Error: ", error);
        throw error;
    }
}
const getTemplateType=async()=>{
    try {
        logger.info("TemplateService ---> getTemplateType ---> Reached.");
        const templatetype = await TemplateType.findAndCountAll({
            order: [["id", "DESC"]],
        })
        logger.info("TemplateService ---> getTemplateType ---> End");
        return {data: templatetype}
    } catch (error) {
        logger.error("TemplateService ---> getTemplateType ---> Error: ", error);
        throw error;
    }

}
const getTemplateVariable=async()=>{
    try {
        logger.info("TemplateService ---> getTemplateType ---> Reached.");
        const TemplateVariable = await Variable.findAndCountAll({
            order: [["id", "DESC"]],
        })
        logger.info("TemplateService ---> getTemplateType ---> End");
        return {data: TemplateVariable}
    } catch (error) {
        logger.error("TemplateService ---> getTemplateType ---> Error: ", error);
        throw error;
    }

}

module.exports = {
    createTemplate,editTemplatebyId, getTemplates, getTemplatebyId,getTemplateType,getTemplateVariable,deleteTemplateById
}
