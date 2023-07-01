const router =require("express").Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const express=require('express');
const bodyParser=require("body-parser");
const AWS = require('aws-sdk');
const path=require("path");
const app=express();
const sendGridMail=require("@sendgrid/mail");

sendGridMail.setApiKey("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");

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}));


const CreatePDF=async(newpost)=>{
    const doc = new PDFDocument();


doc.pipe(fs.createWriteStream(`${newpost.Client_name}`+`${newpost.Productid}`+`.pdf`));


// doc
//    .image(logo,60, 25, {width:65});


doc
  
   .fontSize(30)
   .text("PROPCB",150,35);
 doc.moveDown();
doc
 .fontSize(30)
 .text("",150,67)
 

 doc.rect(50, 110, 450,0).stroke();
 doc.moveDown();
  doc
  .fontSize(20)
  .text(`Date:${Date.now()}`,{
    align: 'right'
  });
  doc.moveDown();

doc
  .fontSize(25)
  .text(newpost.Productid);
  doc.moveDown();

doc
  .fontSize(15)
  .text(`DOI:${newpost.DOI}`);

  doc.moveDown();
doc
  .fontSize(15)
  .text(`IF:${newpost.IF}`);

  doc.moveDown();
  doc
  .fontSize(15)
  .text(`PP:${newpost.PP}`);

  doc.moveDown();
doc
  .fontSize(15)
  .text(`IISN:${newpost.IISN}`);
  doc.moveDown();
doc
  .fontSize(15)
  .text(`Vol:${newpost.vol}`);

  doc.moveDown();

  doc
  .fontSize(15)
  .text(`Publication:${newpost.Publication}`);

  doc.moveDown();

doc
  .fontSize(15)
  .text(`Description of Publication:${newpost.Desc}`)
  doc.moveDown();
doc
  .fillColor('blue')
  .text(`Link:${newpost.Link}`,)
  .link(100, 100, 160, 27,newpost.Link);

  doc.rect(10, 1000,0,0).stroke();
doc.end();
}

function getMessage(emailPerson,li) {
    console.log("li:"+li);
    return {
      to:emailPerson,
      from: 'venki21122@gmail.com',
      subject: 'PROPCB',
      text: "INVOICE",
      html: `<a href=${li}>${li}</a>`,
    };
}
async function sendOrderConfirmation(email,li) {
    try {
      await sendGridMail.send(getMessage(email,li));
      return true;
    } catch (error) {
      const message = "mail not sent successfully";
      console.error(message);
      console.error(error);
      if (error.response) {
        console.error(error.response.body)
      }
      return {message};
    }
  }

const s3 = new AWS.S3({
    accessKeyId:"AKIA2VK5A5XII7JRMZTU",
    secretAccessKey:"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"				
  });
  
  function uploadToS3(bucketName, filePath,newpost) {
    var fileName = path.basename(`./`+`${newpost.Client_name}`+`${newpost.Productid}`+`.pdf`);
    var fileStream = fs.createReadStream(`./`+`${newpost.Client_name}`+`${newpost.Productid}`+`.pdf`);
  
    var keyName = path.join( fileName);
  
    return new Promise(function(resolve, reject) {
        fileStream.once('error', reject);
        s3.upload({
            Bucket: bucketName,
            Key: keyName,
            Body: fileStream,
            ACL:"public-read"
  
        })
            .promise()
            .then(resolve, reject);
    });
  }
  

  router.post("/",async(req,res)=>{
  
    try{  
      const newpost=({
        Client_name:req.body.name,
        Address:req.body.address,
        email:req.body.email,
        Productid:req.body.product,
        total:req.body.total
    })
    CreatePDF(newpost);
    var filePath =`./`+`${newpost.Client_name}`+`${newpost.Productid}`+`.pdf`;

    uploadToS3 ('propcb', filePath,newpost).then(function(result) {
    
      console.info('Success! Uploaded ' + filePath + ' to ' + result.Location);
      console.log(result.Location);

      if(sendOrderConfirmation(req.body.email,result.Location)){
        res.send("succesfully created the pdf");
      }
      else{
        res.status(400).send("error while sending the mail");
      }
       
  });
    }
    catch(err){
        res.status(400).send("internal server error");
    }
      
     
  });
  
  
  module.exports=router;