/****************************************************
Retrieve a value from a dictionary, given its key.
To be used with Typescript.
******************************************************/

export function getValueFromDictionary(dic: any, key: string, type:string, fallback: string|number|boolean|null){
	type = type.toLowerCase();

	if (key in dic && dic[key] != null){
		if ( type.length > 0){
			if ( (type === 'array' && Array.isArray(dic[key])) ||
				( type !== 'array' && typeof dic[key] === type)){

				return dic[key];
			}
			else{
				return fallback;
			}
		}
		else{
			return dic[key];
		} 
	}
	else{
		return fallback;
	}
}

export function isNumeric(str: string) {
	if (typeof str != "string") 
		return false;

	// date like 2023-10-03 will return 2023
	// but exclude -1 (negative numbers)
	if (str.includes('-') && !str.startsWith('-')) 
		return false;

	let value:number|null = parseFloat(str);

	return !isNaN(value);
}
