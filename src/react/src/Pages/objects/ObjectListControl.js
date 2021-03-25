import React from "react";
import {PaginationApplet} from "./Paginator";
import {OrderApplet} from "./ObjectOrderingAndFiltering";
import {Button} from "react-bootstrap";



class OrderAndPagination extends React.Component {
    render(){
        return (
            <div className="d-flex justify-content-between">
                <OrderApplet type={this.props.type} changeFilterFn={this.props.changeFilterFn} filtersObject={this.props.typeFilters}/>
                <div>
                    <Button variant="outline-primary" className="ml-1" onClick={this.props.expandAllFn}>Expand All</Button>
                    <Button variant="outline-primary" className="ml-1" onClick={this.props.collapseAllFn}>Collapse All</Button>
                </div>
                <PaginationApplet pages_num={this.props.pages_num} current_page={this.props.current_page} changePageFn={this.props.changePageFn}/>
            </div>
        )
    }
}

export {OrderAndPagination}