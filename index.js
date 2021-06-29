const express = require("express");

const ffmpeg = require("fluent-ffmpeg");

const bodyParser = require("body-parser");

const fs = require("fs");

const expressFileUpload = require("express-fileupload");

const app = express();

const PORT = process.env.PORT || 3000

// MIDDLEWARE TO PARSE : 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// MIDDLEWARE TO STORE THE CONVERTED VIDEOS :
app.use(
  expressFileUpload({
    useTempFiles: true,
    tempFileDir: "/downloads/",
  })
);

/* SETTING THE PATH OF FFMPEG WHICH IS INSTALLED LOCALLY 
  ON MY SYSTEM
*/

ffmpeg.setFfmpegPath("C:/ffmpeg/ffmpeg.exe");
ffmpeg.setFfprobePath("C:/ffmpeg/");
ffmpeg.setFlvtoolPath("C:/ffmpeg/flvtool");

app.get("/", (req, res) => {

  // LINKING MY HTML FILE WITH THIS JS FILE :
  
  res.sendFile(__dirname + "/index.html");
});

app.post("/convert", (req, res) => {

 // REFERS TO SELECT ELEMENT IN HTML :
  let to = req.body.to;
 // REFERS THE INPUT ELEMENT WHICH GETS VIDEOS :
 // FILE CONTAINS ALL DETAILS ABOUT VIDEO :
  let file = req.files.inputFile;
  let fileName = `out.${to}`;
  console.log(to);
  console.log(file);

  // UPLOAD THE FILE TO THE DOWNLOADS DIRECTORY :

  file.mv("downloads/" + file.name, function (err) {
    if (err) return res.sendStatus(500).send(err);
    console.log("File Uploaded successfully");
  });

  // CONVERTING VIDEO TO SELECTED FORMAT :

  ffmpeg("downloads/" + file.name)
    .withOutputFormat(to)
    .on("end", function (stdout, stderr) {
      console.log(`Converted to ${to}....`);

      // DOWNLOAD THE FILE :

      res.download(__dirname + fileName, function (err) {
        if (err) throw err;
        fs.unlink(__dirname + fileName, function (err) {
          if (err) throw err;
          
        });
      });
      //DELETING INPUTFILE : 
      fs.unlink("downloads/" + file.name, function (err) {
        if (err) throw err;
       
      });
    })
    // TO RETURN THE ERROR IF SOMETHING HAPPENS :
    .on("error", function (err) {
      console.log("an error happened: " + err.message);
      fs.unlink("downloads/" + file.name, function (err) {
        if (err) throw err;
        console.log("File deleted");
      });
    })
    // TO SAVE THE FILE
    .saveToFile(__dirname + fileName);
  //.pipe(res, { end: true });
});

app.listen(PORT , ()=>{ console.log(`App is started on port...${PORT}`) } );
