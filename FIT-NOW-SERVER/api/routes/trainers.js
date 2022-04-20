const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const trainerMod = require('../models/trainers');

router.get('/',(req,res,next)=>{
    trainerMod.find().exec().then(doc => {
        console.log(doc)
        console.log("Sarvesh GetAll")
        if(doc.length>0){
            return res.status(200).json({
                doc:doc,
                message:"list recieved"
            });
        }
        else{
            res.status(404).json({message:'no trainers'});
        }
    }).catch(err => {
        console.log(err);
        res.status(500).json({error:err})
    })
});

router.post('/signup',(req,res,next)=>{
    trainerMod.find({email: req.body.email}).exec().then(train => {
        if(train.length > 0){
            return res.status(409).json({
                message: "email already exists"
            }); 
        }
        else{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    return res.status(500).json({
                        error: err,
                        message:"bcrypt isn't working"
                    });
                }
                else{
                    let picture = "";
                    if(!req.body.photo || req.body.photo.length<5){
                        picture = `https://robohash.org/${req.body.email}?set=set2&size=500x500&bgset=bg1`;
                    }
                    else{
                        picture = req.body.photo;
                    }
                    const Trainer = new trainerMod({
                        _id: new mongoose.Types.ObjectId(),
                       name: req.body.name,
                       ph_no: req.body.ph_no,
                       email: req.body.email,
                       age: req.body.age,
                       gender: req.body.gender,
                       city: req.body.city,
                       password: hash,
                       photo: picture,
                       specialization: req.body.specialization,
                       likes:0,
                       dislikes:0
                       });
                       Trainer.save().then(result =>{
                           console.log(result);
                           res.status(200).json({
                               message:"trainer registered",
                               createdTrainer: Trainer
                           });
                       }).catch(err =>{ 
                       console.log(err);
                       res.status(500).json({
                           error:err,
                           message:"couldn't register"
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
    let updateOps={};
    obj=arr
    console.log(obj)
    for (var key in obj){

        if(obj[key].length>0){updateOps[key]=obj[key]}
    }
    if(!updateOps.photo || updateOps.photo.length<5){
        updateOps.photo=`https://robohash.org/${u}?set=set2&size=500x500&bgset=bg1`;
    }
    trainerMod.update({ _id:u },{ $set: updateOps }).exec().then(doc =>{
            if(doc.n===1){
                trainerMod.find({_id:u}).exec().then(doc =>{
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
            res.status(500).json({error:err,message:"patch error"});
        });
});

router.post('/login',(req,res,next)=>{
    trainerMod.find({email: req.body.email}).exec().then(trainer => {
        if(trainer.length < 1){
            res.status(404).json({
                message:"email doesn't exist"
            });
        }
        else{
            bcrypt.compare(req.body.password,trainer[0].password,(err,data)=>{
                if(err){
                    return res.status(401).json({
                        error:err,
                        message:"login failed"
                    });
                }
                if(data){
                    const token = jwt.sign({
                        id: trainer[0]._id
                      }, 'thekeything', { expiresIn: '1h' });
                    return res.status(200).json({
                        message:"login succesful",
                        token:token,
                        user: trainer[0]
                    });
                }
                else{
                    return res.status(401).json({
                        message:"wrong password"
                    });
                }
            })
        }
    }).catch(err =>{
        res.status(500).json({
            error:err,
            message:"login failed"
        });
    });
});

router.delete('/:id',(req,res,next)=>{
    trainerMod.remove({_id:req.params.id}).exec().then(doc =>{
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

router.patch('/like/:id/:i',(req,res,next)=>{
    const i = req.params.i;
    trainerMod.update({ _id:req.params.id },{ $inc:{likes: i} }).exec().then(doc =>{
        if(doc.n===1){
            trainerMod.find({_id:req.params.id}).exec().then(doc =>{
                console.log(doc);
                res.status(200).json({
                    message:"liked",
                    likes:doc[0].likes
                });
            }).catch(err=>{
                console.log(err);
                res.status(500).json({error:err,message:"error in fetching modified data"});
            });
        }
    })
    .catch(err => {
        res.status(500).json({
            message:"liking error",
            error:err
        });
    });
});

router.patch('/dislike/:id/:i',(req,res,next)=>{
    const i = req.params.i;
    trainerMod.update({ _id:req.params.id },{ $inc:{dislikes: i} }).exec().then(doc =>{
        if(doc.n===1){
            trainerMod.find({_id:req.params.id}).exec().then(doc =>{
                console.log(doc);
                res.status(200).json({
                    message:"disliked",
                    dislikes:doc[0].dislikes
                });
            }).catch(err=>{
                console.log(err);
                res.status(500).json({error:err,message:"error in fetching modified data"});
            });
        }
    })
    .catch(err => {
        res.status(500).json({
            message:"disliking error",
            error:err
        });
    });
});

router.get('/:id',(req,res,next)=>{
    const u = req.params.id;
    trainerMod.find({_id:u}).exec().then(doc =>{
        console.log("inside get trained by id");
        console.log(doc);
        if(doc.length>0){
        res.status(200).json({
            message:"found",
            doc:doc[0]
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