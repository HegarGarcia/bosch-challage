const fetch = require('node-fetch');
const fs = require('fs');

const makers = require('./makes');

const headers = {
  headers: {
    Authorization:
      'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJiZXRhLnBhcnRzdGVjaC5jb20iLCJleHAiOjE1NTY0MDgwNDYsInBhcnRuZXIiOiJiZXRhX2Jvc2NoIiwidXNlciI6ImhhY2t0ZWFtXzEyIn0.M-jODXry8kcDmbaLhDlgZOE9gk0fhWaRo3sGayQgDec'
  }
};

(async () => {
  let year = 2010;
  console.log(year);

  console.time('Model');
  const models = (await Promise.all(
    makers
      .map(async make => {
        try {
          return await fetch(
            `https://api.beta.partstech.com/taxonomy/vehicles/models?year=${+year}&make=${+make}`,
            headers
          )
            .then(res => res.json())
            .then(json => json.map(value => ({ ...value, make })));
        } catch (err) {
          return [];
        }
      })
      .filter(value => value)
  )).flat();
  console.timeEnd('Model');

  console.time('Submodels');
  const submodels = (await Promise.all(
    models
      .map(async ({ modelId, make }) => {
        try {
          return await fetch(
            `https://api.beta.partstech.com/taxonomy/vehicles/submodels?year=${+year}&make=${+make}&model=${+modelId}`,
            headers
          )
            .then(res => res.json())
            .then(json => json.map(value => ({ ...value, make, modelId })));
        } catch {
          return [];
        }
      })
      .filter(value => value)
  )).flat();
  console.timeEnd('Submodels');

  console.time('Engine');
  const engines = (await Promise.all(
    submodels
      .map(async ({ modelId, make, submodelId }) => {
        try {
          return await fetch(
            `https://api.beta.partstech.com/taxonomy/vehicles/engines?year=${+year}&make=${+make}&model=${+modelId}&submodel=${submodelId}`,
            headers
          ).then(res => res.json());
        } catch {
          return [];
        }
      })
      .filter(value => value)
  )).flat();
  console.timeEnd('Engine');

  const partial = engines.map(
    ({ engineId, engineName }) =>
      `"${engineName.toLowerCase()}","${engineId}","${engineName.toLowerCase()}"`
  );

  const unique = [...new Set(partial)].join('\n');

  await fs.writeFile(`./engines_${year}.csv`, unique, err => {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  });
})();
