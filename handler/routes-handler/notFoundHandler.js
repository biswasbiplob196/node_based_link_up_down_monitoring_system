// not Found handler 

const handler ={};

handler.notFoundHandler  = (requestProperties, callback)=>{
    callback (404, {
        massage : ' your requested url is not matching.'
    })
}

module.exports = handler; 