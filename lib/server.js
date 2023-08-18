/*   
project's server file 
Description: RestFul API estabilshment for up down link monitoring app.
Developed by: Biplob Kumar Biswas
*/

//Dependencies 
const http = require('http');

const {handleReqRes} = require('../helper/heandlerReqRes')
const environments = require('../helper/environments');
const data = require('./data');



//server scaffolding

const server = {}; 


//create Server 

server.creatServer = () =>{
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(environments.port ,'127.0.0.1', () =>{
        console.log(`server is running at port ${environments.port}`);
    })
}

// handle request and response 

server.handleReqRes =handleReqRes; 

server.init = () => {
    server.creatServer();
}

module.exports = server;