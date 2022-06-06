import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class AppService {

    constructor(private http: HttpClient) { }
    

getProfileLastScan(email) {
    return this.http.post('https://fitgeniuswebpluginapi-qa.aetrextechnology.com' + '/check_profile', { profile_email: email });
}

    getScore(email, domain, skus) {
        if (!Array.isArray(skus)) {
            skus = [skus]
        }
        return this.http.post('https://fitgeniuswebpluginapi-qa.aetrextechnology.com' + '/shoeid_em_fgscores', { domain: domain, profile_email: email, skus: skus });
    }

    getShoesize(email, domain, skus) {
        return this.http.post('https://fitgeniuswebpluginapi-qa.aetrextechnology.com' + '/fetch_profile_shoesize', { domain: domain, profile_email: email, skus: skus });
    }
}