const dbconfig = require("../config/dbconfig/dbconfigmain");
const fsExtra = require('fs-extra');
var path = require('path');
exports.UploadFileController=(req,res)=>{
    // console.log(req.params);
    console.log("Upload Controller",req.body);
    const {myData}=req;
    const {id}=req.body;
    res.status(200).json({
    "success": true,
    "time": "2024-01-02 04:56:17",
    "data": {
        "baseurl": "http:\/\/localhost:3001\/"+"supportfiles\/"+"attachments\/"+id+"\/",
        "msg": [
            "File image.png was uploaded"
        ],
        "files": [
            myData.fileName
        ],
        "isImages": [
            true
        ],
        "code": 220
    },
    "elapsedTime": 0
});

}
exports.deleteFileOnId=(req,res)=>{
    const {id}=req.body;
    console.log("Id on delete FileOnid",id);
    const dir=path.join(__dirname, `../public/supportfiles/attachments/${id}`)
    console.log("Directory Name",dir);
    try{
        fsExtra.remove(dir, (err) => {
            if (err) {
            console.error(`Error deleting folder: ${err}`);
            } else {
            console.log(`Folder deleted successfully`);
            }
        });
        res.status(200).json({"Result":1});
    }catch(err){
        console.log("Error",err);
        res.status(500).json({"Result":0});
    }
      

}