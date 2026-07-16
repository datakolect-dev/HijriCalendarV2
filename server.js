import express from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import settingsRouter from "./routes/settings.js";

const app = express();

app.use(express.json());
app.use(settingsRouter);


// Permet de servir manifest.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));


const PORT = process.env.PORT || 3000;

const USERS_FILE = "./storage/users.json";

//Créer une fonction pour lire l'utilisateur

function getUserSettings(device_id){

    if(!fs.existsSync(USERS_FILE)){
        return {};
    }


    const users = JSON.parse(

        fs.readFileSync(USERS_FILE)

    );


    const user = users.find(

        u => u.device_id === device_id

    );


    if(!user){

        return {};

    }


    return user.settings || {};

}


/*
    Nettoyage des caractères incompatibles LaMetric
*/

function normalizeText(text) {

    return text
        .normalize("NFD")

        // Supprime tous les accents Unicode
        .replace(/[\u0300-\u036f]/g, "")

        // Lettres spéciales de translittération
        .replace(/ʿ/g, "")
        .replace(/ʾ/g, "")

        // Supprime tous les caractères non ASCII
        .replace(/[^\x00-\x7F]/g, "");

}



/*
    Page test
*/

app.get("/", (req, res) => {

    res.json({

        status: "Hijri Calendar running"

    });

});



/*
    Installation LaMetric
*/

app.post("/install",(req,res)=>{


    let users=[];



    if(fs.existsSync(USERS_FILE)){


        users = JSON.parse(

            fs.readFileSync(USERS_FILE)

        );


    }



    const existing = users.find(

        u => u.device_id === req.body.id

    );



    if(!existing){


        users.push({

            device_id:req.body.id,


            settings:{


                adjustment:0,

                method:"3",

                dayChange:"midnight",

                city:"",

                country:""


            },


            installed_at:new Date().toISOString()


        });


    }



    fs.writeFileSync(

        USERS_FILE,

        JSON.stringify(users,null,2)

    );



    res.json({

        success:true

    });



});


/*
    Désinstallation LaMetric
*/

app.post("/uninstall", (req, res) => {


    let users = [];


    if (fs.existsSync(USERS_FILE)) {

        users = JSON.parse(
            fs.readFileSync(USERS_FILE)
        );

    }



    users = users.filter(

        user => user.device_id !== req.body.id

    );



    fs.writeFileSync(

        USERS_FILE,

        JSON.stringify(users, null, 2)

    );



    res.json({

        success: true

    });


});


/*
    Endpoint LaMetric
*/

app.get("/hijri", async(req,res)=>{


    try{


        const device_id = req.query.device_id;

        const settings = getUserSettings(device_id);


        console.log(
            "Device :",
            device_id
        );


        console.log(
            "Settings :",
            settings
        );


        const response = await axios.get(

            "https://api.aladhan.com/v1/gToH"

        );


        const hijri = response.data.data.hijri;


        const cleanMonth = normalizeText(

            hijri.month.en

        );


        res.json({

            frames:[


                {

                    icon:"i18433",

                    text:
                    `${hijri.day} ${cleanMonth}`

                },


                {

                    icon:"i18433",

                    text:
                    `${hijri.year} AH`

                }


            ]

        });



    }


    catch(error){


        console.log(error);


        res.status(500).json({

            error:"Hijri API error"

        });


    }


});


app.listen(PORT, () => {


    console.log(

        `Hijri Calendar running on port ${PORT}`

    );


});