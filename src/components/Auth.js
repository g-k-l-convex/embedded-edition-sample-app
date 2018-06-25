import React from 'react'
import {
    BrowserRouter as Router,
    Route,
    Link,
    Redirect,
    withRouter
} from 'react-router-dom'

import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const auth = {
    isAuthenticated: false,

    authenticate(cb) {
        fetch('/user', {
            credentials: 'include'
        })
            .then((res) => {
                this.isAuthenticated = true
                if (typeof cb === 'function') {
                    cb(res.json().user);
                }
            })
            .catch((err) => {
                console.log('Error fetching authorized user.');
            });
    },

    signout(cb) {
        fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        })
            .then((res) => {
                this.isAuthenticated = false;
                if (typeof cb === 'function') {
                    // user was logged out
                    cb(true);
                }
            })
            .catch((err) => {
                console.log('Error logging out user.');
                if (typeof cb === 'function') {
                    // user was not logged out
                    cb(false);
                }
            });
    }
}

export const AuthButton = withRouter(({history}) => (
    auth.isAuthenticated ? (
        <p>
            Welcome! <button onClick={() => {
            auth.signout(() => history.push('/'))
        }}>Sign out</button>
        </p>
    ) : (
        <p>You are not logged in.</p>
    )
))

export const PrivateRoute = ({component: Component, ...rest}) => (
    <Route {...rest} render={props => (
        auth.isAuthenticated ? (
            <Component {...props}/>
        ) : (
            <Redirect to={{
                pathname: '/login',
                state: {from: props.location}
            }}/>
        )
    )}/>
)

export const Public = () => <h3>Public</h3>
export const Protected = () => <h3>Protected</h3>

export class Login extends React.Component {
    state = {
        redirectToReferrer: false
    }

    login = (data) => {
        console.log('Logging in ' + data.username);
        fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then((response) => {
                if (response.status === 200) {
                    auth.authenticate(() => {
                        this.setState({redirectToReferrer: true})
                    });
                } else {
                    alert('Could not log in');
                }
            })
            .catch((err) => {
                console.log('Error logging in.', err);
            });
    }

    render() {
        const {from} = this.props.location.state || {from: {pathname: '/'}};
        const {redirectToReferrer} = this.state;

        if (redirectToReferrer) {
            return (
                <Redirect to={from}/>
            );
        }

        return (
            <div>
                <p>You must log in to view the page at {from.pathname}</p>
                <LoginForm onLogin={this.login}/>
            </div>
        );
    }
}

export class Register extends React.Component {
    state = {
        redirectToReferrer: false,
        error: false,
        success: false,
    }

    showError = () => this.setState({
        error: true
    });


    register = (data) => {
        fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
            .then((response) => {
                if (response.ok) {

                    this.setState({
                        success: true
                    })

                    setTimeout(() => {
                        window.location = '/login';
                    }, 3000);
                } else {
                    this.showError();
                }
            })
            .catch((err) => {
                this.showError();
            });
    }

    explain = 'This will create a new in-memory user account in the local Express backend that will persist until the backend is restarted.';

    render() {
        return (
            <div>
                <h1 style={{textAlign: 'center'}}>Register a New User</h1>
                <div style={{
                    textAlign: 'center',
                    width: '500px',
                    margin: 'auto',
                    paddingBottom: '10px'
                }}>{this.explain}</div>

                {this.state.error ? <h3 style={{color: "red", textAlign: "center"}}>Registration failed</h3> : ""}
                {this.state.success ? <h3 style={{color: "green", textAlign: "center"}}>Registration success</h3> : ""}
                <RegisterForm onRegister={this.register}/>
            </div>
        )
    }
}

