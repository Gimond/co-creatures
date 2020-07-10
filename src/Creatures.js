import React, {Component} from 'react';
import List from './List.js';
import Card from './Card.js';

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
        var requestOptions = {
            method: 'GET',
            redirect: 'follow',
            headers: new Headers({
                'key': 'ylPI5rutd4MESz4l'
            })
        };

        fetch("https://co-api.gimond.fr/api/v1/creatures?id="+id, requestOptions)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        creature: result
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            );
    }

    render() {
        return (
            <div>
                <header className="App-header">
                    Créatures
                </header>
                <div className="col left">
                    <List setCreature={this.setCreature.bind(this)} />
                </div>
                <div className="col right">
                    <Card template={'modern'} creature={this.state.creature} />
                </div>
            </div>
        );
    }
}

export default Creatures;