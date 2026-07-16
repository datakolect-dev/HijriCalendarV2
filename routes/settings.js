import express from "express";
import fs from "fs";
import {updateUser} from "../services/userService.js";

const router = express.Router();


const USERS_FILE = "./storage/users.json";



router.post("/settings", (req,res)=>{


    const data = req.body;


    let users=[];


    if(fs.existsSync(USERS_FILE)){

        users = JSON.parse(
            fs.readFileSync(USERS_FILE)
        );

    }



    let user = users.find(

        u => u.device_id === data.device_id

    );



    if(!user){

        user = {

            device_id:data.device_id,

            settings:{}

        };


        users.push(user);

    }



    user.settings = {

        adjustment:
        data.adjustment ?? 0,


        method:
        data.method ?? "3",


        dayChange:
        data.dayChange ?? "midnight",


        city:
        data.city ?? "",


        country:
        data.country ?? ""

    };



    fs.writeFileSync(

        USERS_FILE,

        JSON.stringify(users,null,2)

    );



    res.json({

        success:true,

        settings:user.settings

    });



});



export default router;