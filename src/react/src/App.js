import React from 'react';

import Actions from "./Pages/Actions"
import Objects from "./Pages/Objects"
import {
    Container,
    Navbar,
    Nav,
    Dropdown,
    FormControl,
    InputGroup,
    Button,
    OverlayTrigger,
    Tooltip
} from "react-bootstrap";
import 'regenerator-runtime/runtime'
import {api_login, api_login_status, api_logout, getCookie, getSimpleSchema, setCookie} from "./Pages/CommonAPI";


class TopBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {navbarKey: "objects", login_text: ""}
        this.loginTextHandler = this.loginTextHandler.bind(this)
        this.loginButton = this.loginButton.bind(this)
        this.maybeSubmit = this.maybeSubmit.bind(this)
    }

    loginTextHandler(e){
        this.setState({login_text:e.target.value})
    }

    loginButton(){
        this.props.login_fn(this.state.login_text)
    }

    changeView(view){
        this.setState({navbarKey:view})
        this.props.viewChange(view)
    }

    maybeSubmit(e){
        if (e.key === "Enter"){
            this.loginButton()
        }
    }

    make_quickLogin(username){
        let display_username = username
        let key = "login_"
        if (username === null){
            display_username = <em>Not logged in</em>
            key += "_anonymous"
        } else {
            key += username
        }
        if (username === this.props.current_user){
            display_username = <strong>{display_username}</strong>
        }
        return(<Dropdown.Item onClick={() => {if (this.props.current_user !== username){this.props.login_fn(username)}}} key={key}>{display_username}</Dropdown.Item>)
    }

    render() {
        let saved_logins = []
        this.props.logins.forEach((e) => {saved_logins.push(this.make_quickLogin(e))})
        const is_anon = (this.props.current_user === null)

        return (
            <Navbar variant={"dark"} expand="lg" className={"navbar-expand-lg text-white navbar-expand bg-primary"}>
                <div className="navbar-collapse collapse w-100 order-1 order-md-0 dual-collapse2">
                    <Navbar.Brand href="https://www.github.com/karlosss/simple_api">Simple-API</Navbar.Brand>
                    <div className="collapse navbar-collapse">
                        <Nav variant="pills" activeKey={this.state.navbarKey}>
                            <Nav.Link onClick={() => {this.changeView("objects")}} eventKey="objects">Objects</Nav.Link>
                            {/* <Nav.Link onClick={() => {this.changeView("actions")}} eventKey="actions">Actions</Nav.Link> */}
                        </Nav>
                    </div>
                </div>
                <div className="collapse navbar-collapse pe-4">
                    <ul className="navbar-nav me-auto ms-auto">
                        <OverlayTrigger
                            placement="left"
                            delay={{ show: 250, hide: 400 }}

                            overlay={
                                <Tooltip id={`tooltip`}>
                                    <strong>{this.props.connected? "Succesfully fetched schema from API": "Failed to fetch schema from API"}</strong>.
                                </Tooltip>
                            }>
                            {this.props.connected? <i className="bi bi-check connected-icon text-success"/>  : <i className="bi bi-x connected-icon text-danger"/>}
                        </OverlayTrigger>
                        <Dropdown >
                            <Dropdown.Toggle id="login-dropdown" className="nav-link text-white">
                                {is_anon ? "Not logged in" : this.props.current_user}
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="dropdown-menu large-dropdown" aria-labelledby="navbarDropdown" alignRight>
                                {!is_anon ?
                                    <>
                                        <Dropdown.Item onClick={() => this.props.logout_fn(this.props.current_user)}>Logout Current User</Dropdown.Item>
                                        <Dropdown.Divider />
                                    </> : <></>}
                                <label className="px-4">Login:</label>
                                <InputGroup className="mb-3 px-4">
                                    <FormControl
                                        placeholder="Username"
                                        aria-label="Username to login as"
                                        aria-describedby="basic-addon2"
                                        value={this.state.login_text}
                                        onChange={this.loginTextHandler}
                                        onKeyDown={this.maybeSubmit}
                                    />
                                    <InputGroup.Append>
                                        <Button onClick={this.loginButton} variant="outline-primary" type="submit">Login</Button>
                                    </InputGroup.Append>
                                </InputGroup>
                                <Dropdown.Divider />
                                {saved_logins}
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={this.props.logout_fn_all}>Logout All</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </ul>
                </div>
            </Navbar>
        )
    }
}
 /*

class FrontPage extends React.Component{
    render() {
        return (
            <div>
                <Card>
                    <Card.Body>Hi! I'm the frontpage, click above on "Objects" or "Actions" to start exploring your API</Card.Body>
                </Card>
            </div>
        )
    }
}

  */

class ViewSelector extends React.Component{
    constructor(props) {
        super(props);
        const windows = {
            'objects': Objects,
            'actions': Actions}
        let saved_logins = getCookie("savedLogins")
        let logins = [null]
        if(!saved_logins){
            setCookie("savedLogins", JSON.stringify(logins))
        } else {
            logins = JSON.parse(getCookie("savedLogins"))
        }
        this.state = {activeView: Objects, windows:windows, logins:logins, current_user:null, schema:null, errors:null}
        api_login_status(this.changeUser, ()=>{})
        this.reloadSchema()
    }

    reloadSchema(){
        getSimpleSchema((schema)=>{this.setState({schema:schema})}, (e) => {console.log(e); this.setState({schema:null})})
    }

    changeView = (view) => {
        this.reloadSchema()
        // console.log(this.state.schema)
        this.setState({activeView: this.state.windows[view]})
    }

    changeUser = (username) => {
        // console.log(username)
        if (!this.state.logins.includes(username)){
            let newArr = this.state.logins.concat(username)
            this.setState({logins:newArr})
            setCookie("savedLogins", JSON.stringify(newArr))
        }
        this.setState({current_user:username})
        this.reloadSchema()
    }

    logoutUser = (username) => {
        // console.log(username)
        if (username === null){
            return
        }
        if (username === this.state.current_user){
            this.setState({current_user:null})
        }
        let newArr = this.state.logins.filter(e => e !== username)

        this.setState({logins: newArr})
        setCookie("savedLogins", JSON.stringify(newArr))
        this.reloadSchema()
    }

    logoutAll = () => {
        this.setState({logins:[null], current_user:null})
        setCookie("savedLogins", JSON.stringify([null]))
    }


    render() {
        const View = this.state.activeView;
        return(
            <>
                <TopBar viewChange={this.changeView}
                        logins={this.state.logins}
                        login_fn={(user) => {api_login(user, this.changeUser, ()=>{})}}
                        logout_fn={(user) => {api_logout(user, this.logoutUser, ()=>{})}}
                        logout_fn_all={() => {api_logout(this.state.current_user, this.logoutAll, ()=>{})}}
                        current_user={this.state.current_user}
                        connected={this.state.schema !== null}/>
                <View schema={this.state.schema} key={this.state.current_user}/>
            </>
        )
    }
}


const App = () => {
    return (
        <Container fluid className="container-fluid d-flex flex-column vh-100 p-0 top-container">
            <ViewSelector/>
        </Container>
    )
}

export default App;
