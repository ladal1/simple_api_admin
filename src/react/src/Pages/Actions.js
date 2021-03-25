import React from "react";
import {Col, Row, Accordion, Card} from "react-bootstrap";

function get_all_actions(schema){
    let object_actions = [];
    if (schema === null) {
        return {}
    }
    schema["__objects"].forEach((e) => e.actions.forEach((a) => {object_actions.push(a)}))
    return {object: object_actions, general: schema["__actions"]}
}


class ActionList extends React.Component{
    action_card(action, bg){
        return(
            <Accordion key={action.name}>
                <Card className={bg}>
                    <Card.Header>
                        <Accordion.Toggle as={Card.Header} variant="link" eventKey="0">
                            {action.name}
                        </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>Hello! I'm the body</Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        )
    }

    render() {
        if(this.props.schema === null){
            return(
                <>
                    <strong>Could not obtain schema, check your connection to the API, then refresh</strong>
                </>
            )
        }
        const actions = get_all_actions(this.props.schema);
        let action_cards = []
        actions.general.forEach((a) => {action_cards.push(this.action_card(a, "bg-object"))})
        actions.object.forEach((a) => {action_cards.push(this.action_card(a, "bg-action"))})
        return (
            <>
                {action_cards}
            </>

        )
    }
}

class Actions extends React.Component{
    render(){
        return (
            <Row className="flex-grow-1 overflow-hidden">
                <Col sm={12} className='p-4 mh-100'>
                    <ActionList schema={this.props.schema}/>
                </Col>
            </Row>
        )
    }
}

export default Actions
