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

        this.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJiZXRhLnBhcnRzdGVjaC5jb20iLCJleHAiOjE1NTY0NTgwMDIsInBhcnRuZXIiOiJiZXRhX2Jvc2NoIiwidXNlciI6ImhhY2t0ZWFtXzEyIn0.YK6xu4Wu29MjDGvbNNNnMnxVwQJ_M6WNb97bCggE26Q";
        this.refreshToken = "user:hackteam_12:4c8c8ac3ff7543c9908589608f017ed9";
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