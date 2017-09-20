/*******************************************************************************************************
 * This file contains the ShowBars Class and supporting classes. It's job is to make an AJAX call to the
 * server to get list of bars for the selected location and display it. It also processes the "RSVP"
 * button via another AJAX call. ShowBars is statefull, the other classes are stateless.
 *******************************************************************************************************/

"use strict";

import React from 'react';
import getBaseUrl from "./getBaseUrl";
import  { Router,
    Route,
    IndexRoute,
    IndexLink,
    hashHistory,
    Link } from 'react-router';

class ErrorMess extends React.Component{
    constructor(props) {
        super(props);
    }
    render(){
        return(
            <div className="container-fluid text-center">
             <h2>{this.props.message}</h2>
            </div>
        )
    }
}

 class GoingLabel extends React.Component{
    constructor(props) {
        super(props);
    }

     getGoing(business){
         if(sessionStorage.getItem("loggedIn") == "false")
             return "Not Going";

         return business.votes.find(element => element == sessionStorage.getItem("loginName")) ?
             "Going" : "Not Going";
     }

     render() {
         if (sessionStorage.getItem("loggedIn") == "false")
             return null;

         let business = this.props.business;
         let going = this.getGoing(business);

         if (going == "going")
             return (
                 <span className="label label-success label-cls">{going}</span>
             );
         else
             return (
                 <span className="label label-danger label-cls">{going}</span>
             );

     }

}

class VotesLabel extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        let business = this.props.business;

        if(business.votes.length == 0)
            return <span className="label  label-danger">{business.votes.length} Going</span>;
        else
            return <span className="label  label-success">{business.votes.length} Going</span>

    }
}

class RSVPbutton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if(sessionStorage.getItem("loggedIn") == "true")
            return(
                    <button className="btn btn-default" type="button"
                    value={this.props.i} onClick={this.props.onRSVPclick}>RSVP</button>
            );
        else
            return null;
    }
}

class BarCell extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const imgStyle = {
            width: '100px',
            height: "100px",
            marginBottom: "10px"
        };

        let i = this.props.i;
        let businesses = this.props.bars.businesses;

        if (i >= businesses.length)
            return null;

        return(
            <div className="col-md-4">
                <div className="thumbnail">
                    <div className="text-center">
                        <h4> {businesses[i].name}</h4>
                    </div>
                    <img src={businesses[i].imageURL} style={imgStyle}></img>
                    <div className="text-center">
                        <RSVPbutton onRSVPclick={this.props.onRSVPclick} i={i}/>
                        <GoingLabel business={businesses[i]}/>
                        <VotesLabel business={businesses[i]}/>
                    </div>
                </div>
            </div>
        );
    }
}

class BarRow extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <div className="container">
                <div className="row">
                    <BarCell bars={this.props.bars} i={this.props.i} onRSVPclick={this.props.onRSVPclick}/>
                    <BarCell bars={this.props.bars} i={this.props.i + 1} onRSVPclick={this.props.onRSVPclick}/>
                    <BarCell bars={this.props.bars} i={this.props.i + 2} onRSVPclick={this.props.onRSVPclick}/>
                </div>
            </div>
        );
    }
}

class PageAnchor extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        if(this.props.i == this.props.thisPage)
            return (<span>{this.props.i + 1 + " "}</span>);

        return(
            <Link to={"/showBars/" + this.props.location + "/" + this.props.i}>
                {this.props.i + 1 + " "}</Link>
        );

    }
}

class PageNav extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        if(this.props.bars == null)
            return null;

        let anchors=[];
        let tot = Math.min(this.props.bars.total, 1000);
        let numPages = Math.ceil(tot / this.props.numPerPage);

        if(numPages == 1)
            return null;

        for(let i = 0; i < numPages; i++){
            anchors.push(<PageAnchor key={i} i={i} thisPage={this.props.thisPage}
                location={this.props.location}/>);
        }

        return (
            <div className="container text-center">
                {anchors}
            </div>
        );
    }
}

export default class ShowBars extends React.Component {
    constructor(props) {
        super(props);

        this.getBarsCallback = this.getBarsCallback.bind(this);
        this.onRSVPclick = this.onRSVPclick.bind(this);
        this.rsvpCallback = this.rsvpCallback.bind(this);
        this.state = {
            bars: null,
            getStatus: null,
            page: this.props.params.offset,
            location: this.props.params.location
        };
        this.httpRequest = null;
        this.getBarURL = getBaseUrl() + "bars/";
        this.rsvpURL = getBaseUrl() + "rsvp/";
        this.busIdx = null;
        this.getBars();
    }

    getBars(){
        this.httpRequest = new XMLHttpRequest();
        this.httpRequest.onreadystatechange = this.getBarsCallback;
        this.httpRequest.open("GET", this.getBarURL + this.props.params.location + "/50/" +
            this.props.params.offset * 50);
        this.httpRequest.send();
    }

    getBarsCallback() {
        try {
            if (this.httpRequest.readyState === XMLHttpRequest.DONE) {
                if (this.httpRequest.status === 200) {
                    let bars = JSON.parse(this.httpRequest.responseText);

                    this.setState({
                        bars: bars
                    });

                    if(!bars.hasOwnProperty("total")){
                        this.setState({
                            getStatus: "failed",
                            errorMess: "No Bars Found For This Location"
                        });
                    }else{
                        this.setState({getStatus: "ok"});
                    }
                } else {
                    this.setState({
                        getStatus: "failed",
                        errorMess: "Request Failed -- Response Code = " + this.httpRequest.status
                    });
                }
            }
        }
        catch (e) {
            this.setState({
                saveState: "failed",
                errorMess: "Caught Exception: " + e.message
            });
        }
    }

    onRSVPclick(e){
        this.busIdx = e.target.value;
        let business = this.state.bars.businesses[e.target.value].name;
        let login = sessionStorage.getItem("loginName");
        this.httpRequest = new XMLHttpRequest();
        this.httpRequest.onreadystatechange = this.rsvpCallback;
        this.httpRequest.open("PUT", this.rsvpURL + business + "/" + login);
        this.httpRequest.send();

    }

    rsvpCallback(){
        try{
            if (this.httpRequest.readyState === XMLHttpRequest.DONE) {
                if (this.httpRequest.status === 200) {
                    let resp = JSON.parse(this.httpRequest.responseText);
                    let bars = this.state.bars;
                    bars.businesses[this.busIdx].votes = resp.votes;
                    this.setState({bars: bars});
                } else {
                    this.setState({
                        getStatus: "failed",
                        errorMess: "Request Failed -- Response Code = " + this.httpRequest.status
                    });
                }
            }
        }
        catch (e) {
            this.setState({
                saveState: "failed",
                errorMess: "Caught Exception: " + e.message
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState){

        if(this.state.page == this.props.params.offset &&
            this.state.location == this.props.params.location) {
            return true;
        }

        this.setState({
            bars: null,
            getStatus: null,
            page: this.props.params.offset,
            location: this.props.params.location
        });

        this.getBars();
        return false;
    }

    render() {
        switch(this.state.getStatus){
            case "ok":
                const divStyle = {
                    width: '100px',
                    height: "100px"
                };

                if(!this.state.bars)
                    return null;

                let rows = [];

                for(let i = 0, key = 0; i < this.state.bars.businesses.length; i += 3, key++)
                    rows.push( <BarRow bars={this.state.bars} i={i} key={key}
                                       onRSVPclick={this.onRSVPclick}/>);

                return (
                    <div>
                        <PageNav bars={this.state.bars} numPerPage={50}
                                 thisPage={this.props.params.offset}
                                 location={this.props.params.location}/>
                    {rows}
                    </div>
            );
                break;
            case "failed":
                return (<ErrorMess message={this.state.errorMess}/>);
                break;
            default:
                return null;
        }
    }
}
