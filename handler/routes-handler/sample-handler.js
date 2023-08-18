// sample handler 

const handler ={};

handler.samplehandler  = (requestProperties, callback)=>{
    console.log(requestProperties);
    callback (200, {
        massage : 'This is a sample URL !'
    })
    console.log('samplehandler');
}

module.exports = handler; 