/*******************************************************
Code to send REST calls to servers in Node.JS/Typescript
This version only handles GET.

To use:
1) Include this file
2) call queryServer(serverPath:string, apiPath:string, method:string, input={}, opts={}, callback:Function, timeout=2000)
*******************************************************/

import { getValueFromDictionary } from "./lib.js";
function getErrorMessage(error: unknown) {
	let msg = '';

	if (typeof error === 'object' && error !== null){
		if ('message' in error){
			if (typeof error.message === 'string'){
				msg = error.message
			}
		}
	}

	if (msg.length == 0){ // fallbacks 
		try{ 
			msg = JSON.stringify(error);
		}
		catch{
			msg = String (error);
		}
	}
    
    return msg;
}
function prepareQuery(url:string, method:string, input={}, params={}){
    // params.method = method;
    method = method.toLowerCase();
    // if (method == 'post'){
    //     params.body = JSON.stringify(input);
    // }
    // else 
	if (method == 'get'){
        var param_str = "";
        Object.keys(input).forEach(function(k){
			// https://www.totaltypescript.com/concepts/type-string-cannot-be-used-to-index-type
            param_str += k+"="+(input[k as keyof typeof input])+"&";
        });

        if (param_str.length > 0){
            // crop the last &
            param_str = param_str.substring(0, param_str.length-1);
            if (param_str.length > 0)
                url+='?'+param_str;
        }
    }

    return [url, params];
}
function handleTimeoutREST(url:string, callback:Function){
	let resp = {
		'status': -1, 
		'error': 'time out', 
		'url': url
	}; 

	callback(resp);
}
async function fetchWithTimeout(url:string, opts = {}, callback:Function, timeout = 5000) {
   
    // Create the AbortController instance, get AbortSignal
    const abortController = new AbortController();
    const { signal } = abortController;
  
    // Make the fetch request
    const _fetchPromise = fetch(url, {
      ...opts,
      signal,
    })
    .then(res => {
        if (res.ok) {
            return res.json();
        } else { // do not use throw, will cause error printout
            // throw Error(`${res.status} - ${res.statusText}`);
            // console.log(`Fetch error: ${res.status} - ${res.statusText}`);

			handleTimeoutREST(url, callback);

            return ""; // prevent undefined error
        }
    }) //this is required
    .then(json => { //Logs the response body
		// console.log("============== REST RESPONSE =====================");
		// console.log(json);
	
        // append to json data
        json['error'] = '';
		json['url'] = url;
		json['status'] = 1; // success once we get it
		callback(json);
    });
    // NOTE: Don't catch here so that it goes to query8080/3000
    // .catch(function(){ // this handles 400 and 500 errors
    //     console.log('Fetch caught 400 or 500 error');
    // }) ;
  
    // Start the timer
    const timer = setTimeout(() => abortController.abort(), timeout);
  
    // Await the fetch with a catch in case it's aborted which signals an error
    try {
        const result = await _fetchPromise;
        clearTimeout(timer);
        return result;
    } catch (e) {
        clearTimeout(timer);
        throw e;
    }
}
export async function queryServer(serverPath:string, apiPath:string, method:string, input={}, opts={}, callback:Function, timeout=2000){
	
    let tmp = prepareQuery(apiPath, method, input, opts);
    let url = `${serverPath}/${tmp[0]}`;

	try {    
        // console.log(`=========== QUERY SERVER NOW ${url} ================= `);
        await fetchWithTimeout(url, tmp[1], callback, timeout);
    }
    catch(err) { 
        // this includes 500, server is totally offline
        console.log(`[${serverPath}'s REST timeout]: ${getErrorMessage(err)}`);
		handleTimeoutREST(url, callback);
    }
}
