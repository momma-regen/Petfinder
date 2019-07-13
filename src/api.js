import { empty } from './utils';
import axios from 'axios';

export function ApiController()
{
    let token;
    let types;
    let expires = new Date().getTime() - 1;
    let base = "https://api.petfinder.com/v2/";
    
    let lat;
    let long;
    
    this.error = null;
    
    const getToken = () => {
        return empty(token) || new Date().getTime() >= expires ?
        axios.post(`${base}/oauth2/token`, {
            grant_type: "client_credentials",
            client_id: "GxrepELxhCbyzdktD7bu1N3p5KLLdmvtFLuf3ItuAixjRwbhRv",
            client_secret: "hVPR0uaJL5ZvQ75APwgzx9XhBTZOs6HdUPOoXP4T"
        }).then(response => {
            response = response.data;
            token = response.access_token;
            expires = new Date().getTime() + (response.expires_in * 1000);
            return token;
        }).catch(error => {
            this.error = error.stack.replace(/[\\n\n]/, "<br/>");
        }) :
        new Promise(r => r(token));
    }
    
    this.getTypes = () => {
        return empty(types) ?
        this.makeRequest("types")
            .then(res => (res||{data: {types:[]}}).data.types.map(type => type.name.toLowerCase())) :
        new Promise(r => (types));
    }
    
    const buildQuery = (uri, params) => {
        let arr = (`${uri}?`).split("?");
        uri = `${arr.shift()}?` +
        [
            ...(arr.shift()).split("&").map(v => {
                let p = v.split("=");
                let key = p.shift();
                let val = (params[key] == null ? p.shift() : params[key]);
                if (!empty(key) && !empty(key)) {
                    delete params[key];
                    return `${key}=${val}`;
                }
                return "";
            }, []),
            ...Object.keys(params).map(key => (!empty(key) && !empty(params[key]) ? `${key}=${params[key]}` : ""))
        ].filter(x => x).join("&");
        return encodeURI(uri);
    }
    
    this.buildParams = search => {
        return this.getTypes().then(types => {
            let params = ((`${search}`).toLowerCase().match(/(\w+:[\w\d-\.\s]+)(?=\s|$)/g)||[]).reduce((r,v) => {
                let s = v.split(":");
                let key = (`${s.shift()}`);
                let val = (`${s.shift()}`).replace(/\s/g, ",");
                if (!empty(key) && !empty(val)) {
                    r[key] = val;
                }
                return r;
            }, {});
            if ((!params.hasOwnProperty("location") || empty(params.location)) && (!empty(lat) && !empty(long))) {
                params.location = `${lat},${long}`;
            }
            params.limit = (empty(params.limit) ? "100" : params.limit);
            params.types = (empty(params.types) ? types.join(",") : params.types);
            return params;
        });
    }
    
    this.getLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
            position => {
                lat = position.coords.latitude;
                long = position.coords.longitude;
            },
            error => {
                this.error = error;
            });
        }
    }
    
    this.makeRequest = (uri, params) => {
        if (params != null && params instanceof Object && Object.keys(params).length > 0) {
            uri = buildQuery(uri, params);
        }
        
        return getToken().then(token => {
            return axios.get(`${base}${uri}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        });
    }
    
    getToken();
}