import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { JsonFormsState, getData} from '@jsonforms/core';
import { JsonFormsDispatch, JsonFormsReduxContext } from '@jsonforms/react';
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { Tabs, Tab } from '@material-ui/core';
import logo from './logo.svg';
import './App.css';
import {mapDispatchToControlProps } from '@jsonforms/core';
import { useCookies } from 'react-cookie';
import axios from "axios/index";

const styles = createStyles({
  container: {
    padding: '1em'
  },
  title: {
    textAlign: 'center',
    padding: '0.25em'
  },
  dataContent: {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '0.25em',
    backgroundColor: '#cecece',
    fontSize: '10px'
  },
  demoform: {
    margin: 'auto',
    padding: '1rem'
  }
});

export interface AppProps extends WithStyles<typeof styles> {
  dataAsString: string;
  estate: any;
};

const App = ({ estate, classes, dataAsString }: AppProps) => {
  const [tabIdx, setTabIdx] = useState(0);
  const [cookies, setCookie] = useCookies(['authtoken']);
  const [authtoken, setAuthtoken] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [buttonRefresh, setButtonRefresh ] = useState('');

  const BASE_URL = 'http://localhost:9000/1.0/collections';

  function handleTabChange(event: any, newValue: number) {
    setTabIdx(newValue);
  }

  function saveAuthToken(token: string) {
    if (token !== "") {
      setCookie('authtoken', token, {path: '/'});
      setAuthtoken(token);
    }
  }

  function onCreateCollection() {
    var data = JSON.parse(dataAsString);
    data.active = false;
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cookies.authtoken}` }

    axios.post(`${BASE_URL}`, data, {
      headers: headers
    })
    .then(function (response) {
      console.log(response);
      
    })
    .catch(function (error) {
      console.log(error);
    });

  }

  function onLoadCollection(collectionId: String) {
    if (collectionId === "" || collectionId === null) return;

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cookies.authtoken}` }

    axios.get(`${BASE_URL}/${collectionId}` , {
      headers: headers
    })
    .then(function (response) {
      let collection = response.data
      delete collection.looks;
      delete collection.designer
      estate.jsonforms.core.data = collection;
    })
    .catch(function (error) {
      console.log(error);
      if (error.response.status === 401 || error.response.status === 403) {
        cookies.authtoken = null;
        setAuthtoken(cookies.authtoken);
        alert("Refresh auth token");
      }
    });
  }

  return (
    <Fragment>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to JSON Forms with React</h1>
          <p className="App-intro">More Forms. Less Code.</p>
        </header>
      </div>

      <Tabs value={tabIdx} onChange={handleTabChange}>
        <Tab label="via Redux" />
      </Tabs>

      {tabIdx === 0 &&
        <Grid container justify={'center'} spacing={1} className={classes.container}>
          <Grid item sm={12}>
            <Typography
              variant={'h3'}
              className={classes.title} >
              Bound data
            </Typography>
            <div className={classes.dataContent}>
              <pre id="boundData">{dataAsString}</pre>
            </div>
          </Grid>
          <Grid item sm={12}>
          
            <br/>
            { authtoken !== "" && 
              <textarea rows={4} cols={100} onChange={event => saveAuthToken(event.target.value)} placeholder="Authorization Token"/>
            }
            <br/>
            <input onChange={event => onLoadCollection(event.target.value)} placeholder="Collection Id" /> <button onClick={event => setButtonRefresh(`refresh ${event.timeStamp}`)} > Load Collection </button>
            <br/>

            <Typography variant={'h3'} className={classes.title}>
              Rendered form
            </Typography>
            <div className={classes.demoform} id="form">
              <JsonFormsReduxContext>
                <JsonFormsDispatch />
              </JsonFormsReduxContext>
            </div>
          </Grid>
        </Grid>
      }
      { 
        <button onClick={() => onCreateCollection()}>
          Create Collection
        </button>
      }
    </Fragment>
  );
};

const mapStateToProps = (state: JsonFormsState) => {
  return { 
    dataAsString: JSON.stringify(getData(state), null, 2),
    estate: state
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToControlProps
  
)(withStyles(styles)(App));