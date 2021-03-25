import React from "react";
import {Button, Col, Row} from "react-bootstrap";
import {ActionView} from "./ActionView";
import {ActiveObjectList} from "./ActiveObjectList";
import TooltipButton from "react-bootstrap-tooltip-button2";

class ObjectActionsButtons extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            active: {name: null}
        };
    }

    handleShow = (action) => {
        this.setState({active: action})
    }

    render_button(action){
        if(!action["permitted"]){
            return(<TooltipButton
                className="mb-1 ml-3 mr-3 mt-2"
                disabled
                key={action.name}
                title={action.name}
                tooltipText={action["deny_reason"]}
                tooltipPlacement="bottom"
                tooltipId="tt1"
            />)
        }
        return(
            <Button variant="primary" onClick={() => {this.handleShow(action)}} key={action.name} className="mb-1 ml-3 mr-3 mt-2">
                {action.name}
            </Button>
        )
    }

    render() {
        if(this.props.schema === null || this.props.schema === undefined){
            return(
                <>
                    <strong>Could not obtain schema, check your connection to the API, then refresh</strong>
                </>
            )
        }

        let buttons = [];
        if(this.props.object.name !== null) {
            buttons.push(
                    <Button variant="outline-primary" onClick={() => {this.handleShow({name: null})}} key={"__FullViewList"} className="mb-1 ml-3 mr-3 mt-2">
                        Full Object List
                    </Button>)
        }
        if(this.props.object){
            if(this.props.object.name){
                let action_list = this.props.schema["__objects"].find(obj => {return obj.name === this.props.object.name});
                if(typeof(action_list) !== "undefined"){
                    action_list.actions.forEach((e) => {
                        buttons.push(this.render_button(e))
                    })
                }
            } else if (this.props.object.name === null){
                let action_list = this.props.schema["__actions"]
                if(typeof(action_list) !== "undefined"){
                    action_list.forEach((e) => {
                        buttons.push(this.render_button(e))
                    })
                }
            }
        }
        return(
            <div className="d-flex flex-column h-100 w-100">
                <Row className="mr-1 ml-1">
                    <Col className="p-0">
                        {buttons}
                    </Col>
                </Row>
                <Row className="flex-grow-1 mh-100 h-100 mr-1 ml-1">
                    <Col className="px-2 py-1">
                        {this.state.active.name === null ?
                            <ActiveObjectList object={this.props.object} schema={this.props.schema} key={"ListOfObjects_" + this.props.object.name}/> :
                            <ActionView action={this.state.active} schema={this.props.schema} object={this.props.object} key={"ActionView" + this.state.active.name}/>}
                    </Col>
                </Row>
            </div>
        )
    }
}

export {ObjectActionsButtons}
