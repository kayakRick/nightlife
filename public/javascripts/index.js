/********************************************************************************************************
 * This is the main container for the nightlife app.
 * The App class serves as the parent container for the menu bar and the main part of the page. When the
 * location is selected, the page redirects to ShowBars
 ********************************************************************************************************/

"use strict";

import React from 'react';
import ReactDOM from 'react-dom';

import  { Router,
    Route,
    IndexRoute,
    IndexLink,
    hashHistory,
    Link } from 'react-router';

import MenuBar from './MenuBar';
import ShowBars from "./ShowBars";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.onAboutClick = this.onAboutClick.bind(this);
        this.onLocationClick = this.onLocationClick.bind(this);

        this.state = {
            loggedIn: this.getCookieValue("loggedIn") == "true",
            loginName: this.getCookieValue("name")
        };

        sessionStorage.setItem("loggedIn", this.state.loggedIn);
        sessionStorage.setItem("loginName", this.state.loginName);
    }

    componentWillMount(){
        if(sessionStorage.getItem("location"))
            this.props.router.push("/showBars/" + sessionStorage.getItem("location")
                + "/" + sessionStorage.getItem("offset"));
    }

    getCookieValue (sKey) {
        if (!sKey) {
            return null;
        }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    }

    onAboutClick(){
        bootbox.alert('Written by Rick Evans<br>Code is available ' + '' +
            '<a href="https://github.com/kayakRick/nightlife" target="_blank">Here</a>');
    }

    onLocationClick(){
        let rtr = this.props.router;
        bootbox.prompt({
            title: "Enter Your Location",
            inputType: 'text',
            callback: function (result) {
                let location = null;

                if (result && result.trim() != "") {
                    location = result.trim();
                    sessionStorage.setItem("location", location);
                    sessionStorage.setItem("offset", 0);
                    rtr.push("/showBars/" + location + "/0");
                }

            }
        });
    }

    render() {
        let currentLocation = sessionStorage.getItem("location");

        if(!currentLocation)
            currentLocation = "Please use menu to set a current location";

        return(<div>
            <MenuBar loggedIn={this.state.loggedIn} onAboutClick={this.onAboutClick}
                onLocationClick={this.onLocationClick}/>
            <div className="container-fluid text-center">
                <h1>Nightlife Coordination App</h1>
                <h2>Current Location: <span className="bright">{currentLocation}</span></h2>
            </div>
            {this.props.children}
        </div>);
    }
}

ReactDOM.render(
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            <Route path="showBars/:location/:offset" component={ShowBars}/>
        </Route>
    </Router>,
    document.getElementById("app"));
