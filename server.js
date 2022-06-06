import http from 'http';
import {readFileSync, writeFileSync} from 'fs'
import dotenv from 'dotenv';
import {findId} from './utility/function.js'

// Environment Setup //
dotenv.config();
const PORT = process.env.SERVER_PORT;

// Data Managing //
const students_json = readFileSync('./data/student.json');
const students_obj = JSON.parse(students_json);

// Create Server //
http.createServer((req, res) => {

    // Routing //
    if (req.url == '/api/student' && req.method == 'GET') {

        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(students_json);

    }else if (req.url.match(/\/api\/student\/[0-9]{1,}/) && req.method == 'GET') {

        let id = req.url.split('/')[3];

        if ( students_obj.some(stu => stu.id == id )) {

            res.writeHead(200, {'Content-Type' : 'application/json'})
            res.end(JSON.stringify(students_obj.find(stu => stu.id == id)));

        } else {

            res.writeHead(200, {'Content-Type' : 'application/json'})
            res.end(JSON.stringify({
                message : 'Student data not found'
            }));
        }

    }else if (req.url == '/api/student' && req.method == 'POST') {

        // req data handle //
        let data = '';
        req.on('data', (chunk) => {
            data += chunk.toString()
        });
        req.on('end', () => {
            let {name, skill, location, age} = JSON.parse(data);
            
            students_obj.push({
                id : findId(students_obj),
                name : name,
                skill : skill,
                location : location,
                age : age
            })

            writeFileSync('./data/student.json', JSON.stringify(students_obj))
        });

        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(JSON.stringify({
            message : 'Post method is okay'
        }));

    }else if (req.url.match(/\/api\/student\/[0-9]{1,}/) && req.method == 'DELETE') {

        let id = req.url.split('/')[3];
        let deleted_data = students_obj.filter(stu => stu.id != id);
        writeFileSync('./data/student.json', JSON.stringify(deleted_data))

        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(JSON.stringify({
            message : 'Delete method is okay'
        }));

    }else if (req.url.match(/\/api\/student\/[0-9]{1,}/) && req.method == 'PUT' || req.url.match(/\/api\/student\/[0-9]{1,}/) && req.method == 'PATCH') {

        let id = req.url.split('/')[3]

        if (students_obj.some(stu => stu.id == id)) {

            let data = '';
            req.on('data', (chunk) => {
                data += chunk.toString();
            });
            req.on('end', () => {
                let {name, skill, location, age} = JSON.parse(data)
                students_obj[students_obj.findIndex(stu => stu.id == id)] = {
                    id : id,
                    name : name,
                    location : location,
                    skill : skill,
                    age : age
                };

                writeFileSync('./data/student.json', JSON.stringify(students_obj))
            });

            res.writeHead(200, {'Content-Type' : 'application/json'})
            res.end(JSON.stringify({
                message : 'Put method is okay'
            }));

        } else {

            res.writeHead(200, {'Content-Type' : 'application/json'})
            res.end(JSON.stringify({
                message : 'Student data not found'
            }));
        }

    } else {
        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(JSON.stringify({
            error : 'Invalid Route'
        }));
    }

    
}).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})