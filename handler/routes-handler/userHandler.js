// user handler 

//dependencies

const data = require('../../lib/data')
const {hash} = require('../../helper/utilities')
const {parseJSON} = require('../../helper/utilities');
const {token_varify} = require('./tokenHandler')


const handler ={};

handler.userhandler  = (requestProperties, callback)=>{
    const acceptedMethod = ['get','post', 'put', 'delete'];
    if(acceptedMethod.indexOf(requestProperties.method) > -1){
        handler_user[requestProperties.method](requestProperties, callback);
    }else{
        callback (405);
    }
    
};

const handler_user = {};

handler_user.post = (requestProperties, callback) => {
    
    
    const firstName = typeof(requestProperties.body.firstName) === 'string'? 
     requestProperties.body.firstName : false;
    
     const lastName = typeof(requestProperties.body.lastName) === 'string' ? 
     requestProperties.body.lastName : false;
     const phone = typeof(requestProperties.body.phone) === 'string' ? 
     requestProperties.body.phone : false;
     const password = typeof(requestProperties.body.password) === 'string' ? 
     requestProperties.body.password : false;

     const tarmOfAgrreement = typeof(requestProperties.body.tarmOfAgrreement) === 'boolean' ? 
     requestProperties.body.tarmOfAgrreement : false;

     if(firstName && lastName && phone && password && tarmOfAgrreement){
        
        let token = typeof(requestProperties.headerObject.token)=== 'string' ?  requestProperties.headerObject.token : false;
    
        //data checking for it has or not .
        data.read('user',phone, (err1)=>{
            if(err1){
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password : hash(password),
                    tarmOfAgrreement,
                }
                data.create('user', phone, userObject, (err2)=>{
                    if(!err2){
                        callback(200, {
                            massage : ' User created successfully!'
                        })
                    }else{
                        callback(500, {
                            error: 'could not creat user'
                        })
                    }
                })
            }else{
                callback(500, {massage : 'user already existed!'})
            }
        })
        

        
     }else{
        // callback(400, {
        //     error : 'problem in your requested data'
        // })
        console.log(firstName, lastName, phone, password)
     }
};

handler_user.get = (requestProperties, callback) => {
    
    
    const phone = typeof(requestProperties.queryStringObject.phone) === 'string' ? 
        requestProperties.queryStringObject.phone : false;


     if (phone){
        let token = typeof(requestProperties.headerObject.token)=== 'string' ?  requestProperties.headerObject.token : false;
    
        // checking user authentication
    token_varify(token , phone, (tokenid) =>{
        if(tokenid){
            data.read('user',phone, (error, u)=>{
                const user = parseJSON(u);
                console.log(user);
                if(!error && user){
                    delete user.password;
                    callback(200, user);
                }
                else{
                    callback(404, {
                        'error': 'Requested user is not found.'
                    })
                }
            })
        }else{
            callback(403, {
            massage : 'unauthenticated error'
          })
        }
    } )

     }else{
        callback(404, {
            'error': 'Requested user is not found.'
        })
     }
};
handler_user.put = (requestProperties, callback) => {

    //phone number checking for validity
    const firstName = typeof(requestProperties.body.firstName) === 'string'? 
     requestProperties.body.firstName : false;
    const lastName = typeof(requestProperties.body.lastName) === 'string' ? 
     requestProperties.body.lastName : false;
    const phone = typeof(requestProperties.body.phone) === 'string' ? 
     requestProperties.body.phone : false;
    const password = typeof(requestProperties.body.password) === 'string' ? 
     requestProperties.body.password : false;

     if(phone){
        if (firstName || lastName || password ){

            let token = typeof(requestProperties.headerObject.token)=== 'string' ?  requestProperties.headerObject.token : false;
    
            // checking user authentication
        token_varify(token , phone, (tokenid) =>{
            if(tokenid){
                //look up the the phone number
            data.read('user', phone, (err, uData) =>{
                const userData = { ... parseJSON(uData) };
                if(!err && userData){
                        if(firstName){
                            userData.firstName = firstName;
                        }
                        if(lastName){
                            userData.lastName = lastName;
                        }
                        if(password){
                            userData.password = hash(password);
                        }

                        //store the data
                        data.update('user',phone , userData, (err)=>{
                            if(!err){
                                callback(200, {
                                    massage : 'updated successfully!'
                                })
                            }else{
                                callback(500, {
                                    error : 'server error!'
                                })
                            }
                        })
                }else{
                    callback(404, {
                        error : 'data not found!'
                    })
                }
            })
            }else{
                callback(403, {
                massage : 'unauthenticated error'
              })
            }
        } )

            
        }else{
            callback(404, {
                error : 'you have to correct one input.'
            })
        }
     }else{
        callback(404, {
            error : 'Invalid Phone Number'
        })
     }

};
handler_user.delete = (requestProperties, callback) => {
    const phone = typeof(requestProperties.queryStringObject.phone) === 'string' ? 
     requestProperties.queryStringObject.phone : false;

    if(phone){

        
        let token = typeof(requestProperties.headerObject.token)=== 'string' ?  requestProperties.headerObject.token : false;
    
        // checking user authentication
    token_varify(token , phone, (tokenid) =>{
        if(tokenid){
        //look up the phone number
        data.read('user', phone, (err, userdata) => {
            if(!err){
               data.delete('user',phone, (err1)=>{
                   if(err1){
                       callback(500, {
                           error :' server sided error'
                       })
                   }else{
                       callback(200 , {
                           massage :' User is deleted successfully!'
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
            callback(403, {
            massage : 'unauthenticated error'
          })
        }
    } )
        //look up the phone number
        data.read('user', phone, (err, userdata) => {
             if(!err){
                data.delete('user',phone, (err1)=>{
                    if(err1){
                        callback(500, {
                            error :' server sided error'
                        })
                    }else{
                        callback(200 , {
                            massage :' User is deleted successfully!'
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


module.exports = handler; 