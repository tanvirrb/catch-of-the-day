import React from 'react';

import Header from './Header';
import Order from './Order';
import Inventory from './Inventory';
import Fish from './Fish';
import sampleFishes from '../sample-fishes';
import base from '../base';

class App extends React.Component {
    constructor() {
        super();

        this.state = {
            fishes: {},
            order: {}
        };
    }

    componentWillMount() {
        this.ref = base.syncState(`${this.props.params.storeId}/fishes`
            , {
                context: this,
                state: 'fishes'
            });
        const localStorageRef = localStorage.getItem(`order-${this.props.params.storeId}`);

        if ( localStorageRef ) {
            this.setState({
                order: JSON.parse(localStorageRef)
            });
        }
    }

    componentWillUpdate(nextProps, nextState) {
        localStorage.setItem(`order-${this.props.params.storeId}`, JSON.stringify(nextState.order));
    }

    componentWillUnmount() {
        base.removeBinding(this.ref);
    }

    addFish = (fish) => {
        const fishes = { ...this.state.fishes };
        const timestamp = Date.now();
        fishes[ `fish-${timestamp}` ] = fish;

        this.setState({ fishes });
    };

    updateFish = (key, updatedFish) => {
        const fishes = { ...this.state.fishes };
        fishes[ key ] = updatedFish;
        this.setState({ fishes });

    };

    removeFish = (key) => {
        const fishes = { ...this.state.fishes };
        fishes[ key ] = null;
        this.setState({ fishes });
    };

    loadSamples = () => {
        this.setState({ fishes: sampleFishes });
    };

    addToOrder = (key) => {
        const order = { ...this.state.order };
        order[ key ] = order[ key ] + 1 || 1;
        this.setState({ order });
    };

    removeFromOrder = (key) => {
        const order = { ...this.state.order };
        delete order[ key ]
        this.setState({ order })
    };

    render() {
        return (
            <div className="catch-of-the-day">
                <div className="menu">
                    <Header tagline="Fresh seafood market"/>
                    <ul className="list-of-fish">
                        {Object
                            .keys(this.state.fishes)
                            .map(key => <Fish key={key} index={key} details={this.state.fishes[ key ]}
                                              addToOrder={this.addToOrder}/>)
                        }
                    </ul>
                </div>
                <Order
                    fishes={this.state.fishes}
                    order={this.state.order}
                    removeFromOrder={this.removeFromOrder}
                    params={this.props.params}
                />
                <Inventory
                    fishes={this.state.fishes}
                    addFish={this.addFish}
                    updateFish={this.updateFish}
                    removeFish={this.removeFish}
                    loadSamples={this.loadSamples}
                    storeId={this.props.params.storeId}
                />
            </div>
        )
    }
}

App.propTypes = {
    params: React.PropTypes.object.isRequired
};

export default App;