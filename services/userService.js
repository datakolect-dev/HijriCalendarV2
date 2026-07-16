import fs from "fs";

const USERS_FILE = "./storage/users.json";


export function getUsers(){

    if(!fs.existsSync(USERS_FILE)){
        return [];
    }


    return JSON.parse(
        fs.readFileSync(USERS_FILE)
    );

}



export function saveUsers(users){

    fs.writeFileSync(

        USERS_FILE,

        JSON.stringify(users,null,2)

    );

}



export function getUser(device_id){

    const users = getUsers();


    return users.find(

        user => user.device_id === device_id

    );

}



export function updateUser(device_id, settings){


    let users = getUsers();


    let user = users.find(

        u => u.device_id === device_id

    );


    if(!user){

        user = {

            device_id,

            settings:{}

        };

        users.push(user);

    }


    user.settings = settings;


    saveUsers(users);


    return user;

}