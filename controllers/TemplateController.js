const logger = require('../config/logger/logger.config')
const { APIResponse } = require('../utility/apihandler/APIResponse');
const { Result } = require('../utility/Result');
const { HttpStatusCode } = require('../utility/HttpStatusCode');
const TemplateService= require('../service/TemplateService');
const { request } = require('https');
const { response } = require('express');
                                                                       
const createTemplate = async(request, response)=>{
    
    try {
        logger.info("TemplateController ---> createTemplate ---> Reached.");

        const templatedata = request.body
        const templateResponse = await TemplateService.createTemplate(templatedata);
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('template.save.success'));

        logger.info("TemplateController ---> createTemplate ---> End.");
    } catch (error) {
        logger.error("TemplateController ---> createTemplate ---> Error: ", error);
    }
    
}
const editTemplateId= async(request,response)=>{

    try{
        logger.info("TemplateController ---> editTemplateId ---> Reached.");
        const templatedata = request.body
        const templateId=request.params.id;
        const {data} = await TemplateService.editTemplatebyId(templatedata,templateId);
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('template.save.success'));

    }catch(error){
        logger.error("TemplateController ---> editTemplateId ---> Error: ", error);
    }
}
const getTemplates = async(request,response)=>{
    try{
        logger.info("TemplateController ---> getTemplates ---> Reached.");
        const {limit,offset}=request.query
        const {companyId} = request.body
        const {data} = await TemplateService.getTemplates(companyId,limit,offset);
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('template.get.success'));
        logger.info("TemplateController ---> getTemplates ---> End.");

    }catch(error){
        logger.error("TemplateController ---> getTemplates ---> Error: ", error);

    }
}

const getTemplateById = async(request, response)=>{
    try{
        logger.info("TemplateController ---> getTemplates ---> Reached.");
        const templateId=request.params.id;
        const {companyId} = request.body
        const {data} = await TemplateService.getTemplatebyId(companyId,templateId);
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('template.get.success'));
        logger.info("TemplateController ---> getTemplates ---> End.");

    }catch(error){
        logger.error("TemplateController ---> getTemplates ---> Error: ", error);

    }

}
const deleteTemplateById = async(request, response)=>{
    try{
        logger.info("TemplateController ---> deleteTemplateById ---> Reached.");
        const templateId=request.params.id;
        const {companyId} = request.body
        const {result} = await TemplateService.deleteTemplateById(companyId,templateId);
        if (result == 1) {
            APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, {}, t('template.delete.success'));
        } else {
            APIResponse(response, HttpStatusCode.NOT_FOUND, Result.SUCCESS, {}, t('template.notFound.error'));
        }
        logger.info("TemplateController ---> deleteTemplateById ---> End.");

    }catch(error){
        logger.error("TemplateController ---> deleteTemplateById ---> Error: ", error);

    }

}
const getTemplateType= async(request,response)=>{

    try{
        logger.info("TemplateController ---> createTemplate ---> Reached.");
        const templatedata = request.body
        const {data} = await TemplateService.getTemplateType();
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('template.save.success'));

    }catch(error){
        logger.error("TemplateController ---> createTemplate ---> Error: ", error);
    }
}
const getTemplateVariable= async(request,response)=>{

    try{
        logger.info("TemplateController ---> getTemplateVariable ---> Reached.");
        const templatedata = request.body
        const {data} = await TemplateService.getTemplateVariable();
        APIResponse(response, HttpStatusCode.OK, Result.SUCCESS, data, t('template.save.success'));

    }catch(error){
        logger.error("TemplateController ---> getTemplateVariable ---> Error: ", error);
    }
}


module.exports = {
    createTemplate,
    getTemplateType,
    getTemplates,
    getTemplateVariable,
    getTemplateById,
    editTemplateId,
    deleteTemplateById
}