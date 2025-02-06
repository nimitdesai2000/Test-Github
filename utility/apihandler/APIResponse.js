/**
 * @desc Send API  Response
 * 
 * 
 * @
 */
const {HttpStatusCode}=require('../HttpStatusCode');

exports.APIResponse = (response,httpstatuscode,resultstatus,data,message)=>{
    let responsedata={};      
    responsedata["result"]=resultstatus;
    responsedata["data"]=data;
    
    if(message){
        responsedata["message"]= message ? message : "";    
    }

    if(httpstatuscode == HttpStatusCode.INTERNAL_SERVER){
        response.sendStatus(HttpStatusCode.INTERNAL_SERVER);
    }else{
        response.status(httpstatuscode).json(responsedata);    
    }      
}