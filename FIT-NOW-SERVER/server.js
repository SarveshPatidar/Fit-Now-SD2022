const express = require('express');
const mongoose = require('mongoose');

const app = express();

const trainerRoutes=require('./api/routes/trainers');
const userRoutes=require('./api/routes/users');
const adminRoutes=require('./api/routes/admin');

mongoose.connect('mongodb+srv://sarveshpatidar:sarvesh123@cluster0.8376r.mongodb.net/GymTrainerApp?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, GET, DELETE');
        return res.status(200).json({});
    }
    next();
});

app.use('/trainers',trainerRoutes); 
app.use('/users',userRoutes);
app.use('/admin',adminRoutes);
app.use((req,res,next)=>{
    const error = new Error('Route not found in the backend');
    error.status = 404;
    next(error);
});
app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    })
})

app.listen(process.env.PORT || 5001, ()=>{
    if(process.env.PORT){
        console.log(`server is running on port ${process.env.PORT}`);
    }
    else{
        console.log('server is running on port 5000');
    }
});