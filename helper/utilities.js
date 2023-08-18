//description : Utilities Functions

//dependency
const crypto = require('crypto');

const utilities = {};
const enviroment = require('../helper/environments')

//parse JSON : String to object;

utilities.parseJSON = (jsonString) =>{
    let output ;
    try {
        output = JSON.parse(jsonString);
    
    } catch {
        console.log('bodyparsing error')
    }
        return output ;
}

//password hashing:

utilities.hash = (str) => {
    if( typeof (str)==='string' && str.length >0){

        const hash = crypto.createHmac('sha256', enviroment.secrectKey)
        .update(str)
        .digest('hex');
        return hash
    }else{
        return false;
    }
}

// create Random String
utilities.createRandomString = (strlenth) => {
    let output ='';
    let lenght = typeof(strlenth) ==='number'
    if(lenght){
        let possibleCharacter = 'abcdefghijklmnopqrstuvwxz1234567890';
        for( let i =1; i<=strlenth; i+=1){
            let randomCharacter = possibleCharacter.charAt(Math.floor(Math.random()*possibleCharacter.length)); 
        output += randomCharacter;
        }
        return output ;
    }else{
        return false;
    }
}

module.exports = utilities;