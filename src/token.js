const fetch = require('node-fetch');

class Token {

    constructor(){
        this.parter = {
            id: "beta_bosch",
            key: "4700fc1c26dd4e54ab26a0bc1c9dd40d"
        }
        this.user = {
            id:"hackteam_12",
            key: "83f5b7e7d5f24ac79e321665132e785d"
        }

        this.token = null;
        this.refreshToken = null;
    }

     getToken(){
        let body, url;

        if(!this.refreshToken){
            url = 'https://api.beta.partstech.com/oauth/access';
            body = {
                "accessType": "user",
                "credentials": {
                  "user": this.user,
                  "partner": this.parter
                }
            };
        } else {
            url = 'https://api.beta.partstech.com/oauth/refresh';
            body = {
                refreshToken: this.refreshToken
            };
        }
        
        fetch( url ,{
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        }).then( json => {
            if(json){
                this.token = json.accessToken;
                this.refreshToken = json.refreshToken; 
            }
            
        }).catch(err => console.log(err));
    }

}

module.exports = Token;