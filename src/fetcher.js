const fetch = require('node-fetch');
const fs = require('fs');

const makers = require('./makes');

(async () => {
  let csv = [];
  let year = 2020;
  console.log(year);

  console.time('Model');
  const models = (await Promise.all(
    makers
      .map(async make => {
        try {
          return await fetch(
            `https://api.beta.partstech.com/taxonomy/vehicles/models?year=${+year}&make=${+make}`,
            {
              headers: {
                Authorization:
                  'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJiZXRhLnBhcnRzdGVjaC5jb20iLCJleHAiOjE1NTY0MDgwNDYsInBhcnRuZXIiOiJiZXRhX2Jvc2NoIiwidXNlciI6ImhhY2t0ZWFtXzEyIn0.M-jODXry8kcDmbaLhDlgZOE9gk0fhWaRo3sGayQgDec'
              }
            }
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

  console.log(models.length);

  console.time('Submodels');
  const submodels = (await Promise.all(
    models
      .map(async ({ modelId, make }) => {
        try {
          return (
            // console.log(
            //   `https://api.beta.partstech.com/taxonomy/vehicles/submodels?year=${+year}&make=${+make}&model=${+modelId}`
            // ) ||
            await fetch(
              `https://api.beta.partstech.com/taxonomy/vehicles/submodels?year=${+year}&make=${+make}&model=${+modelId}`,
              {
                headers: {
                  Authorization:
                    'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJiZXRhLnBhcnRzdGVjaC5jb20iLCJleHAiOjE1NTY0MDgwNDYsInBhcnRuZXIiOiJiZXRhX2Jvc2NoIiwidXNlciI6ImhhY2t0ZWFtXzEyIn0.M-jODXry8kcDmbaLhDlgZOE9gk0fhWaRo3sGayQgDec'
                }
              }
            ).then(res => res.json())
          );
        } catch {
          return [];
        }
      })
      .filter(value => value)
  )).flat();
  console.timeEnd('Submodels');

  console.log(submodels.length);

  const partial = submodels.map(
    ({ submodelId, submodelName }) =>
      `"${submodelId}","${submodelName.toLowerCase()}"`
  );

  csv.push(...partial);

  const unique = [...new Set(csv)].join('\n');

  await fs.writeFile(`./submodels_${year}.csv`, unique, err => {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  });
})();
