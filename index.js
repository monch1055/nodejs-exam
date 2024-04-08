const packageHTTPS = require('follow-redirects').https;
const express = require('express');

const webApp = express();
const apiKey = 'sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912'
const uID = 'cLZojxk94ous'

webApp.get('/', function(req, res){
    res.send("Server is running!");
});

webApp.get('/'+uID+'/filteredResults/', (req, res) => {
    const options = {
        'method': 'GET',
        'hostname': 'api.fillout.com',
        'path': '/v1/api/forms/'+uID,
        'headers': {
            'Authorization': 'Bearer '+apiKey
        },
        'maxRedirects': 20
    };

    let dataArray = [];

    const request = packageHTTPS.request(options, function (res) {
        const chunks = [];
        const filters = [
            {
                id: "name",
                condition: "equals",
                value: "What is your name?",
            },
            {
                id: "type",
                condition: "greater_than",
                value: "ShortAnswer"
            }
        ];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function (chunk) {
            const body = Buffer.concat(chunks);

            const encodedJsonObject = Buffer.from(JSON.stringify(body.toString())).toString('base64');
            const decodedJsonObject = Buffer.from(encodedJsonObject, 'base64').toString('ascii');
            const dataJSON = JSON.stringify(decodedJsonObject);
            dataArray = JSON.parse(dataJSON);

            let filteredResults = [{"response":[{"questions":[]}]}]

            for (const [key, value] of dataArray) {
                console.log(`Key: ${key}, Value: ${value}`);
                for (let i = 0; i < filters.length; i++) {
                    if (filters[i].id === key) {
                        switch(filters[i].condition) {
                            case 'equals':
                                if (filters[i].value === value) {
                                    filteredResults.response.questions.push(key,value)
                                }
                                break;

                            case 'does_not_equal':
                                if (filters[i].value !== value) {
                                    filteredResults.response.questions.push(key,value)
                                }
                                break;

                            case 'greater_than':
                                if (filters[i].value < value) {
                                    filteredResults.response.questions.push(key,value)
                                }
                                break;

                            case 'less_than':
                                if (filters[i].value > value) {
                                    filteredResults.response.questions.push(key,value)
                                }
                                break;
                        }
                    }
                }
            }
            return filteredResults;

        });

        res.on("error", function (error) {
            console.error(error);
        });
    });

    request.end();

    res.send('Form Parsed!');
})

webApp.listen(80);