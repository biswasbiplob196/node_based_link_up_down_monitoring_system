// check handler 

//dependencies

const data = require('../../lib/data')
require('../../helper/utilities')
const {parseJSON, createRandomString} = require('../../helper/utilities');
const {token_varify} = require('./tokenHandler')
const {maxChecks} = require('../../helper/environments')


const handler ={};

handler.checkhandler  = (requestProperties, callback)=>{
    const acceptedMethod = ['get','post', 'put', 'delete'];
    if(acceptedMethod.indexOf(requestProperties.method) > -1){
        handler_check[requestProperties.method](requestProperties, callback);
    }else{
        callback (405);
    }
    
};

const handler_check = {};

handler_check.post = (requestProperties1, callback) => {
    const requestProperties =  requestProperties1;
    console.log('req body',requestProperties);
    
    //validate the inputs 

    let protocol = typeof(requestProperties.body.protocol)==='string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol :false;
    
    let url = typeof(requestProperties.body.protocol)==='string' && requestProperties.body.url.length > 0 ? requestProperties.body.url :false; 

    let method = typeof(requestProperties.body.method)==='string' && ['post', 'get', 'put', 'delete'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method :false;

    let successCodes = typeof(requestProperties.body.successCodes)==='object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes :false;

    let timeOutSeconds = typeof(requestProperties.body.timeOutSeconds)==='number' && requestProperties.body.timeOutSeconds % 1 === 0 && requestProperties.body.timeOutSeconds >= 1 && requestProperties.body.timeOutSeconds <= 5 ? requestProperties.body.timeOutSeconds :false;


    console.log (protocol, url, method, successCodes, timeOutSeconds);

    if(protocol && url && method && successCodes && timeOutSeconds){
        
        let token = typeof(requestProperties.headerObject.token)=== 'string' ?  requestProperties.headerObject.token : false;

        // look the phone number using token 

        data.read('tokens',token, (err1, tokenData)=>{
            const userPhone = parseJSON(tokenData).phone;
            data.read('user',userPhone, (err2,userData) =>{
                if(!err2 && userData){
                        token_varify(token, userPhone,(tokenValid) =>{
                            if(tokenValid){
                                let userObject = parseJSON(userData);
                                let userChecks = typeof(userData.checks)==='object' && userData.checks instanceof Array ? userData.checks : [];
                                if(userChecks.length < maxChecks){
                                    let checkID = createRandomString(20);
                                    let checkObject = {
                                        id : checkID,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeOutSeconds
                                    }
                                    //save the obeject 
                                    data.create('checks',checkID,checkObject,(err3)=> {
                                        if(!err3){
                                            //add check id to the user obeject
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkID);
                                            
                                            //save the new obeject data
                                            data.update('user',userPhone,userObject,(err4)=>{
                                                if(!err4){
                                                    callback(200, checkObject);
                                                }else{
                                                    callback(500, {
                                                        error: 'there was a server side prblm'
                                                    })
                                                }
                                            })

                                        }else {
                                            callback(500, {
                                                error: 'there was a server side prblm'
                                            })
                                        }
                                    })
                                     
                                }else{
                                    callback(401, {
                                        error: 'you have more then checks limits!'
                                    })
                                }
                            }else{
                                callback(500, {
                                    error: 'Authentication error'
                                })
                            }
                        })
                }else{
                    callback(500, {
                        error: 'user not found'
                    })
                }
            })
        })
    }else{
        callback(404, {
            error: 'you have a problem in your side'
        })
    }

};

handler_check.get = (requestProperties, callback) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' ? 
     requestProperties.queryStringObject.id : false;
     console.log('check id',id)
     if(id){
        //look up the checks 
        data.read('checks',id , (err, checkData)=>{

            console.log('checkdata',checkData)
            if (!err && checkData){
                let token = typeof(requestProperties.headerObject.token)=== 'string' ?  requestProperties.headerObject.token : false;
                console.log('token id',parseJSON(checkData))
                token_varify(token, parseJSON(checkData).userPhone,(tokenValid) =>{
                    console.log(tokenValid)
                    if(tokenValid){
                        callback(200,parseJSON(checkData))
                    }else{
                        callback(403, {
                            error: 'athentication error'
                        })
                    }
                });

            }else {
                callback(404, {
                    error: 'server side error'
                })
            }
        })
     }else{
        callback(404, {
            error: 'you have a problem in your side'
        })
     }
    
};
handler_check.put = (requestProperties, callback) => {


    let id = typeof(requestProperties.body.id)==='string' ? requestProperties.body.id : false;

    let protocol = typeof(requestProperties.body.protocol)==='string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol :false;
    
    let url = typeof(requestProperties.body.protocol)==='string' && requestProperties.body.url.length > 0 ? requestProperties.body.url :false; 

    let method = typeof(requestProperties.body.method)==='string' && ['post', 'get', 'put', 'delete'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method :false;

    let successCodes = typeof(requestProperties.body.successCodes)==='object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes :false;

    let timeOutSeconds = typeof(requestProperties.body.timeOutSeconds)==='number' && requestProperties.body.timeOutSeconds % 1 === 0 && requestProperties.body.timeOutSeconds >= 1 && requestProperties.body.timeOutSeconds <= 5 ? requestProperties.body.timeOutSeconds :false;

    if(id){
        if(protocol || url || method || successCodes || timeOutSeconds){
            data.read('checks', id, (err1,checkData)=>{
                if(!err1 && checkData){
                    let checkObject = parseJSON(checkData);
                    console.log(requestProperties.headerObject.token)
                    let token = requestProperties.headerObject.token;
                    
                    token_varify(token, checkObject.userPhone,(tokenvalid)=>{
                        
                        if(tokenvalid){
                            console.log('token valided',tokenvalid)
                            if(protocol){
                                checkObject.protocol = protocol;
                            }
                            if(method){
                                checkObject.method = method;
                            }
                            if(url){
                                checkObject.url = url;
                            }
                            if(successCodes){
                                checkObject.successCodes = successCodes;
                            }
                            if(timeOutSeconds){
                                checkObject.timeOutSeconds = timeOutSeconds;
                            }
                            console.log(checkObject.id);
                            data.update('checks',checkObject.id, checkObject ,(err2)=>{
                                if(!err2){
                                    callback(200,checkObject)
                                }else{
                                    console.log(err2)
                                }
                            })
                        }else{
                            callback(500, {
                                error: 'token authorization error!'
                            })
                        }
                    })
                }else{
                    callback(500, {
                        error: 'server sided error!'
                    })
                }
            })
        }else{
            callback(500, {
                error: 'Please update at least one field.'
            })
        }

    }else{
        callback(500, {
            error: 'user not found'
        })
    }


};
handler_check.delete = (requestProperties, callback) => {
    const id = typeof(requestProperties.queryStringObject.id) === 'string' ? 
     requestProperties.queryStringObject.id : false;
     
     console.log('check id',id)

     if(id){
        //look up the checks 
        data.read('checks',id , (err, checkData)=>{

            console.log('checkdata',checkData)
            if (!err && checkData){
                let token = typeof(requestProperties.headerObject.token)=== 'string' ?  requestProperties.headerObject.token : false;
                console.log('token id',parseJSON(checkData))
                token_varify(token, parseJSON(checkData).userPhone,(tokenValid) =>{
                    console.log(tokenValid)
                    if(tokenValid){
                        data.delete('checks', id, (err2)=>{
                            if(!err2){
                                data.read('user', parseJSON(checkData).userPhone, (err3, userData)=>{
                                    let userObject = parseJSON(userData)
                                    if(!err3 && userObject){
                                        let usercheck = typeof(userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];
                                    //remove the deleted check id from user 
                                    let checkPosition = usercheck.indexOf(id);
                                    if(checkPosition > -1){
                                        usercheck.splice(checkPosition,1);
                                        //resave the update data
                                        userObject.checks = usercheck;
                                        data.update('user',userObject.phone,userObject,(err4)=>{
                                            if(!err4){
                                                callback(200,userObject)
                                            }else{
                                                callback(403, {
                                                    error: 'server side error for delete'
                                                })
                                            }
                                        })
                                    }else{
                                        callback(403, {
                                            error: 'checkes are not available'
                                        })
                                    }
                                    }else{
                                        callback(500, {
                                            error: 'server error'
                                        })
                                    }
                                })
                            }else{
                                callback(500, {
                                    error: 'server error'
                                })
                            }
                        })

                    }else{
                        callback(403, {
                            error: 'athentication error'
                        })
                    }
                });

            }else {
                callback(404, {
                    error: 'server side error'
                })
            }
        })
     }else{
        callback(404, {
            error: 'you have a problem in your side'
        })
     }
    
};


module.exports = handler; 