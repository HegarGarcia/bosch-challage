const fetch = require('node-fetch');
const translate = require('google-translate-api');
const Token = require('./token');

const TokenGen = new Token();

function getEngine(vehiculo, trys = 1) {
  const VehiculoParams = {
    yearId: vehiculo.year,
    makeId: vehiculo.make,
    modelId: vehiculo.model,
    submodelId: vehiculo.submodel,
    engineId: vehiculo.engine,
    engineParams: {},
  };

  const queryString = `?year=${VehiculoParams.yearId}&make=${VehiculoParams.makeId}&model=${
    VehiculoParams.modelId
  }&submodel${VehiculoParams.submodelId}`;

  return fetch(`https://api.beta.partstech.com/taxonomy/vehicles/engines${queryString}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TokenGen.token}`,
    },
  })
    .then(res => res.json())
    .then((engines) => {
      if (!engines) {
        throw new Error('No engine');
      }

      const choosenOne = engines[0];
      VehiculoParams.engineParams = choosenOne.engineParams;
      return VehiculoParams;
    })
    .catch(err => (trys > 5 ? err : TokenGen.getToken() && getEngine(vehiculo, trys + 1)));
}

module.exports = {
  async getParts(vehiculo, keyword) {
    const vehicleParams = await getEngine(vehiculo);

    const searchParams = {
      vehicleParams,
      keyword,
    };

    return fetch('https://api.beta.partstech.com/catalog/search', {
      method: 'post',
      body: JSON.stringify({ searchParams }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TokenGen.token}`,
      },
    })
      .then(res => res.json())
      .then((json) => {
        if (!json.parts) {
          return [];
        }
        const myResponseArray = json.parts.map(part => ({
          partName: part.partName,
          partsTechCatalogURL: part.partsTechCatalogURL,
          brandName: part.brand.brandName,
          vehicleName: part.vehicleName,
        }));

        return myResponseArray;
      })
      .catch(console.err);
  },

  translatePart(partName) {
    const transText = partName;

    return translate(transText, { from: 'es', to: 'en' })
      .then(res => res.text())
      .catch(console.error);
  },
};
