import React from 'react';

import AddFishForm from './AddFishForm'
import base from '../base';

class Inventory extends React.Component {

    constructor() {
        super();

        this.state = {
            uid: null,
            owner: null
        }
    }

    componentDidMount() {
        base.onAuth((user) => {
            this.authHandler(null, { user });
        })
    }

    handleChange = (e, key) => {
        const fish = this.props.fishes[ key ];
        const updatedFish = {
            ...fish,
            [ e.target.name ]: e.target.value
        };
        this.props.updateFish(key, updatedFish);

    };

    authenticate = (provider) => {
        console.log(`Trying to login with ${provider}`);
        base.authWithOAuthPopup(provider, this.authHandler);
    };

    logout = () => {
        base.unauth();
        this.setState({ uid: null })
    };

    authHandler = (err, authData) => {
        console.log(authData);
        if ( err ) {
            console.log(err);
            return;
        }

        const storeRef = base.database().ref(this.props.storeId);
        storeRef.once('value', (snapshot) => {
            const data = snapshot.val() || {};

            if ( !data.owner ) {
                storeRef.set({
                    owner: authData.user.uid
                })
            }

            this.setState({
                uid: authData.user.uid,
                owner: data.owner || authData.user.uid
            })
        });
    };

    renderLogin = () => {
        return (
            <nav className="login">
                <h2>Inventory</h2>
                <p>Sign in to manage your store's inventory</p>
                <button className="facebook" onClick={() => this.authenticate('facebook')}>Login with Facebook</button>
                <button className="twitter" onClick={() => this.authenticate('twitter')}>Login with Twitter</button>

            </nav>
        )
    };

    renderInventory = (key) => {
        const fish = this.props.fishes[ key ];
        return (
            <div className="fish-edit" key={key}>
                <input type="text" name="name" value={fish.name} onChange={(e) => this.handleChange(e, key)}
                       placeholder="Fish name"/>
                <input type="text" name="price" value={fish.price} onChange={(e) => this.handleChange(e, key)}
                       placeholder="Fish price"/>
                <select type="text" name="status" value={fish.status} onChange={(e) => this.handleChange(e, key)}
                        placeholder="Fish status">
                    <option value="available">Fresh!</option>
                    <option value="unavailable">Sold Out!</option>
                </select>
                <textarea name="desc" value={fish.desc} onChange={(e) => this.handleChange(e, key)}
                          placeholder="Fish desc"></textarea>
                <input type="text" name="image" value={fish.image} onChange={(e) => this.handleChange(e, key)}
                       placeholder="Fish image"/>
                <button onClick={() => this.props.removeFish(key)}>Remove Fish!</button>
            </div>
        )
    };

    render() {
        const logout = <button onClick={this.logout}>Log Out</button>;
        if ( !this.state.uid ) {
            return <div>{this.renderLogin()}</div>
        }

        if ( this.state.uid !== this.state.owner ) {
            return (
                <div>
                    <p>Sorry, you're not the owner of this store.</p>
                    {logout}
                </div>
            )
        }
        return (
            <div>
                <h2>Inventory</h2>
                {logout}
                {Object.keys(this.props.fishes).map(this.renderInventory.bind(this))}
                <AddFishForm addFish={this.props.addFish}/>
                <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
            </div>
        )
    }
}

Inventory.propTypes = {
    fishes: React.PropTypes.object.isRequired,
    loadSamples: React.PropTypes.func.isRequired,
    addFish: React.PropTypes.func.isRequired,
    updateFish: React.PropTypes.func.isRequired,
    removeFish: React.PropTypes.func.isRequired,
    storeId: React.PropTypes.string.isRequired
};

export default Inventory;