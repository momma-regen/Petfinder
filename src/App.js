import { empty } from './utils';
import React from 'react';
import { ApiController } from './api';
import { Accordion, Button, ButtonGroup, Card, Image, Nav, Navbar, Form, FormControl, Col, Row, Container, Modal, Badge, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDog, faCat, faHorse, faCrow, faFish, faCow, faPaw } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

document.onkeydown = function(e) {
    e = (e||window.event);
    if (e.keyCode === 13) {
        e.preventDefault();
        document.getElementById("searchBtn").click();
    }
}

const api = new ApiController();

function updateResults(results) {
    this.setState({results: results});
    let t = document.createElement("textarea");
    t.value = JSON.stringify(results);
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    document.body.removeChild(t);
}

function renderPop(title, text, type) {
    this.setState({
        modalShow: true,
        title: title,
        text: text,
        type: (type == null ? "warning" : type)
    });
}

class Navigation extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = {searchString: ""};
        this.search = this.search.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    
    handleChange(e) {
        this.setState({searchString: e.target.value});
    }
    
    search(e) {
        api.buildParams(this.state.searchString).then(params => {
            api.makeRequest("animals", params)
            .then(result => {
                if (api.error != null) {
                    renderPop("Warning", JSON.stringify(api.error), "warning");
                    api.error = null;
                }
                updateResults((result||{data: ""}).data);
            })
            .catch(error => {
                if (+(error.message||"500").replace(/[^\d]/g, "") !== 400) {
                    renderPop("Error", error.message, "error");
                } 
                updateResults("");
            });
        });
        e.preventDefault();
    }
    
    help() {
        const formatTypes = (types) => {
            let type = types.pop();
            return `${types.join(", ")} and ${type}`;
        };
        api.getTypes().then(types => {
            let text = (
                <Table hover responsive>
                    <thead>
                        <tr>
                            <th colSpan="2">
                                Search by typing <strong>"key:values"</strong>. Values are separated by spaces, as are additional keys.
                                Ex: "type:cat dog gender:male status:adoptable"
                            </th>
                        </tr>
                        <tr>
                            <th>
                                Key
                            </th>
                            <th>
                                Value
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>type</th>
                            <td>Return results matching animal type. Available types are: {formatTypes(types)}</td>
                        </tr>
                        <tr>
                            <th>breed</th>
                            <td>Return results matching an animal breed</td>
                        </tr>
                        <tr>
                            <th>size</th>
                            <td>Return results matching an animal size</td>
                        </tr>
                        <tr>
                            <th>gender</th>
                            <td>Return results matching an animal gender</td>
                        </tr>
                        <tr>
                            <th>age</th>
                            <td>Return results matching an animal age</td>
                        </tr>
                        <tr>
                            <th>color</th>
                            <td>Return results matching an animal color</td>
                        </tr>
                        <tr>
                            <th>coat</th>
                            <td>Return results matching an animal coat</td>
                        </tr>
                        <tr>
                            <th>status</th>
                            <td>Return results matching an animal status</td>
                        </tr>
                        <tr>
                            <th>name</th>
                            <td>Return results matching an animal name. Will also return partial matches</td>
                        </tr>
                        <tr>
                            <th>location</th>
                            <td>
                                Return results by location. If the app was not able to automatically determine your location, or you
                                wish to search for a location other than where you currently are, you may specify that here
                            </td>
                        </tr>
                        <tr>
                            <th>distance</th>
                            <td>
                                Specify a distance from location. A location must have been automatically determined (you would have 
                                gotten a pop-up) or you may enter one using the "location" key
                            </td>
                        </tr>
                        <tr>
                            <th>sort</th>
                            <td>Attribute to sort by</td>
                        </tr>
                    </tbody>
                </Table>
            );
            renderPop("Search Help", text, "info");
        });
    }
    
    render() 
    {
        return (
            <Navbar sticky="top" bg="light" expand="lg" id="navigation">
                <Navbar.Brand href="#home">Pet Finder</Navbar.Brand>
                <Form className="ml-md-auto" inline>
                    <Col className="col-12 col-md-9">
                        <ButtonGroup>
                            <FormControl type="text" placeholder="Search" className="mr-sm-2" value={this.state.searchString} onChange={this.handleChange} />
                            <Button id="searchBtn" variant="outline-success" onClick={this.search}>Search</Button>
                        </ButtonGroup>
                    </Col>
                    <Col>
                        <Button variant="info" className="col-12" onClick={this.help}>
                            Help
                        </Button>
                    </Col>
                </Form>
            </Navbar>
        );
    }
}

class Results extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {results: {}};
        updateResults = updateResults.bind(this);
    }
    
    render() {
        return (
            <Container className="col-sm-12">
                {(this.state.results.animals||[]).map((animal, i) => (<Animal obj={animal} key={i} />))}
            </Container>
        );
    }
}

class Animal extends React.Component
{
    constructor(props) {
        super(props);
        this.state = props.obj;
    }
    
    getImg(photos) {
        let photo = "https://dl5zpyw5k3jeb.cloudfront.net/photos/pets/45205723/1/?bust=1562724798";
        while (photos.length) {
            let p = (photos.shift()||{});
            photo = (p.full||p.large||p.medium||p.small||null);
        }
        return photo;
    }
    
    getIcon(type) {
        switch(type) {
            case "dog":
                return faDog;
            case "cat":
                return faCat;
            case "horse":
                return faHorse;
            case "bird":
                return faCrow;
            case "fish":
                return faFish;
            default:
                return faPaw;
        }
    }
    
    getBreeds(breeds) {
        if (breeds.unknown) {
            return "?"
        }
        return breeds.primary + (breeds.mixed ? `, ${breeds.secondary}` : "");
    }
    
    getColors(colors) {
        return colors.primary + (colors.secondary != null ? ` and ${this.state.colors.secondary}` : "");
    }
    
    getGender(gender) {
        let type = "secondary";
        switch (gender.toLowerCase()) {
            case "male":
                type = "primary";
                break;
            case "female":
                type = "danger";
                break;
        }
        
        return (<Badge className="mx-1" variant={type}>{gender}</Badge>);
    }
    
    getAttributes(name, attributes, environment) {
        let yes = [];
        let no = [];
        let good = [];
        let notGood = [];
        name = name.split(" ").shift();
        Object.keys(attributes).forEach(key => {
            let rep = (key == "shots_current" ? "up to date on shots" : key.replace(/ed_neu/, "ed/neu").replace(/\_/g, " "));
            if (attributes[key] === true) {
                yes.push(rep);
            } else if (attributes[key] === false) {
                no.push(rep);
            }
        });
        Object.keys(environment).forEach(key => {
            if (environment[key] === true) {
                good.push(key);
            } else if (environment[key] === false) {
                notGood.push(key);
            }
        });
        
        const format = (arr, front, andor) => {
            let hold = null,
                str = null;
            if (!arr.length) {
                return "";
            } else if (arr.length === 1) {
                str = arr.shift();
            } else {
                hold = arr.pop();
                str = `${arr.join(", ")} ${(andor ? "and" : "or")} ${hold}`;
            }
            
            return `${name} is ${front}${str}`;
        };
        
        return (
            <span>
                {format(yes, "", true)}<br/>
                {format(no, "not ", false)}<br/>
                {format(good, "good with ", true)}<br/>
                {format(notGood, "not good with ", false)}<br/>
            </span>
        );
    }
    
    getAdoptable(status) {
        let canAdopt = status == "adoptable";
        return (<Badge className="mx-1" variant={canAdopt ? "success" : "warning"}>{canAdopt ? "Adoptable" : "Not Adoptable"}</Badge>);
    }
    
    render() {
        return (
            <Col className="col-12">
                <Accordion defaultActiveKey="0">
                    <Card>
                        <Accordion.Toggle as={Card.Header} className="col-12" eventKey="0">
                            <h3 className="mx-0">
                                <FontAwesomeIcon icon={this.getIcon(this.state.type.toLowerCase())}/> - {this.state.name} 
                                <Badge className="ml-2 mr-1" variant="dark">{this.state.size}</Badge>
                                <Badge className="mx-1" variant="info">{this.state.age}</Badge>
                                {this.getGender(this.state.gender)}
                                {this.getAdoptable(this.state.status)}
                            </h3>
                        </Accordion.Toggle>
                        <Card.Body className="p-0">
                            <Accordion.Collapse eventKey="0">
                                <Row>
                                    <Col className="col-12 col-lg-4">
                                        <Col className="col-4 col-lg-12 mx-auto">
                                            <Image className="d-lg-block py-2" src={this.getImg(this.state.photos)} fluid />
                                        </Col>
                                    </Col>
                                    <Col className="col-12 col-lg-8 py-2">
                                        <Table hover responsive>
                                            <tbody>
                                                <tr>
                                                    <th>Breeds:</th>
                                                    <td>{this.getBreeds(this.state.breeds)}</td>
                                                </tr>
                                                <tr>
                                                    <th>Colors:</th>
                                                    <td>{this.getColors(this.state.colors)}</td>
                                                </tr>
                                                <tr>
                                                    <th>Coat:</th>
                                                    <td>{this.state.coat}</td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="2">
                                                        {this.getAttributes(this.state.name, this.state.attributes, this.state.environment)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="2">
                                                        {this.state.description}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </Accordion.Collapse>
                        </Card.Body>
                        <Card.Footer>
                            <h4>
                                <a href={this.state.url}>Check Me Out!</a>
                            </h4>
                        </Card.Footer>
                    </Card>
                </Accordion>
            </Col>
        )
    }
}

class MessagePop extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = {
            modalShow: false,
            title: "",
            text: "",
            type: "warning"
        };
        this.getIcon = this.getIcon.bind(this);
        renderPop = renderPop.bind(this);
    }
    
    getIcon() {
        return "";
    }
    
    render() {
        const hide = () => this.setState({modalShow: false});
        return (
            <Modal show={this.state.modalShow} onHide={hide} size="lg" aria-labelledby="contained-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {this.getIcon()} {this.state.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        {this.state.text}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={hide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

class App extends React.Component 
{
    render()
    {
        api.getLocation();
        return (
            <article>
                <Navigation/>
                <Results/>
                <MessagePop/>
            </article>
        );
    }
}

export default App;
