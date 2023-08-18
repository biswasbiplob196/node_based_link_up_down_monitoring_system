//raw database handling

const fs = require('fs');
const path = require('path');
const { json } = require('stream/consumers');


const lib ={};

lib.baseDir = path.join(__dirname, '../.data/');

lib.create = (dir, file, data, callback ) => {
    //open the file 
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', (err, fileDescriptor) => {
            if(!err && fileDescriptor){
                //convet json data to string data
                const stringData = JSON.stringify(data);
                //write the data to file
                fs.writeFile(fileDescriptor, stringData, (err2)=>{
                    if (!err2){
                        fs.close(fileDescriptor, (err3)=>{
                            if(!err3){
                                callback(false)
                            }else{
                                callback('file closing error!')
                            }
                        })
                    }else{
                        callback('error ! to writing data to file.')
                    }

                })  
            }
            else{
                callback("could not opend file. maybe file existed!")
            }
    })
}

lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8',(err,data)=>{
        callback(err, data);
    })
}

lib.update = (dir, file, data, callback) => {
    //file openning
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, fileDescriptor) =>{
        if (!err && fileDescriptor){
            //convert json data to string
            const stringData = JSON.stringify(data);
            //truncate the file for updating
            fs.ftruncate(fileDescriptor, (err2) =>{
                if (!err2){
                    //write the data 
                    fs.writeFile(fileDescriptor, stringData, (err3)=>{
                        if(!err3){
                            fs.close(fileDescriptor,(err4)=>{
                                if(!err4){
                                    callback(false)
                                }else{
                                    callback('file closing error!')
                                }
                            })
                        }else{
                            callback('writting error!')
                        }
                    })
                }else{
                    callback('truncating error!')
                }
            })
        }else{
            callback("file opening error for updating")
        }
    })
}

lib.delete = (dir, file, callback) => {
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err) => {
        if(!err){
            callback(false)
        }else{
            callback('error for deleting!')
        }
    })
}

// list all the items in a directory

lib.list = (dir, callback) => {
    fs.readdir(lib.baseDir+dir+'/',(err,fileNames) =>{
       let trimmedFileName = [];
        if(!err && fileNames && fileNames.length > 0){
            fileNames.forEach(fileName =>{
                trimmedFileName.push(fileName.replace('.json',''));
            })
            callback(false, trimmedFileName)
        }else{
            callback('file reading error!')
        }
    })
}


module.exports = lib ;