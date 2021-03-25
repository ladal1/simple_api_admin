import React from "react";
import {Button, FormControl, Modal, Pagination} from "react-bootstrap";

class PaginationApplet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            modalPage: null
        }
    }

    PageNumbers = () => {
        if(this.props.pages_num <= 3){
            return (
                <>
                    <Pagination.Prev disabled={this.props["current_page"] === 1}/>
                    <Pagination.Item onClick={() => {this.props.changePageFn(1)}} active={this.props["current_page"] === 1}>1</Pagination.Item>
                    {this.props.pages_num > 1 &&
                    <Pagination.Item onClick={() => {this.props.changePageFn(2)}} active={this.props["current_page"] === 2}>2</Pagination.Item>
                    }
                    {this.props.pages_num > 2 &&
                    <Pagination.Item onClick={() => {this.props.changePageFn(3)}} active={this.props["current_page"] === 3}>3</Pagination.Item>
                    }
                    <Pagination.Next disabled={this.props["current_page"] === this.props.pages_num}/>
                </>
            )
        }
        if(this.props["current_page"] === 1){
            return (
                <>
                    <Pagination.Prev disabled/>
                    <Pagination.Item onClick={() => {this.props.changePageFn(1)}} active>1</Pagination.Item>
                    <Pagination.Item onClick={() => {this.props.changePageFn(2)}}>2</Pagination.Item>
                    <Pagination.Item onClick={() => {this.props.changePageFn(3)}}>3</Pagination.Item>
                    {this.props.pages_num !== 4 &&
                    <Pagination.Ellipsis onClick={this.modalShow}/>
                    }
                    <Pagination.Item onClick={() => {this.props.changePageFn(this.props.pages_num)}}>{this.props.pages_num}</Pagination.Item>
                    <Pagination.Next onClick={() => {this.props.changePageFn(this.props["current_page"]+1)}}/>
                </>
            )
        }
        if(this.props["current_page"] === this.props.pages_num){
            return (
                <>
                    <Pagination.Prev onClick={() => {this.props.changePageFn(this.props["current_page"]-1)}}/>
                    <Pagination.Item onClick={() => {this.props.changePageFn(1)}}>1</Pagination.Item>
                    {this.props.pages_num !== 4 &&
                    <Pagination.Ellipsis onClick={this.modalShow}/>
                    }
                    <Pagination.Item onClick={() => {this.props.changePageFn(this.props["current_page"] - 2)}}>{this.props["current_page"] - 2}</Pagination.Item>
                    <Pagination.Item onClick={() => {this.props.changePageFn(this.props["current_page"] - 1)}}>{this.props["current_page"] - 1}</Pagination.Item>
                    <Pagination.Item onClick={() => {this.props.changePageFn(this.props["current_page"])}} active>{this.props["current_page"]}</Pagination.Item>
                    <Pagination.Next disabled/>
                </>
            )
        }
        return(
            <>
                <Pagination.Prev onClick={() => {this.props.changePageFn(this.props["current_page"]-1)}}/>
                {this.props["current_page"] !== 2 &&
                    <Pagination.Item onClick={() => {this.props.changePageFn(1)}}>1</Pagination.Item>
                }
                {this.props["current_page"] !== 3 && this.props["current_page"] - 2 > 0 &&
                    <Pagination.Ellipsis onClick={this.modalShow}/>
                }
                <Pagination.Item onClick={() => {this.props.changePageFn(this.props["current_page"]-1)}}>{this.props["current_page"] - 1}</Pagination.Item>
                <Pagination.Item onClick={() => {this.props.changePageFn(this.props["current_page"])}} active>{this.props["current_page"]}</Pagination.Item>
                <Pagination.Item onClick={() => {this.props.changePageFn(this.props["current_page"] + 1)}} >{this.props["current_page"] + 1}</Pagination.Item>
                {this.props["current_page"] !== this.props.pages_num - 2 && this.props.pages_num - this.props["current_page"] !== 1 &&
                    <Pagination.Ellipsis onClick={this.modalShow}/>
                }
                {this.props["current_page"] !== this.props.pages_num - 1 &&
                    <Pagination.Item  onClick={() => {this.props.changePageFn(this.props.pages_num)}} >{this.props.pages_num}</Pagination.Item>
                }
                <Pagination.Next onClick={() => {this.props.changePageFn(this.props.current_page+1)}}/>
            </>
        )
    }

    modalShow = () => {
        this.setState({showModal: true})
    }

    modalClose = () => {
        this.setState({showModal: false})
    }

    jumpToPage = (page) => {
        if(this.state.modalPage >= 1 && this.state.modalPage <= this.props.pages_num){
            this.props.changePageFn(page)
        }
    }

    create_modal = () => {
        return (
            <Modal show={this.state.showModal} onHide={this.modalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Jump to page ...</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormControl type="Number"
                                 placeholder="Page"
                                 onChange={(event) => {this.setState({modalPage:event.target.value})}}
                                 isValid={this.state.modalPage >= 1 && this.state.modalPage <= this.props.pages_num}
                                 isInvalid={this.state.modalPage !== null && (this.state.modalPage < 1 || this.state.modalPage > this.props.pages_num)}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.modalClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => {this.jumpToPage(this.state.modalPage)}}>
                        Go
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }


    render(){
        return (
            <>
                <Pagination className="px-2 mb-1">
                    {this.PageNumbers()}
                </Pagination>
                {this.create_modal()}
            </>
        )
    }
}


export {PaginationApplet}
