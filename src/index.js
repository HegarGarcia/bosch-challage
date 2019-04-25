const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 8080;

const { getParts, translatePart } = require('./busquedas');

app.use(morgan('tiny'));
app.use(helmet());
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  console.log('Webhook activated');
  const { parameters: queryParams } = req.body.queryResult;

  const vehicle = {
    year: queryParams['car-maker'],
    model: queryParams['car-model'][0],
    submodel: queryParams['car-submodel'],
  };

  console.log('Translating part');
  const keyword = translatePart(queryParams['car-part']);

  console.log('Getting parts');
  const parts = getParts(vehicle, keyword);

  const textObjectResp = `Resultados para la pieza: ${parts[0].partName}. Vehiculo: ${
    parts[0].vehicleName
  }. Branch ${parts[0].branchName}`;

  const response = {
    source: '',
    facebook: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: textObjectResp,
          buttons: [
            {
              url: parts[0].partsTechCatalogURL,
              title: 'Ver en catalogo.',
            },
            {
              title: 'gracias',
              payload: 'ty',
            },
          ],
        },
      },
    },
  };

  res.json(response);
});

app.listen(port, () => console.log('Listening on port 8080'));
