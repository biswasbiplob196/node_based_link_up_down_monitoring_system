// token handler 

//dependencies

const data = require('../../lib/data')
const {hash} = require('../../helper/utilities')
const {createRandomString} = require('../../helper/utilities')
const {parseJSON} = require('../../helper/utilities');

const handler ={};

handler.tokenhandler  = (requestProperties, callback)=>{
    const acceptedMethod = ['get','post', 'put', 'delete'];
    if(acceptedMethod.indexOf(requestProperties.method) > -1){
        handler_token[requestProperties.method](requestProperties, callback);
    }else{
        callback (405);
    }
    
};

const handler_token = {};

handler_token.post = (requestProperties, callback) => {
    
    const phone = typeof(requestProperties.body.phone) === 'string' ? 
     requestProperties.body.phone : false;

     console.log(phone);
    
     const password = typeof(requestProperties.body.password) === 'string' ? 
     requestProperties.body.password : false;
     console.log('pass is ' ,password)
     
    if(phone && password){
        data.read('user',phone, (err1, uData) => {
           
            let hashedPassword = hash(password);
            let userData =parseJSON(uData);
            console.log('pasered data',uData);
            
            console.log('hasheed data',userData);
            if(hashedPassword === userData.password){
                 let tokenID = createRandomString(20);
                 let expireTime = Date.now() + 60*60*1000;
                 let tokenObject =  {
                    phone,
                    id : tokenID,
                    expireTime
                 };

                 //store the token 
                  data.create('tokens', tokenID, tokenObject, (err2)=>{
                    if(!err2 ){
                        callback(200, tokenObject)
                    }else {
                        callback(500, {
                            error : 'there was a problem in server side'
                        })
                    }
                  })
            }else{
                callback(400, {
                    error : 'Invalid Password!'
                })
            }
        })
    }else{
        
        callback(400, {
            error : 'problem in your requested data'
        })
    }
};


handler_token.get = (requestProperties, callback) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' ? 
     requestProperties.queryStringObject.id : false;

     if (id){
        //LOOK UP token id
        data.read('tokens',id, (error, tokenData)=>{
            const token = parseJSON(tokenData);
            console.log(token);
            if(!error && token){
                callback(200, token);
            }
            else{
                callback(404, {
                    'error': 'Requested token is not found.'
                })
            }
        })
     }else{
        callback(404, {
            'error': 'Requested token is not found.'
        })
     }
};

handler_token.put = (requestProperties, callback) => {
    const id = typeof(requestProperties.body.id) === 'string' ? 
     requestProperties.body.id : false;
     console.log('id',  requestProperties.body);
    
    const extend = requestProperties.body.extend ;
     console.log('id', extend);
    
    if(id && extend){
        data.read('tokens', id, (err1, tokenData) => {
            let tokenObejct = parseJSON(tokenData);
            console.log('token obeject',tokenObejct)
            if(tokenObejct.expireTime > Date.now()){
                tokenObejct.expireTime = Date.now() + 60*60*1000;

                //store the data
                data.update('tokens', id, tokenObejct, (err2)=>{
                    if(!err2){
                        callback(200,{
                            massage :'Expire time updated'
                        })
                    }else{
                        callback(500, {
                            'error': 'Server side error!'
                        })
                    }
                })
            }else{
                callback(404, {
                    'error': 'Please relogin the page.'
                })
            }
        })
    }else {
        callback(404, {
            'error': 'Requested token is not found.'
        })
    }
};

handler_token.delete = (requestProperties, callback) => {

    const id = typeof(requestProperties.queryStringObject.id) === 'string' ? 
     requestProperties.queryStringObject.id : false;

    if(id){
        //look up the id number
        data.read('tokens', id, (err, tokendata) => {
             if(!err){
                data.delete('tokens',id , (err1)=>{
                    if(err1){
                        callback(500, {
                            error :' server sided error'
                        })
                    }else{
                        callback(200 , {
                            massage :' User is logout successfully!'
                        })
                    }
                })
             }else{
                callback(500, {
                    error :'Server Sided problem '
                })
             }
        })
    }else{
        callback(400,{
            error :'there was a problem in your request!'
        })
    }


};

handler.token_varify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData){
            if(parseJSON(tokenData).phone ===phone){
                callback(true)
            }else{
                callback(false)
            }
        }else{
            callback(false)
        }
    })
}


module.exports = handler; 