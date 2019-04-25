const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 8080;

var {getParts, translatePart} = require('./busquedas');

app.use(morgan('tiny'));
app.use(helmet());
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  console.log('Webhook activated');
  console.log(req.body);
  const { parameters: queryParams } = req.body.queryResult;

  var vehicle = {
    year: queryParams['car-maker'],
    model: queryParams['car-model'][0],
    submodel: queryParams['car-submodel']
  };

  console.log(vehicle, 'modelo:', vehicle.model)
  let keyword = queryParams['car-part'];
  keyword = translatePart(keyword);
  var arrayInfo = getParts(vehicle, keyword);
  console.log(arrayInfo);
  let textObjectResp = `Resultados para la pieza: ${arrayInfo[0].partName}. Vehiculo: ${arrayInfo[0].vehicleName}. Branch ${arrayInfo[0].branchName}`
  const response = {
   
    source: '',
    "facebook": {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text": textObjectResp,
          "buttons":[
            {
              "url":arrayInfo[0].partsTechCatalogURL,
              "title":"Ver en catalogo.",
            },{
              "title":"gracias",
              "payload": "ty"
            }
          ]
        }
      }
    }
  };
  console.log(vehicle);
  res.json(response);
});

app.listen(port, () => console.log('Listening on port 8080'));
