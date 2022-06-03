import React, {Component} from 'react';
import List from './List.js';
import Card from './Card.js';
import StatBlock from './StatBlock.js';
import { apiCall } from './Helpers.js'

class Creatures extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            creature: null
        };
    }

    setCreature(id) {
        apiCall("https://co-api.gimond.fr/api/v1/creatures?id="+id).then((result) => {
            const creature = result[0];
            this.setState({
                isLoaded: true,
                creature: creature
            });
        });
    }

    setCreatureFromStatBlock(creature) {
        this.setState({
            isLoaded: true,
            creature: creature
        });
    }

    render() {
        return (
            <div>
                <header className="App-header">
                    Créatures
                </header>
                <div className="col left">
                    <StatBlock setCreatureFromStatBlock={this.setCreatureFromStatBlock.bind(this)} />
                    <List setCreature={this.setCreature.bind(this)} creature={this.state.creature} />
                </div>
                <div className="col right">
                    <Card template='modern' creature={this.state.creature} />
                </div>
            </div>
        );
    }
}

export default Creatures;