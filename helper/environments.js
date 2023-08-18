// environments 

const environments = {};

environments.staging = {
    port : 3000,
    envName : "staging",
    secrectKey : 'djljksdhkhgdsskdhhg',
    maxChecks : 5,
    twilio : {
        fromPhone: '+18149294576',
        accountSid : 'AC6d785896aae4e6b67bc1a993d6ccb604',
        authToken : 'b2183dbeadb1c71aed4d351606b74142',
    },
}


environments.production = {
    port : 5000,
    envName : "production",
    secrectKey : 'djlqworewqhadkshbkdfsahhg',
    maxChecks : 5,
    twilio : {
        fromPhone: '+18149294576',
        accountSid : 'AC6d785896aae4e6b67bc1a993d6ccb604',
        authToken : 'b2183dbeadb1c71aed4d351606b74142',
    },
}

//checking the passing name which is determined here:

const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

const environmentToExport = typeof(environments[currentEnvironment])==="object" ? environments[currentEnvironment] : environments.staging;
 module.exports = environmentToExport ;