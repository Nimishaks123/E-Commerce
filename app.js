const express=require('express')
const session =require('express-session')
const path=require('path')
const bodyparser=require('body-parser')
const app= express()
require('dotenv').config();

//mongoose
const mongoose=require('mongoose')
mongoose.connect(process.env.MONGODB)
.then(()=>
{
    console.log('connected to mongodb');
})
.catch((error)=>
{
    console.error('Error connecting to mongodb',error)
})



app.use(session({
    secret:'ksdnsndjnsdsussj',
    resave:false,
    saveUninitialized:'true'
}))



const adminRoute=require('./routes/adminRoute') 
const userRoute=require('./routes/userRoute')


app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))


app.use(express.static('public'))
app.use(express.static(path.join(__dirname,'public')))

app.use('/admin',adminRoute)
app.use('/',userRoute)




app.listen(3000,()=>console.log('server Running00'))