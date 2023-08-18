// desc : notification module to send a sms to user.


// Dependencies

const https = require ('https');
const querystring = require('querystring');

const {twilio} = require('./environments');
const { type } = require('os');

// module scaffolding 

const notification = {};

notification.sendTwilioSMS = (phone, msg, callback) => {
    // input validation 
    const userPhone = typeof(phone) === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    
    const userMsg = typeof(msg) ==='string' && msg.trim().length > 1 && msg.trim().length <=1600 ? msg.trim() : false ;
    if(userPhone && userMsg){
        // configure the request payload 
        const payload = {
             From : twilio.fromPhone,
             To : `+88${userPhone}`,
             Body : userMsg,  
        }

        // payload stringify
        const stringifyPayload = querystring.stringify(payload);

        //configure the request details 
        const resDetails = {
            hostname : 'api.twilio.com',
            method : 'POST',
            path : `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth : `${twilio.accountSid}:${twilio.authToken}`,
            header : {
                'Content-Type' : 'application/x-www-form-urlencoded',
            },
        };
        //intentiate the req obeject 
        const req = https.request(resDetails, (res)=>{
            // get the status code of the sent request 
            const status = res.statusCode;
            // callback succesfull if request went  through
            if(status ===200 || status ===201){
                callback(false)
            }else{
                callback(`status code returned ${status}`);
            }
        })

        //req sent

        req.on('error',(e)=>{
            callback(e);
        })
        req.write(stringifyPayload)
        req.end();

    }else{
        callback('parameter missing ')
    }

};

module.exports = notification ;