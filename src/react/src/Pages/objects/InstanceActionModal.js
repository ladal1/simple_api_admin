import React from "react";
import {Button, Form, InputGroup, Modal, Tab, Tabs} from "react-bootstrap";
import {datatypeToFieldType, validateValueType} from "../CommonDatatypes";
import {makeCompleteQuery} from "../../Queries/QueryConstructor";
import {Send_to_API, stringify_replacer} from "../CommonAPI";
import {Controlled as CodeMirror, UnControlled as CodeMirrorUn} from "react-codemirror2";


class InstanceActionModal extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            query: '',
            response: '',
            responseAlert: false
        };


        this.QueryEditorInstance = null;
        this.ReturnValueEditorInstance = null;
    }

    refreshCodeMirror = (e) => {
        if(e === "result"){
            this.setState({responseAlert:false})
        }
        setTimeout(() => {
            this.QueryEditorInstance.refresh()
            this.ReturnValueEditorInstance.refresh()
        },5);
    }

    handleChangeFields = (caller, type, event) => {
        let newState = {parameters: this.state.parameters, data: this.state.data}
        newState[type][caller].value = event.target.value;
        newState["query"] = makeCompleteQuery(this.props.modalDetails.Action, newState.parameters, newState.data, this.props.schema)
        this.setState(newState)
        this.fieldTypeValidation(caller, event.target.value, type)
        // console.log(this.state)
    }

    handleChangeCustomProperty = (parent_field, caller, type, event) => {
        let newState = {parameters: this.state.parameters, data: this.state.data}
        newState[type][parent_field]["additional_fields"][caller].value = event.target.value;
        newState["query"] = makeCompleteQuery(this.props.modalDetails.Action, newState.parameters, newState.data, this.props.schema)
        this.setState(newState)
        this.additionalFieldTypeValidation(parent_field, caller, event.target.value, type)
    }

    handleIgnoreProperty = (caller, type, event) => {
        let newState = {parameters: this.state.parameters, data: this.state.data}
        newState[type][caller].not_include = !event.target.checked;
        newState["query"] = makeCompleteQuery(this.props.modalDetails.Action, newState.parameters, newState.data, this.props.schema)
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
        newState["query"] = makeCompleteQuery(this.props.modalDetails.Action, newState.parameters, newState.data, this.props.schema)
        this.setState(newState)
    }

    addAdditionalField = (caller, parent_type, additional_type, event) =>{
        let newState = {parameters: this.state.parameters, data: this.state.data}
        event.target.value = "__Datatype_Placeholder"
        newState[parent_type][caller].additional_fields[event.target.value] = {datatype:additional_type, value: '', validity:null}
        newState[parent_type][caller].not_include = false
        newState["query"] = makeCompleteQuery(this.props.modalDetails.Action, newState.parameters, newState.data, this.props.schema)
        this.setState(newState)
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
            let options = [<option key={"__Datatype_Placeholder"} disabled hidden value={"__Datatype_Placeholder"}>{datatype.placeholder}</option>];
            const defaultValue= this.state[type][field]["value"] !== "" ? this.state[type][field]["value"] : (this.state[type][field]["defaultValue"] === "") ? datatype.placeholder : this.state[type][field]["defaultValue"]
            // console.log(defaultValue)
            datatype.options.forEach((option)=>{options.push(<option key={option.name}>{option.name}</option>)})
            return(
                <div key={field}>
                    {field}:<br/>
                    <InputGroup>
                        <Form.Control
                            as="select"
                            defaultValue={defaultValue}
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

    componentDidMount = () => {
        this.setState({query:makeCompleteQuery(this.props.modalDetails.Action, this.state.parameters, this.state.data, this.props.schema)})
        this.QueryEditorInstance.refresh()
        this.ReturnValueEditorInstance.refresh()
    }

    static getDerivedStateFromProps(props) {
        const action = props.modalDetails.Action;
        if (action !== null) {
            let param_fields = {};
            let data_fields = {};
            if ("parameters" in action) {
                action.parameters.forEach((param) => {
                    param_fields[param.name] = {
                        defaultValue: (param.name in props.modalDetails.Object)? props.modalDetails.Object[param.name] : ("default" in param) ? param.default : "",
                        value: (param.name in props.modalDetails.Object)? props.modalDetails.Object[param.name] : '',
                        datatype: param.typename,
                        validity: null,
                        not_include: param.typename[param.typename.length - 1] !== "!" || param.default !== null,
                        additional_fields: {}
                    }
                })
            }
            if ("data" in action) {
                action.data.forEach((data) => {
                    data_fields[data.name] = {
                        defaultValue: (data.name in props.modalDetails.Object)? props.modalDetails.Object[data.name] : ("default" in data) ? data.default : "",
                        value: (data.name in props.modalDetails.Object)? props.modalDetails.Object[data.name] : '',
                        datatype: data.typename,
                        validity: null,
                        not_include: data.typename[data.typename.length - 1] !== "!" || data.default !== null,
                        additional_fields: {}
                    }
                })
            }
            return{
                parameters: param_fields,
                data: data_fields,
            }
        }
        return null
    }


    render(){
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
            <>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.modalDetails.Action !== null ? this.props.modalDetails.Action.name : "Action modal"}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Tabs className="nav-fill mx-3 mt-1" defaultActiveKey="form" onSelect={this.refreshCodeMirror}>
                        <Tab eventKey="form" title="Form">
                            {param_fields}
                            {data_fields}
                        </Tab>
                        <Tab eventKey="query" title="Query">
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
                        <Tab eventKey="result" tabClassName={this.state.responseAlert?"bg-warning text-dark": ""} title="Result">
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
                            />                        </Tab>
                    </Tabs>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="primary" onClick={this.Send_to_API}>Execute Action</Button>
                </Modal.Footer>
            </>
        )
    }
}

export default InstanceActionModal