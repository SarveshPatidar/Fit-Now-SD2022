const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userMod = require('../models/users');

router.get('/',(req,res,next)=>{
    userMod.find().exec().then(doc => {
        console.log(doc)
        if(doc.length>0){
            return res.status(200).json({
                doc:doc,
                message:"list recieved"
            });
        }
        else{
            res.status(404).json({message:'no users :('});
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error:err,
            message:'get failed'
        });
    });
});

router.post('/signup',(req,res,next)=>{
    userMod.find({email: req.body.email}).exec().then(train => {
        if(train.length > 0){
            return res.status(409).json({
                message: "email already exists"
            }); 
        }
        else{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    return res.status(500).json({
                        message:"bcrypt failed",
                        error: err
                    });
                }
                else{
                    const User = new userMod({
                        _id: new mongoose.Types.ObjectId(),
                       name: req.body.name,
                       ph_no: req.body.ph_no,
                       email: req.body.email,
                       age: req.body.age,
                       gender: req.body.gender,
                       password: hash
                       });
                       User.save().then(result =>{
                           console.log(result);
                           res.status(200).json({
                               message:"new user registered",
                               createdUser: User
                           });
                       }).catch(err =>{ 
                       console.log(err);
                       res.status(500).json({
                           error:err,
                           message:"error registering user"
                        });
                    });
                }
            });
        }
    }).catch();
  
});

router.patch('/:id',(req,res,next)=>{
    const u = req.params.id;
    arr=req.body;
    const updateOps={};
    obj=arr
    console.log(obj)
    for (var key in obj){

        if(obj[key].length>0){updateOps[key]=obj[key]}
    }
    
    userMod.update({ _id:u },{ $set: updateOps }).exec().then(doc =>{
            if(doc.n===1){
                userMod.find({_id:u}).exec().then(doc =>{
                    console.log(doc);
                    res.status(200).json({
                        message:"modified",
                        new:doc[0]
                    });
                }).catch(err=>{
                    console.log(err);
                    res.status(500).json({error:err,message:"error in fetching modified data"});
                });
            }
        }).catch(err =>{
            res.status(500).json([{error:err,message:"patch error"}]);
        });
});

router.post('/login',(req,res,next)=>{
    userMod.find({email: req.body.email}).exec().then(user => {
        if(user.length < 1){
            res.status(404).json({
                message:"email doesn't exist"
            });
        }
        else{
            bcrypt.compare(req.body.password,user[0].password,(err,data)=>{
                if(err){
                    return res.status(401).json({
                        error:err,
                        message:"login failed"
                    });
                }
                if(data){
                    const token = jwt.sign({
                        id: user[0]._id
                      }, 'thekeything', { expiresIn: '1h' });
                    return res.status(200).json({
                        message:"login succesful",
                        user:user[0],
                        token:token
                    });
                }
                else{
                    return res.status(401).json({
                        message:"wrong password"
                    });
                }
            });
        }
    }).catch(err =>{
        res.status(500).json({
            error:err,
            message:"login failed"
        });
    });
});

router.delete('/:id',(req,res,next)=>{
    userMod.remove({_id:req.params.id}).exec().then(doc =>{
        if(doc.n>0){
            return res.status(200).json({
                message:"deleted successfully",
            });
        }
        else {
            return res.status(200).json({
                message:"nothing deleted",
            });
        }
    }).catch(err=>{
        console.log(err);
        res.status(500).json({
            message:"deletion error",
            error:err
        });
    });
}); 

router.get('/:id',(req,res,next)=>{
    const u = req.params.id;
    userMod.find({_id:u}).exec().then(doc =>{
        console.log(doc);
        if(doc.length>0){
        res.status(200).json({
            message:"user found",
            user: doc[0]
        });
        }
        else{
            res.status(404).json({message:'no valid entry found'});
        }
    }).catch(err=>{
        console.log(err);
        res.status(500).json({message:err});
    });
});

module.exports = router;