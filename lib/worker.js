/*   
project's worker file 
Description: RestFul API estabilshment for up down link monitoring app.
Developed by: Biplob Kumar Biswas
*/

//Dependencies 
const url = require('url');
const http = require('http');
const https = require('https');

const {handleReqRes} = require('../helper/heandlerReqRes')
const environments = require('../helper/environments');
const data = require('./data');
const { parseJSON } = require('../helper/utilities')
const {sendTwilioSMS} = require('../helper/notification')

//worker scaffolding

const worker = {}; 

worker.gatherALLchecks = ()=>{
    // get all the checks 
    data.list('checks',(err, checks) => {
         if (!err , checks){
                checks.forEach(check => {
                    data.read('checks',check,(err2, checkData)=>{
                        if (!err2 && checkData){
                            //pass the checkdata to check validator function .
                            worker.ValidatorCheckData(parseJSON(checkData));
                        }else{
                            console.log('data not getting.')
                        }
                    })
                });
         }else{
            console.log('checkes error.')
         }
    })
}

// worker.ValidatorCheckData for validation

worker.ValidatorCheckData = (originalCheckData ) => {
    if(originalCheckData.id && originalCheckData){
        originalCheckData.state =  typeof(originalCheckData.state)=== 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';

        originalCheckData.lastChacked = typeof(originalCheckData.lastChacked) === 'number' && originalCheckData.lastChacked > 0 ? originalCheckData.lastChacked : false;

        // pass the next function 
         worker.performCheck (originalCheckData);
        
    }else{
        console.log('error: check the check valid data');
    }
}

// perform check
worker.performCheck = (originalCheckData) => {

    // parse the hostname and full url  from original data
    const parsedURL = url.parse(originalCheckData.protocol+'://'+originalCheckData.url,true);
    
    const hostname = parsedURL.hostname;
    const path = parsedURL.path;
    // construct the request
    const requestDetails = { 
        'protocol' : originalCheckData.protocol+':',
        'hostname' : hostname,
        'method' : originalCheckData.method.toUpperCase(),
        'path' : path,
        'timeout' : originalCheckData.timeOutSeconds*1000,
    }

    const protocolToUse = originalCheckData.protocol ==='http' ? http : https;
            // prepare the initial outcome
            let outcome = {
                'error' : false,
                'responseCode' : false
            }
            // mark the outcome has been sent yet?
            let outcomeSent = false;

    let req = protocolToUse.request(requestDetails, (res) =>{
        //grap the status code 
        const status = res.statusCode;
        outcome.responseCode = status;
        // update the check outcome and pass to the next process
        if(!outcomeSent){
            worker.processOutcome(originalCheckData, outcome);
            outcomeSent = true;
        }

    })
    req.on('error', (e) => {
        let outcome = {
            'error' : true,
            'value' : e,
        }
        
        // update the check outcome and pass to the next process
        if(!outcomeSent){
            worker.processOutcome(originalCheckData, outcome);
            outcomeSent = true;
        }
    })
    req.on('timeout',()=>{
        let outcome = {
            'error' : true,
            'value' : timeout,
        }

        // update the check outcome and pass to the next process
        if(!outcomeSent){
            worker.processOutcome(originalCheckData, outcome);
            outcomeSent = true;
        }
    })
    req.end(); 

}

worker.processOutcome = (originalCheckData, outcome) => {
    // check the outcome is up or down 
    let state = !outcome.error && outcome.responseCode && originalCheckData.successCodes.indexOf(outcome.responseCode) > -1 ? 'up' : 'down';

    // decide we should alert the user or not 
    const alertWanted = originalCheckData.lastChacked && originalCheckData.state !== state ? true : false;
    // update the check data
    let newCheckData = originalCheckData;
    newCheckData.state  = state;
    newCheckData.lastChacked = Date.now();

    // update the data 
    data.update('checks', newCheckData.id, newCheckData, (err)=>{
        if(!err){
            if(alertWanted){
            //send the checkdata to next data 
            worker.alertUserToStatusChange();
            }else{
                console.log('system working well')
            }
        }else{
            console.log('updating error !')
        }
    })
}

// send notification sms to user of state changes 
worker.alertUserToStatusChange = (newCheckData) => {
    console.log(newCheckData)
    let msg = `Alert: your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`
    sendTwilioSMS(newCheckData.userPhone, msg, (err)=>{
        if(!err){
            console.log(`Users was alerted via sms : ${msg}`);
        }else{
            console.log('notification error')
        }
    })
}
worker.loop = ()=>{
    setInterval(()=>{
        worker.gatherALLchecks();
    },1000*5);
}


//create workers 
worker.init = () => {
    // executes all the checks
    worker.gatherALLchecks ();

    //call the loop so that checks contunue
    worker.loop();
}

module.exports = worker;