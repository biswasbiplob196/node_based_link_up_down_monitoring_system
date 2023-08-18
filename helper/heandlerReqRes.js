//request response handler 

//Dependencies 


const url = require('url');
const {StringDecoder} = require('string_decoder');
const routes = require('../routes');
const {parseJSON} = require('../helper/utilities')
const {notFoundHandler} = require('../handler/routes-handler/notFoundHandler');

const handler = {};

handler.handleReqRes = (req, res) =>{
    //request handling
    
    //url presed 

    const parsedUrl  = url.parse(req.url, true)
    const path = parsedUrl.pathname;
    const trimedPath = path.replace(/^\/+|\/+\/?$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parsedUrl.query;
    const headerObject = req.headers;
   

    const requestProperties = {
        parsedUrl,
        path,
        trimedPath,
        method,
        queryStringObject,
        headerObject,
        
    }


    //body data streaming with StringDecoder
    
    const decoder = new StringDecoder('utf-8');
    let realData ='';

    //path tracing

    const choosehandle = routes[trimedPath] ? routes[trimedPath] : notFoundHandler;

    req.on('data', (buffer)=>{
        realData += decoder.write(buffer);
    })
    req.on('end', ()=>{
        realData += decoder.end();
        requestProperties.body = parseJSON(realData);  
        choosehandle(requestProperties, (statusCode, payload)=>{
            statusCode = typeof (statusCode) ==='number' ? statusCode : 500;
            payload = typeof(payload)==='object' ? payload : {};
            const payloadString = JSON.stringify(payload);
            res.setHeader('content-type','application/json')
            res.writeHead(statusCode);
            res.end(payloadString);
        } );
    })
}

module.exports = handler;