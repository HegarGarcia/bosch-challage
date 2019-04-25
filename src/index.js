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
    model: queryParams['car-model'],
    submodel: queryParams['car-submodel']
  };
  let keyword = queryParams['car-part'];
  keyword = translatePart(keyword);
  var arrayInfo = getParts(vehicle, keyword);
  console.log(arrayInfo);
  
  const response = {
    fulfillmentText: '',
    fulfillmentMessages: [
      {
        text: {
          text: [JSON.stringify(queryParams)],
        },
      },
    ],
    source: '',
  };
  console.log(vehicle);
  res.json(response);
});

app.listen(port, () => console.log('Listening on port 8080'));
