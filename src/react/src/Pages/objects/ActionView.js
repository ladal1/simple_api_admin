import React from "react";
import {makeCompleteQuery} from "../../Queries/QueryConstructor";
import {datatypeToFieldType, validateValueType} from "../CommonDatatypes";
import {Send_to_API, stringify_replacer} from "../CommonAPI";
import {Button, Col, Form, InputGroup, Card, Row, Tab, Tabs} from "react-bootstrap";
import {Controlled as CodeMirror} from "react-codemirror2";
import {UnControlled as CodeMirrorUn} from "react-codemirror2";

import 'codemirror/mode/javascript/javascript';
import 'codemirror-graphql/mode';
import 'codemirror/keymap/sublime';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/theme/idea.css';


class ActionView extends React.Component{
    constructor(props, context) {
        super(props, context);

        const action = this.props.action;
        let param_fields = {};
        let data_fields = {};
        if ("parameters" in action){
            action.parameters.forEach((param) => {
                param_fields[param.name] = {
                    defaultValue:("default" in param)? param.default : "",
                    value:'',
                    datatype: param.typename,
                    validity:null,
                    not_include: param.typename[param.typename.length - 1] !== "!" || param.default !== null,
                    additional_fields:{}}})
        }
        if ("data" in action){
            action.data.forEach((data) => {
                data_fields[data.name] = {
                    defaultValue:("default" in data)? data.default : "",
                    value:'',
                    datatype: data.typename,
                    validity:null,
                    not_include: data.typename[data.typename.length - 1] !== "!" || data.default !== null,
                    additional_fields:{}}})
        }

        this.state = {
            parameters: param_fields,
            data: data_fields,
            query: '',
            response: '',
            responseAlert: false
        };

        this.QueryEditorInstance = null;
        this.ReturnValueEditorInstance = null;
    }


    handleChangeFields = (caller, type, event) => {
        let newState = {parameters: this.state.parameters, data: this.state.data}
        newState[type][caller].value = event.target.value;
        newState["query"] = makeCompleteQuery(this.props.action, newState.parameters, newState.data, this.props.schema)
        this.setState(newState)
        this.fieldTypeValidation(caller, event.target.value, type)
    }

    handleChangeCustomProperty = (parent_field, caller, type, event) => {
        let newState = {parameters: this.state.parameters, data: this.state.data}
        newState[type][parent_field]["additional_fields"][caller].value = event.target.value;
        newState["query"] = makeCompleteQuery(this.props.action, newState.parameters, newState.data, this.props.schema)
        this.setState(newState)
        this.additionalFieldTypeValidation(parent_field, caller, event.target.value, type)
    }

    handleIgnoreProperty = (caller, type, event) => {
        let newState = {parameters: this.state.parameters, data: this.state.data}
        newState[type][caller].not_include = !event.target.checked;
        newState["query"] = makeCompleteQuery(this.props.action, newState.parameters, newState.data, this.props.schema)
        if (!event.target.checked) {
            newState[type][caller].validity = null
            this.setState(newState)
        } else {
            this.setState(newState)
            this.fieldTypeValidation(caller, this.state[type][caller].value, type)
        }
    }

    deleteAdditionalField = (caller, parent_type, field_name) => {
        let newState = {parameters: this.state.parameters, data: this.state.data}
        delete newState[parent_type][caller].additional_fields[field_name]
        if(newState[parent_type][caller].additional_fields && Object.keys(newState[parent_type][caller].additional_fields).length === 0 && newState[parent_type][caller].additional_fields.constructor === Object){
            newState[parent_type][caller].not_include = true
        }
        newState["query"] = makeCompleteQuery(this.props.action, newState.parameters, newState.data, this.props.schema)
        this.setState(newState)
    }

    addAdditionalField = (caller, parent_type, additional_type, event) =>{
        let newState = {parameters: this.state.parameters, data: this.state.data}
        newState[parent_type][caller].additional_fields[event.target.value] = {datatype:additional_type, value: '', validity:null}
        newState[parent_type][caller].not_include = false
        newState["query"] = makeCompleteQuery(this.props.action, newState.parameters, newState.data, this.props.schema)
        this.setState(newState)
        event.target.value = "__Datatype_Placeholder"
    }

    additionalFieldTypeValidation = (parent_field, caller, value, type) => {
        let newState = {parameters: this.state.parameters, data: this.state.data}
        newState[type][parent_field]["additional_fields"][caller].validity = validateValueType(value, newState[type][parent_field]["additional_fields"][caller].datatype)
        this.setState(newState)
    }

    fieldTypeValidation = (caller, value, type) => {
        let newState = {parameters: this.state.parameters, data: this.state.data}
        newState[type][caller].validity = validateValueType(value, newState[type][caller]["datatype"])
        this.setState(newState)
    }

    handleChangeQueryCodeMirror = (editor, event, value) => {
        this.setState({query: value});
    }

    update_response = (value) => {
        // console.log(value)
        if ('errors' in value){
            try {
                for (const error of value.errors){
                    const argOrField = /field "[^"]*"|Argument "[^"]*"/.exec(error["message"])
                    let field = ""
                    let subfield = ""
                    // console.log(argOrField)
                    if(argOrField !== null){
                        if(argOrField[0].indexOf("Argument") !== -1){
                            field = argOrField[0].substring(argOrField[0].indexOf("\"")+1, argOrField[0].length-1)
                            try {
                                subfield = /field "[^"]*"/.exec(error["message"])[0]
                                subfield = subfield.substring(subfield.indexOf("\"")+1, subfield.length-1)
                            } catch (e) {
                            }
                        } else {
                            field = argOrField[0].substring(argOrField[0].indexOf("\"")+1, argOrField[0].length-1)
                        }
                        if (field === "data"){
                            let data = this.state.data
                            if (subfield === ""){
                                if(field in data){
                                    data[field].validity = false
                                }
                            } else {
                                if (subfield in data[field].additional_fields){
                                    data[field].additional_fields[subfield].validity = false
                                }
                            }
                            this.setState({parameters: data})
                        } else {
                            let params = this.state.parameters
                            if (subfield === ""){
                                if(field in params){
                                    params[field].validity = false
                                }
                            } else {
                                if (subfield in params[field].additional_fields){
                                    params[field].additional_fields[subfield].validity = false
                                }
                            }
                            this.setState({parameters: params})
                        }
                    }
                }
            } catch {}
        }
        if ('data' in value || 'errors' in value){
            this.setState({response: JSON.stringify(value, stringify_replacer, 2), responseAlert:true})
            return
        }
        if (typeof value === 'string'){
            this.setState({response: value, responseAlert:true})
        }
        this.ReturnValueEditorInstance.refresh()
    }


    Send_to_API = () => {
        Send_to_API(this.state.query, this.update_response)
    }

    componentDidMount = () => {
        //TODO maybe reset additional fields
        this.setState({query:makeCompleteQuery(this.props.action, this.state.parameters, this.state.data, this.props.schema)})
        this.QueryEditorInstance.refresh()
        this.ReturnValueEditorInstance.refresh()
    }

    createSubField = (name, type, isValid, isInvalid, placeholder, onChange, deleteFieldFn) => {
        const safe_form_fields = ["Text", "Number", "Time"]
        if (safe_form_fields.includes(type.field)){
            return (
                <div key={name}>
                    {name}:<br/>
                    <InputGroup>
                        <Form.Control
                            type={type.field}
                            isValid={isValid}
                            isInvalid={isInvalid}
                            placeholder={placeholder}
                            onChange={onChange}/>
                        <InputGroup.Append>
                            <Button variant="outline-secondary p-0" onClick={deleteFieldFn}><i className="bi bi-x text-danger remove-field-x"/></Button>
                        </InputGroup.Append>
                    </InputGroup>
                </div>)
        }
        if (type.field === "Select"){
            let options_form = [<option key={"__Null_NonSelection"} disabled hidden value={"Select..."}>Select...</option>];
            Object.keys(type.options).forEach(((o) =>
                    options_form.push(<option key={type.options[o].name}>{type.options[o].name}</option>)
            ))
            return (
                <div key={name}>
                    {name}:<br/>
                    <InputGroup>
                        <Form.Control
                            as={type.field.toLowerCase()}
                            isValid={isValid}
                            isInvalid={isInvalid}
                            defaultValue={"Select..."}
                            onChange={onChange}>
                            {options_form}
                        </Form.Control>
                        <InputGroup.Append>
                            <Button variant="outline-secondary p-0" onClick={deleteFieldFn}><i className="bi bi-x text-danger remove-field-x"/></Button>
                        </InputGroup.Append>
                    </InputGroup>
                </div>)
        }
    }

    create_field = (field, type, value_type, custom_dataTypes=[]) => {
        const datatype = datatypeToFieldType(value_type, custom_dataTypes)
        const ignorable = !datatype.required || this.state[type][field]["default"] !== null
        if (datatype.field === "Select"){
            let selected_options = []
            Object.keys(this.state[type][field]["additional_fields"]).forEach((key) => {
                selected_options.push(
                    this.createSubField(
                        key,
                        datatypeToFieldType(this.state[type][field]["additional_fields"][key]["datatype"]),
                        this.state[type][field]["additional_fields"][key]["validity"] !== null && this.state[type][field]["additional_fields"][key]["validity"],
                        this.state[type][field]["additional_fields"][key]["validity"] !== null && !this.state[type][field]["additional_fields"][key]["validity"],
                        key,
                        (e) => {this.handleChangeCustomProperty(field, key, type, e)},
                        ()=>{this.deleteAdditionalField(field, type, key)}
                    )
                )})
            let options = [<option key={"__Datatype_Placeholder"} disabled hidden value="__Datatype_Placeholder">{datatype.placeholder}</option>];
            datatype.options.forEach((option)=>{options.push(<option key={option.name}>{option.name}</option>)})
            return(
                <div key={field}>
                    {field}:<br/>
                    <InputGroup>
                        <Form.Control
                            as="select"
                            defaultValue={(this.state[type][field]["defaultValue"] === null) ? "__Datatype_Placeholder" : this.state[type][field]["defaultValue"]}
                            onChange={(e) => {
                                if (datatype.spawn_fields) {
                                    this.addAdditionalField(field, type, datatype.options.find(i => (i.name === e.target.value)).typename, e)
                                } else {
                                    this.handleChangeFields(field, type, e)
                                }
                            }}>
                            {options}
                        </Form.Control>
                        {(ignorable) &&
                        <InputGroup.Append>
                            <InputGroup.Checkbox aria-label="Don't include this field"
                                                 onChange={(e) => {this.handleIgnoreProperty(field, type, e)}} checked={!this.state[type][field]["not_include"]}/>
                        </InputGroup.Append>}
                    </InputGroup>
                    {selected_options}
                </div>
            )
        }
        return(
            <div key={field}>
                {field}:<br/>
                <InputGroup>
                    <Form.Control
                        isValid={this.state[type][field]["validity"] !== null && this.state[type][field]["validity"]}
                        isInvalid={this.state[type][field]["validity"] !== null && !this.state[type][field]["validity"]}
                        type={datatype.field}
                        placeholder={field}
                        defaultValue={this.state[type][field]["defaultValue"]}
                        onChange={(e) => {this.handleChangeFields(field, type, e)}} />
                    {(ignorable) &&
                    <InputGroup.Append>
                        <InputGroup.Checkbox aria-label="Don't include this field"
                                             onChange={(e) => {this.handleIgnoreProperty(field, type, e)}} checked={!this.state[type][field]["not_include"]}/>
                    </InputGroup.Append>}
                </InputGroup>
            </div>

            )
    }

    testReturnValues(){
        // console.log(this.state.parameters)
        // console.log(this.state.query)
    }

    refreshCodeMirror = (e) => {
        if(e === "response"){
            this.setState({responseAlert:false})
        }
        setTimeout(() => {
            this.QueryEditorInstance.refresh()
            this.ReturnValueEditorInstance.refresh()
        },5);
    }

    render(){
        let action = this.props.action;
        let param_fields = [];
        let data_fields = [];
        Object.keys(this.state.parameters).forEach((param) => {param_fields.push(this.create_field(param, "parameters", this.state.parameters[param].datatype, this.props.schema["__types"]))})
        Object.keys(this.state.data).forEach((data) => {data_fields.push(this.create_field(data, "data", this.state.data[data].datatype, this.props.schema["__types"]))})
        if(param_fields.length){
            param_fields.unshift(<div key="param_title" className="border-bottom border-dark w-100 d-flex justify-content-between"><strong>Parameters:</strong><strong>Include:</strong></div>)
        }
        if(data_fields.length){
            data_fields.unshift(<div key="data_title" className="border-bottom border-dark w-100 d-flex justify-content-between"><strong>Data:</strong><strong>Include:</strong></div>)
        }
        const query = this.state.query;
        const response = this.state.response;
        return(
            <Card border="dark" className="ml-1 mr-3 mh-100 h-100 flex-column">
                <Card.Header>
                    <Card.Title className="edited-title">{action.name}</Card.Title>
                </Card.Header>

                <Card.Body className="container-fluid">
                    <Row className="container-fluid d-flex h-100 overflow-hidden p-1" >
                        <Col sm={3} className="mh-100 flex-column">
                            <Form className="flex-grow-1 h-100" noValidate>
                                {param_fields}
                                {data_fields}
                                <footer className="position-absolute bottom-stick">
                                    {/*<Button variant="primary" onClick={() => {this.testReturnValues()}}>TEST</Button>*/}
                                    <Button variant="primary" onClick={this.Send_to_API}>{(action.mutation)? "Mutation" : "Query"}</Button>
                                </footer>
                            </Form>
                        </Col>
                        <Col sm={9} className="pb-1">
                            <div className="mh-100 h-100 flex-column modal-tabs border border-dark">
                                <Tabs variant="pills" className="nav-fill mx-3 mt-1" defaultActiveKey="query" onSelect={this.refreshCodeMirror}>
                                    <Tab eventKey="query" title={action.mutation? "Mutation:" : "Query:"}>
                                        <CodeMirror value={query}
                                                    className="no-resize mb-4 mh-100"
                                                    options={{
                                                        theme: "idea",
                                                        autoRefresh:true,
                                                        lineWrapping: true,
                                                        keyMap: 'sublime',
                                                        mode: "graphql",
                                                        smartIndent: true,
                                                        lineNumbers: true,
                                                    }}
                                                    onBeforeChange={this.handleChangeQueryCodeMirror}
                                                    onChange={() => {}}
                                                    editorDidMount={(editor) => { this.QueryEditorInstance = editor}}
                                        />
                                    </Tab>
                                    <Tab eventKey="response" tabClassName={this.state.responseAlert?"bg-warning text-dark": ""} title="Response:">
                                        <CodeMirrorUn value={response}
                                                      className="no-resize mb-4 mh-100"
                                                      options={{
                                                          theme: "idea",
                                                          autoRefresh:true,
                                                          readOnly: true,
                                                          lineWrapping: true,
                                                          keyMap: 'sublime',
                                                          mode: {name: "javascript", json: true},
                                                          smartIndent: true,
                                                          lineNumbers: true
                                                      }}
                                                      editorDidMount={(editor) => { this.ReturnValueEditorInstance = editor}}
                                        />
                                    </Tab>
                                    {/*
                                    {(IsTypeList(action["return_type"])) &&
                                    <Tab eventKey="listView" title="List view:">
                                        <>TODO List</>
                                    </Tab>
                                    }*/}
                                </Tabs>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        )
    }
}

export {ActionView}
