import React from "react";
import {Button, Form, FormControl, InputGroup, Modal} from "react-bootstrap";
import {convertValue, datatypeToFieldType, validateValueType} from "../CommonDatatypes";

class OrderApplet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openOrderModal:false,
            openFilterModal:false,
            filters: {
                ordering:[]
            },
            filtersValidity: {

            }
        }
    }

    sendFilters = () => {
        //Create data object
        let additional_fields = {}
        for(const property in this.state.filters){
            additional_fields[property] = {
                value: convertValue(this.state.filters[property], this.props.filtersObject.fields.find(i => i.name === property).typename),
                datatype: this.props.filtersObject.fields.find(i => i.name === property).typename
            }
        }
        let filtersObject = {
            filters: {
                additional_fields: additional_fields,
                datatype: this.props.type.typename + "Filters"
            }
        }

        // console.log(JSON.stringify(this.state.filters));
        this.props.changeFilterFn(filtersObject);
    }

    addToOrder = (name) => {
        let newOrder = this.state.filters
        newOrder["ordering"].push(name)
        this.setState({ order: newOrder})
    }

    orderingParse = (name) => {
        if(name[0] === '-') {
            return name.slice(1) + " (Descending)"
        } else {
            return name + " (Ascending)"
        }
    }

    removeFromOrder = (index) => {
        let newOrder = this.state.filters.ordering
        newOrder.splice(index, 1)
        this.setState({ order: newOrder})
    }

    orderModalShow = () => {
        this.setState({openOrderModal:true})
    }

    orderModalClose = () => {
        this.setState({openOrderModal:false})
    }

    create_order_modal = () => {
        let order = this.state.filters.ordering.map((a, i) =>
            <InputGroup key={a + i.toString()} className="text-center m-2">
                <FormControl
                    disabled
                    value={i.toString() + ". " + this.orderingParse(a)}
                    />
                <InputGroup.Append>
                    <Button variant="outline-danger" onClick={() => {this.removeFromOrder(i)}}>X</Button>
                </InputGroup.Append>
            </InputGroup>
        )

        let fields = this.props.type.fields.map(b =>
            <InputGroup key={b.name} className="m-2">
                <FormControl
                    disabled
                    aria-describedby="basic-addon2"
                    value={b.name}
            />
                <InputGroup.Append>
                    <Button variant="outline-dark" onClick={() => {this.addToOrder('-' + b.name)}}>▼</Button>
                    <Button variant="outline-dark" onClick={() => {this.addToOrder(b.name)}}>▲</Button>
                </InputGroup.Append>
            </InputGroup>
        );
        return (
            <Modal show={this.state.openOrderModal} onHide={this.orderModalClose} className="larger-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex justify-content-between">
                    <div className="w-50 mr-4">
                        Current order:
                        {order}
                    </div>
                    <div className="w-50 ml-4" >
                        Add new parameter to order by:
                        {fields}
                    </div>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <div>
                        <Button variant="primary" onClick={() => {this.orderModalClose(); this.setState({order:["?"]}); setTimeout(() => {this.sendFilters()},5);}}>
                            Randomize!
                        </Button>
                    </div>
                    <div>
                        <Button variant="primary" className="mr-2" onClick={() => {this.orderModalClose(); this.sendFilters()}}>
                            Save Changes
                        </Button>
                        <Button variant="secondary" onClick={this.orderModalClose}>
                            Close
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        )
    }

    filterModalShow = () => {
        this.setState({openFilterModal:true})
    }

    filterModalClose = () => {
        this.setState({openFilterModal:false})
    }

    handleSubfieldChange = (fieldName, e) => {
        let newObj = this.state.filters
        newObj[fieldName] = e.target.value
        this.setState({filters: newObj})
        this.subfieldValidation(fieldName)
    }

    subfieldValidation = (fieldName) => {
        const type = this.props.filtersObject.fields.find(i => i.name === fieldName).typename
        const value = this.state.filters[fieldName]
        let newObj = this.state.filtersValidity
        newObj[fieldName] = validateValueType(value, type)
        this.setState({filtersValidity: newObj})
    }

    createSubField = (name, type, isValid, isInvalid, placeholder, onChange, deleteFieldFn) => {
        const safe_form_fields = ["Text", "Number", "Time"]
        if (safe_form_fields.includes(type.field)){
            return (
                <div key={name}>
                    {name}:<br/>
                    <InputGroup>
                        <Form.Control
                            defaultValue={this.state.filters[name]}
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
            let options_form = [<option key={"__Null_NonSelection"} disabled hidden value={"__Null_NonSelection"}>Select...</option>];
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
                            defaultValue={this.state.filters[name] === ""? "Select...": this.state.filters[name]}
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

    addAdditionalField = (e) => {
        let newObj = this.state.filters
        newObj[e.target.value] = ""
        this.setState({filters: newObj})
        e.target.value = "__Null_NonSelection"
    }

    deleteAdditionalField = (name) => {
        let newObj = this.state.filters
        delete newObj[name]
        this.setState({filters: newObj})
    }

    create_filter_modal = () => {
        let options = [<option key={"__Null_NonSelection"} disabled hidden value={"__Null_NonSelection"}>Add Filter...</option>];
        let selected_options = []
        for (const filter of this.props.filtersObject["fields"]) {
            if (filter.name === "ordering"){
                continue;
            }
            options.push(<option key={filter.name}>{filter.name}</option>)
        }
        for (const selected in this.state.filters) {
            if (selected === "ordering"){
                continue;
            }
            selected_options.push(this.createSubField(
                selected,
                datatypeToFieldType(this.props.filtersObject.fields.find(i => i.name === selected).typename),
                this.state.filtersValidity[selected],
                !this.state.filtersValidity[selected],
                selected,
                (e) => this.handleSubfieldChange(selected, e),
                () => this.deleteAdditionalField(selected)))

            //<div key={selected}>{selected}</div>
        }


        return (
            <Modal show={this.state.openFilterModal} onHide={this.filterModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex justify-content-between">
                    <div className="w-100 mr-4">
                        Add filter:
                        <InputGroup>
                            <Form.Control
                                as="select"
                                defaultValue="__Null_NonSelection"
                                onChange={(e) => {
                                    this.addAdditionalField(e)
                                }}>
                                {options}
                            </Form.Control>
                        </InputGroup>
                        { selected_options }
                    </div>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <div>
                        <Button variant="primary" className="mr-2" onClick={() => {this.filterModalClose(); this.sendFilters()}}>
                            Save Changes
                        </Button>
                        <Button variant="secondary" onClick={this.filterModalClose}>
                            Close
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        )
    }

    render(){
        return (
            <>
                <div>
                    <Button variant="outline-primary" className="ml-1" onClick={this.orderModalShow}>Order</Button>
                    <Button variant="outline-primary" className="ml-1" onClick={this.filterModalShow}>Filter</Button>
                    {this.create_order_modal()}
                    {this.create_filter_modal()}
                </div>
            </>
        )
    }
}

export {OrderApplet}