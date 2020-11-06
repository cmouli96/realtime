const express = require("express") 
const path = require("path") 
const multer = require("multer") 
const app = express() 
const fs=require('fs');
const monk = require('monk');
const db = monk('localhost:27017/nodetest1');
// View Engine Setup 
app.set("views",path.join(__dirname,"views")) 
app.set("view engine","ejs") 
uploadfolder=path.join(__dirname,"uploads")
// const uploadFolder = __basedir + '/uploads/';
    
// var upload = multer({ dest: "Upload_folder_name" }) 
// If you do not want to use diskStorage then uncomment it 
    
// var storage = multer.diskStorage({ 
//     destination: function (req, file, cb) { 
  
//         // Uploads is the Upload_folder_name 
//         cb(null, "uploads") 
//     }, 
//     filename: function (req, file, cb) { 
//         // console.log(path.extname( 
//         //     file.originalname).toLowerCase());
//         var val=path.extname(file.originalname).toLowerCase();
//         console.log(val);
//       cb(null, file.fieldname + "-" + Date.now()+val); 
//     } 
//   }) 
const GridFsStorage = require("multer-gridfs-storage");

var storage = new GridFsStorage({
  url: "mongodb://localhost:27017/bezkoder_files_db",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-bezkoder-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "photos",
      filename: `${Date.now()}-bezkoder-${file.originalname}`
    };
  }
});
       
// Define the maximum size for uploading 
// picture i.e. 1 MB. it is optional 
const maxSize = 1 * 1000 * 1000; 
    
var upload = multer({  
    storage: storage, 
    limits: { fileSize: maxSize }, 
    fileFilter: function (req, file, cb){ 
    
        // Set the filetypes, it is optional 
        var filetypes = /octet-stream|plain|jpeg|jpg|png|docx|txt/; 
        console.log(file.mimetype);
        var mimetype = filetypes.test(file.mimetype); 
        console.log(mimetype);
        var extname = filetypes.test(path.extname( 
                    file.originalname).toLowerCase()); 
        console.log(path.extname( 
            file.originalname).toLowerCase());
        console.log(extname);
        if (mimetype && extname) { 
            return cb(null, true); 
        } 
      
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes); 
      }  
  
// mypic is the name of file attribute 
}).single("mypic");        
  
app.get("/",function(req,res){ 
    res.render("user"); 
}) 
    
app.post("/uploadProfilePicture",function (req, res, next) { 
        
    // Error MiddleWare for multer file upload, so if any 
    // error occurs, the image would not be uploaded! 
    upload(req,res,function(err) { 
  
        if(err) { 
  
            // ERROR occured (here it can be occured due 
            // to uploading image of size greater than 
            // 1MB or uploading different file type) 
            res.send(err) 
        } 
        else { 
  
            // SUCCESS, image successfully uploaded 
            res.send("Success, Image uploaded!") 
        } 
    }) 
}) 

app.get("/allfiles",function(req,res,next){
        fs.readdir(uploadfolder, (err, files) => {
          res.send(files);
        })
})
app.get("/down",function(req,res,next){
    res.render("download");
})
app.get("/download",function(req,res,next){
    var filename = req.query.myfilename;
    console.log(filename);
    res.download(uploadfolder + '\\'+filename);
})
// Take any port number of your choice which 
// is not taken by any other process 
app.listen(3001,function(error) { 
    if(error) throw error 
        console.log("Server created Successfully on PORT 3001") 
}) 