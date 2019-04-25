const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 8080;

app.use(morgan('tiny'));
app.use(helmet());
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const { parameters } = req.body.queryResult;

  const response = {
    fulfillmentText: 'Hola',
    fulfillmentMessages: [
      {
        text: {
          text: [parameters],
        },
      },
    ],
    source: '',
  };

  res.json(response);
});

app.listen(port, () => console.log('Listening on port 8080'));
