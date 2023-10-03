function getBoundary (request: Request){
	let headers = getValueFromDictionary(request, 'headers', 'object', null);
	
	let boundary = "";
	if (headers){
		let contentType = getValueFromDictionary(headers, 'content-type', 'string' ,'');

		//e.g. contentType = multipart/form-data; boundary=----WebKitFormBoundaryoooYYT2ZL7qBWf
		// we only want the boundary= part.

		const tokens = contentType.split(';');
		const boundaryPrefix = 'boundary=';
		for (let i = 0; i < tokens.length; i++){
			tokens[i] = tokens[i].trim(); //important
			if (tokens[i].startsWith(boundaryPrefix)){
				boundary = tokens[i].replace(boundaryPrefix, '');
				break;
			}
		}
	}

    return boundary;
}
// "middleware" to parse post parameters
const xpost = (req:Request, res: Response, next: NextFunction) => {

    if (req.headers['content-type'] === 'multipart/form-data') {
        // Use latin1 encoding to parse binary files correctly
        req.setEncoding('latin1');
    }
    
    if (req.headers['content-type'] === 'application/json'){
        //req.body already contains data.
        next();
    }
    else{
        let boundary = getBoundary(req); // used to parse input later
    
        let buffer = '';
        req.on('data', chunk => {
            buffer += chunk.toString();
            // console.log(buffer);
        });

        req.on('end', () => {
            const input_tokens = buffer.split('--'+boundary+'\r\n');
        
            // let input = {};
			let input:Record<string, string|number> = {};
            let find = '"'; // need to replace all occurences in key later on
            let re = new RegExp(find, 'g');

            input_tokens.forEach((str) => {
                str = str.replace('Content-Disposition: form-data; ', '');
                let input_tokens = str.split('\r\n\r\n');
            
                if (input_tokens.length == 2){
                    let key = input_tokens[0].replace('name=', '');
                    key = key.replace(re, '');
                    let value: string|number = (input_tokens[1].split('\r\n'))[0].trim();
					if (isNumeric(value)){
						if (Number.isInteger(value))
							value = parseInt(value);
						else 
							value = parseFloat(value);
					}
                    input[key] = value;
                }
            });  

			// console.log("input at xpost ");
			// console.log(input);

            if (Object.keys(req.body).length == 0)
                req.body = input;

            next(); // pass on to the next step
        });
    }
}
