// image uploading module multer reqiure
const multer=require('multer')

const path=require('path')

// upload folder direction set cheunnu 
const storage=multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,'public/uploads/')
    },
    // path le rename unique aakan date use cheyunnu
    filename:function(req,file,callback)
    {
        const data=Date.now()+'-'+path.extname(file.originalname)
        callback(null,data)
    }
})

// storage set multilpe image set cheyunnu

// Create multer instance with storage configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
    fileFilter: function (req, file, cb) {
      const fileTypes = /jpeg|jpg|png/;
      const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = fileTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      } else {
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      }
    }
  });


  // Expecting multiple files with field name 'product_image'
const uploadFields = upload.array('image',5) 
if(uploadFields)




{
    console.log('Helper multer image uploading')
}else
{
    
    console.log('Helper multer uploading imag problem');
}
module.exports=uploadFields