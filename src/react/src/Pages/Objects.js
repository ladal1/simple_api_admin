import React from "react";
import {Col, ListGroup, Row} from "react-bootstrap";
import {ObjectActionsButtons} from "./objects/ActionButtons";


class ObjectList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {activeObject: null}
    }

    changeActive(object){
        this.props["activeChange"](object)
        this.setState({activeObject:object})
    }

    render_item(item){
        return(
            <ListGroup.Item active={this.state["activeObject"] === item.name} action onClick={() => {this.changeActive(item)}} key={item.name}>
                {item.name}
            </ListGroup.Item>
        )
    }

    render() {
        let items = [];
        if(this.props.schema !== null && this.props.schema !== undefined){
            if(this.props.schema["__actions"].length > 0){
                items.push(
                    <ListGroup.Item action active={this.state["activeObject"] === null} onClick={() => {this.changeActive({name: null})}} key={"__unassigned_actions"} className={"bg-object text-dark"}>
                        Unassigned
                    </ListGroup.Item>
                )
            }
            this.props.schema["__objects"].forEach(
                (i) => {
                    items.push(this.render_item(i));
                })
        }
        return (
            <div>
                <h6 className="mx-3 m-2">Objects:</h6>
                <ListGroup>
                    {items}
                </ListGroup>
            </div>
        )
    }
}

class Objects extends React.Component{
    constructor(props) {
        super(props);
        this.state = {activeObject: {name:null}}
    }

    changeObject = (object) => {
        this.setState({activeObject: object})
    }

    render() {
        return (
            <Row className="flex-grow-1 overflow-scroll ">
                <Col sm={2} className='bg-secondary pl-4 mh-100'>
                    <ObjectList activeChange={this.changeObject} schema={this.props.schema}/>
                </Col>
                <Col sm={10} className='overflow-auto py-2 px-0 mh-100 d-flex'>
                    <ObjectActionsButtons object={this.state["activeObject"]} schema={this.props.schema} key={this.state["activeObject"].name}/>
                </Col>
            </Row>
        );
    }
}

export default Objects;
