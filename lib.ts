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
