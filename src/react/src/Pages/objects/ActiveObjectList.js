import React from "react";
import {Accordion, Button, ButtonGroup, Card, Col, Modal, Row} from "react-bootstrap";
import {createListQuery} from "../../Queries/QueryConstructor";
import {Send_to_API} from "../CommonAPI";
import {PropertyToString} from "../CommonDatatypes";
import {OrderAndPagination} from "./ObjectListControl";
import TooltipButton from "react-bootstrap-tooltip-button2";
import InstanceActionModal from "./InstanceActionModal";

class ActiveObjectList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pages: null,
            per_page: 10,
            loaded_objects: [],
            current_page: 1,
            pages_num: 1,
            filters: {},
            expandedTabs:[],
            instanceActionModal:{
                Action:null,
                Object:null,
                show:false
            }
        }

        this.reloadSchema()
    }

    change_filters = (filters) => {
        this.setState({filters:filters})
        setTimeout(() => {
            this.reloadSchema()
        },15);
    }

    load_objects = (objects_json) => {
        const results = objects_json["data"][Object.keys(objects_json["data"])[0]]
        let pages_num = Math.ceil(results["count"] / this.state["per_page"])
        this.setState({loaded_objects: results["data"], pages_num: pages_num})
    }

    change_page = (target_page) => {
        this.setState({current_page: Number(target_page)})
        this.reloadSchema(Number(target_page))
    }

    reloadSchema = (current_page=this.state["current_page"]) => {
        try {
            // console.log(createListQuery(this.props.object, this.props.schema["__types"], (current_page-1)*this.state.per_page, this.state.per_page, this.state.order))
            if (this.props.object.name !== null) {
                Send_to_API(createListQuery(this.props.object, this.props.schema["__types"], (current_page-1)*this.state.per_page, this.state.per_page, this.state.filters), this.load_objects, console.log)
            }
        } catch (e){
            // console.log("Could not make query")
        }
    }

    makeObjectActionButton = (action, object) => {
        if(!action["permitted"]){
            return (<TooltipButton
                    disabled
                    key={action.name}
                    title={action.name}
                    tooltipText={action["deny_reason"]}
                    tooltipPlacement="left"
                    tooltipId="tt2"
                />
            )
        }
        return (
            <Button key={action.name} onClick={() => this.showInstanceAction(action, object)}>
                {action.name}
            </Button>
        )
    }

    showInstanceAction = (action, object) => {
        this.setState({
            instanceActionModal:{
                Action:action,
                Object:object,
                show:true
            }})
    }

    hideInstanceAction = () => {
        this.setState({
            instanceActionModal:{
                Action:null,
                Object:null,
                show:false
            }
        })
    }

    openAllCards = () => {
        this.setState({expandedTabs:[...Array(this.state.per_page).keys()]})
    }

    closeAllCards = () => {
        this.setState({expandedTabs:[]})
    }

    openOrCloseCard = (card_id) => {
        let newExpanded = this.state.expandedTabs;
        if (newExpanded.includes(card_id)){
            newExpanded.splice(newExpanded.indexOf(card_id), 1)
        } else {
            newExpanded.push(card_id);
        }
        this.setState({expandedTabs: newExpanded})
    }

    objectAccordion = (object, i) => {
        let objectAttributes = []
        let objectActions = []
        const openTab = this.state["expandedTabs"].includes(i)
        for (const property in object){
            if(property === "__str__"){
                continue
            }
            if(property === "__actions"){
                object[property].forEach((act) => objectActions.push(this.makeObjectActionButton(act, object)))
                continue
            }
            objectAttributes.push(<div key={property}><strong>{property}:</strong> {PropertyToString(property, object)}</div>)
        }
        return (
            <Accordion key={object.name + i.toString()} activeKey={openTab ? "0": "X"} className="mr-2">
                <Card>
                    <Accordion.Toggle as={Card.Header} eventKey="0" className="bg-secondary" onClick={()=>this.openOrCloseCard(i)}>
                        {object["__str__"]}
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <Row>
                                <Col sm={9}>
                                    {objectAttributes}
                                </Col>
                                <Col sm={3}>
                                    Actions:<br/>
                                    <ButtonGroup vertical>
                                        {objectActions}
                                    </ButtonGroup>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        )
    }

    generateObjectList = () => {
        let objectItems = []
        this.state.loaded_objects.forEach((obj, i) => {objectItems.push(this.objectAccordion(obj, i))})
        return objectItems
    }

    render() {
        let objectItems = this.generateObjectList()
        return (
            <div className="ml-1 pr-1 mh-100 h-100 flex-column">
                {this.props.object.name !== null &&
                <>
                    <OrderAndPagination
                        type={this.props.schema["__types"].find(i => i.typename === this.props.object.name)}
                        typeFilters={this.props.schema["__types"].find(i => i.typename === this.props.object.name + "Filters")}
                        pages_num={this.state.pages_num}
                        current_page={this.state["current_page"]}
                        changePageFn={this.change_page}
                        changeFilterFn={this.change_filters}
                        expandAllFn={this.openAllCards}
                        collapseAllFn={this.closeAllCards}
                    />
                    {objectItems}
                    <Modal show={this.state.instanceActionModal.show} className="InstanceActionModal" onHide={this.hideInstanceAction}>
                        <InstanceActionModal
                            modalDetails={this.state.instanceActionModal}
                            objectType={this.props.object}
                            schema={this.props.schema}/>
                    </Modal>
                </>}
            </div>
        )
    }
}

export {ActiveObjectList}