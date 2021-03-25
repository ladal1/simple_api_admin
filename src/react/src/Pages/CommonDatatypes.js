function StringConvert(value){
    return JSON.stringify(value)
}

function NumberConvert(value){
    const convert = Number(value)
    if (isNaN(convert)){
        throw new Error("Value is not a number")
    } else {
        return convert
    }
}

function BooleanConvert(value){
    switch(value){
        case 'true':
            return true
        case 'false':
            return false
        default:
            throw new Error("Invalid value in field")
    }
}

function convertValue(value, type){
    try{
        if(type[type.length-1] === "!"){
            type = type.slice(0, -1);
            if(value === null || value === undefined){
                return StringConvert(value)
            }
        } else {
            if(value === null || value === undefined){
                return null
            }
        }
        //Array
        if(type[0] === "[" && type[type.length - 1] === "]"){
            let output = []
            JSON.parse(value).forEach((i) => output.push(convertValue(i, type.slice(1, -1))))
            return "[" + output.join(", ") + "]"
        }
        switch(type){
            case 'Integer':
            case 'Float':
                return NumberConvert(value)
            case 'String':
                return StringConvert(value)
            case 'Boolean':
                return BooleanConvert(value)
            case 'Date':
            case 'Time':
            case 'Datetime':
            case 'Duration':
            default:
                return StringConvert(value)
        }
    } catch {
        return StringConvert(value)
    }
}

function validateValueType(value, type){
    try{
        //Not-nullable
        if(type[type.length-1] === "!"){
            type = type.slice(0, -1);
            if(value === null || value === undefined){
                return false
            }
        } else {
            if(value === null || value === undefined){
                return true
            }
        }
        //Array
        if(type[0] === "[" && type[type.length - 1] === "]"){
            let values = JSON.parse(value)
            if (!Array.isArray(values)){
                return false
            }
            for (let i = 0; i < values.length; i++){
                if (!validateValueType(values[i], type.slice(1, -1))){
                    return false
                }
            }
            return true
        }
        switch(type){
            case 'Integer':
            case 'Float':
                NumberConvert(value)
                break
            case 'String':
                StringConvert(value)
                break
            case 'Boolean':
                BooleanConvert(value)
                break
            case 'Date':
            case 'Time':
            case 'Datetime':
            case 'Duration':
            default:
                return null
        }
        return true
    } catch {
        return false
    }
}

function datatypeToFieldType(type, CustomTypes=[]){
    //try{
        //Handle full nullable
        let required = (type[type.length-1] !== "!")
        if(!required){
            type = type.slice(0, -1)
        }
        //Handle arrays
        //TODO
        let customType = CustomTypes.find(i => (i.typename === type))
        if(typeof customType !== "undefined"){
            return {field: "Select", required: required, options: customType.fields, placeholder: "Add Filter: ", spawn_fields: true}
        }

        switch(type){
            case 'Integer':
            case 'Float':
                return {field: "Number", required: required}
            case 'String':
                return {field: "Text", required: required}
            case 'Boolean':
                return {field: "Select", required: required, options: [{name: "true"}, {name: "false"}], placeholder: "Select Bool", spawn_fields: false}
            case 'Date':
            case 'Time':
            case 'Datetime':
            case 'Duration':
            default:
                return {field: "Text", required: required}
        }
    //} catch {
    //    console.log("Hrerer")
    //    return {field: 'Text', required: true}
    //}
}

function IsTypeList(type){
    return (type.substring(0, 9) === "Paginated")
}

function PropertyToString(property, object){
    if(typeof object[property] === 'object' && object[property] !== null){
        if("__str__" in object[property]){
            return object[property]["__str__"]
        }
    }
    else {
        return object[property].toString()
    }
}


export {convertValue, validateValueType, datatypeToFieldType, IsTypeList, PropertyToString};
