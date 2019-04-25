const Token = require('./token');
const fetch = require('node-fetch');
const translate = require('google-translate-api');

var TokenGen = new Token();

async function getEngine(vehiculo, trys){
    let VehiculoParams = {
        yearId: vehiculo.year,
        makeId: vehiculo.make,
        modelId: vehiculo.model,
        submodelId: vehiculo.submodel,
        engineId: vehiculo.engine
    };
    let stringSearch = `?year=${VehiculoParams.yearId}&make=${VehiculoParams.makeId}&model=${VehiculoParams.modelId}&${VehiculoParams.submodelId}`;
    return await fetch('https://api.beta.partstech.com/taxonomy/vehicles/engines' + stringSearch, {
        method: 'GET',
        headers:{
            "Authorization": `Bearer ${TokenGen.token}`
        }
    })
    .then( (json, err) => {
        if(json){
            let choosenOne = json[0];
            VehiculoParams.engineParams = choosenOne.engineParams;
            return VehiculoParams;
        }
    }).catch(err => {
        if(err.error.code == "InvalidToken"){
            TokenGen.getToken();
            trys = ++trys;

            if(trys > 5) return err;
            getEngine(vehiculo, trys);
        }
    })
    
}

module.exports = {
    getParts: async function(vehiculo, keyword){
        let vehicleParams = getEngine(vehiculo);
        let searchParams = {
            vehicleParams: vehicleParams,
            keyword: keyword
        }
         return await fetch('https://api.beta.partstech.com/catalog/search', {
            method: 'post',
            body:    JSON.stringify({searchParams}),
            headers: { 
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${TokenGen.token}`
            },
        })
        .then( json =>{
            console.log(json);
            let myResponseArray = json.parts.map( x => {
                return {
                    partName: x.partName,
                    partsTechCatalogURL: x.partsTechCatalogURL,
                    brandName: x.brand.brandName,
                    vehicleName: x.vehicleName
                }
            });
    
            return myResponseArray;
        })
        .catch(err => {
            console.log(err);
        })
    },
    
    translatePart: async function(partName) {
        let transText = partName;

        return await translate(transText, {from: 'es', to: 'en'}).then(res => {
           return res.text;
        }).catch(err => {
            console.error(err);
        });
    
    }
}