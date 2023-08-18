/*   
project Initial file 
Description: RestFul API estabilshment for up down link monitoring app.
Developed by: Biplob Kumar Biswas
*/

// dependency

const server = require('./lib/server');
const worker = require('./lib/worker');


//app scaffolding

const app = {}; 

app.init = () => {
    
    // start the server
    server.init();

    // start the worker
    worker.init();
}

app.init();