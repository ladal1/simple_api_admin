import {convertValue} from "../Pages/CommonDatatypes";

function makeCompleteQuery (action, parameters, data, schema){
    return (action.mutation? "mutation": "query")+ " {\n" + makeAction(action.name, parameters, data) +
        createReturnForType(action["return_type"], schema["__types"], 4) + "}\n"
}


function makeAction(action, parameters= {}, data={}, indentSpace=2) {
    const indent = " ".repeat(indentSpace)

    //TODO add subfields handling
    let parameters_array = []
    let data_array = []
    for (const property in parameters){
        if (!parameters[property].not_include){
            if (Object.entries(parameters[property].additional_fields).length === 0){
                parameters_array.push(property + ": " + convertValue(parameters[property].value, parameters[property].datatype))
            } else {
                let object_attributes_array = []
                for (const additional_property in parameters[property].additional_fields){
                    object_attributes_array.push(additional_property + ": " + convertValue(parameters[property].additional_fields[additional_property].value,
                                                                                           parameters[property].additional_fields[additional_property].datatype))
                }
                parameters_array.push(property + ": {"+ object_attributes_array.join(", ") + "}")
            }
        }
    }
    for (const property in data){
        if (!data[property].not_include){
            if (Object.entries(data[property].additional_fields).length === 0){
                data_array.push(property + ": " + convertValue(data[property].value, data[property].datatype))
            } else {
                let object_attributes_array = []
                for (const additional_property in data[property].additional_fields){
                    object_attributes_array.push(additional_property + ": " + convertValue(data[property].additional_fields[additional_property].value,
                                                                                           data[property].additional_fields[additional_property].datatype))
                }
                data_array.push(property + ": {"+ object_attributes_array.join(", ") + "}")
            }
        }
    }


    if(parameters_array.length === 0 && data_array.length === 0){
        return indent + action
    }
    let query_arguments = parameters_array.join(", ")+
        ((parameters_array.length === 0 || data_array.length === 0)? "" : ", " )+
        ((data_array.length === 0)? "": ("data: {" + data_array.join(", ") + "}"))
    if (query_arguments !== ""){
        query_arguments = "(" + query_arguments + ")"
    }

    return indent + action + query_arguments
}

function extractQueryParts(input, prefix){
    return {action: input.substring(0, input.indexOf(prefix) + prefix.length - 1), returnInfo: input.substring(input.indexOf(prefix) + prefix.length)}
}

function returnForAttribute(field, CustomTypes, indentSpace=2, include_subObjects=false){
    const indent = " ".repeat(indentSpace)
    // Don't care about nullable:
    if(field.typename[field.typename.length-1] === "!"){
        field.typename = field.typename.slice(0, -1);
    }
    let customType = CustomTypes.find(i => (i.typename === field.typename))
    // Paginated List or Custom Type
    // TODO Ignores followups, but could get messy
    if(field.typename.substring(0, 9) === "Paginated"){
        if(include_subObjects){
            return indent + field.name + " {\n" + indent + "    __str__\n" + indent + "}\n"
        }
        return indent + "# Further ObjectList exist but is not listed automatically\n" + indent + "# " + field.name + "{}\n"
        //return indent + field.name + createReturnForType(field.typename, CustomTypes, indentSpace + 2)
    }
    // Custom Type
    // TODO Ignores followups, but could get messy
    if(typeof customType !== "undefined"){
        if(include_subObjects){
            return indent + field.name + " {\n" + indent + "    __str__\n" + indent + "}\n"
        }
        return indent + "# Further objects exist but are not listed automatically\n" + indent + "# " + field.name + "{}\n"
    }

    return indent + field.name + "\n"
}


function createReturnForType(type, CustomTypes, indentSpace=2, includeSubObjects=false, includeActions=false){
    const indent = " ".repeat(indentSpace)
    //Don't care about nullable:
    if(type[type.length-1] === "!"){
        type = type.slice(0, -1);
    }
    let customType = CustomTypes.find(i => (i.typename === type))
    //Paginated
    if(type.substring(0, 9) === "Paginated"){
        return "{\n" + indent + "count\n" +
                       indent + "data (limit: 20) " + createReturnForType(type.substring(10, type.length-1), CustomTypes, indentSpace + 2, includeSubObjects) +
               " ".repeat(indentSpace-2) + "}\n"
    }
    if(typeof customType !== "undefined"){
        let returnString = ""
        if(includeActions){
            returnString += actionsInsert(indentSpace)
        }
        if (includeSubObjects) {
            returnString += " ".repeat(indentSpace) + "__str__\n"
        }
        for (const attribute of customType.fields){
            returnString += returnForAttribute(attribute, CustomTypes, indentSpace, type, includeSubObjects)
        }
        return " {\n" + returnString + " ".repeat(indentSpace-2) + "}\n"
    }
    return " \n"
}

function createListQuery(object, CustomTypes, offset=0, count=20, filters={}){
    const listAction = object.name + "List";
    const actionObject = object.actions.find(i => (i.name === listAction))
    if(actionObject === undefined){
        throw new Error("List action does not exist or is not named < Object >List")
    }

    //Don't care about nullable:
    if(actionObject["return_type"][actionObject["return_type"].length-1] === "!"){
        actionObject["return_type"] = actionObject["return_type"].slice(0, -1);
    }
    return (actionObject.mutation? "mutation {\n": "query {\n") + makeAction(listAction, filters) +
        "{\n    count\n    data (limit:" + count + ", offset:" + offset + ")" +
        createReturnForType(actionObject["return_type"].substring(10, actionObject["return_type"].length-1), CustomTypes, 6, true, true) +
        "  }\n}"
}

function actionsInsert(indentSpace=2){
    return (
        " ".repeat(indentSpace) + "__actions {\n" +
        " ".repeat(indentSpace+2) + "name\n" +
        " ".repeat(indentSpace+2) + "parameters{\n" +
        " ".repeat(indentSpace+4) + "name\n" +
        " ".repeat(indentSpace+4) + "typename\n" +
        " ".repeat(indentSpace+4) + "default\n" +
        " ".repeat(indentSpace+2) + "}\n" +
        " ".repeat(indentSpace+2) + "data {\n" +
        " ".repeat(indentSpace+4) + "name\n" +
        " ".repeat(indentSpace+4) + "typename\n" +
        " ".repeat(indentSpace+4) + "default\n" +
        " ".repeat(indentSpace+2) + "}\n") +
        " ".repeat(indentSpace+2) + "mutation\n" +
        " ".repeat(indentSpace+2) + "return_type\n" +
        " ".repeat(indentSpace+2) + "permitted\n" +
        " ".repeat(indentSpace+2) + "deny_reason\n" +
        " ".repeat(indentSpace+2) + "retry_in\n" +
        " ".repeat(indentSpace) + "}\n"

}


export {makeCompleteQuery, extractQueryParts, createReturnForType, createListQuery}
