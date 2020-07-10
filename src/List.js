import React, { Component } from 'react';
import { Header, Table, Input } from 'semantic-ui-react'

class List extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: [],
            filter: ''
        };
    }

    componentDidMount() {
        var requestOptions = {
            method: 'GET',
            redirect: 'follow',
            headers: new Headers({
                'key': 'ylPI5rutd4MESz4l'
            })
        };

        fetch("https://co-api.gimond.fr/api/v1/creatures", requestOptions)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result
                    });
                },
                // Remarque : il est important de traiter les erreurs ici
                // au lieu d'utiliser un bloc catch(), pour ne pas passer à la trappe
                // des exceptions provenant de réels bugs du composant.
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            );
    }

    handleFilterInputChange(event) {
        this.setState({filter: event.target.value});
    }

    handleCreatureClick(event) {
        event.preventDefault();
        if (typeof this.props.setCreature === 'function') {
            this.props.setCreature(event.target.getAttribute('data-id'));
        }
    }

    render() {
        const { error, isLoaded, items } = this.state;
        if (error) {
            return <div>Erreur : {error.message}</div>;
        } else {
            let list = '';
            if (!isLoaded) {
                list = <Table.Row><Table.Cell>Chargement…</Table.Cell></Table.Row>;
            } else {
                let filtered = items.filter(creature => this.state.filter === '' || creature.nom.toLowerCase().includes(this.state.filter.toLowerCase()));
                list = filtered.map(item => (
                    <Table.Row key={item.id}>
                        <Table.Cell>
                            {item.nc}
                        </Table.Cell>
                        <Table.Cell>
                            <Header as='h4' image>
                                <Header.Content>
                                    <a href={item.url} onClick={this.handleCreatureClick.bind(this)} data-id={item.id}>{item.nom}</a>
                                    <Header.Subheader>{item.milieu_naturel}</Header.Subheader>
                                </Header.Content>
                            </Header>
                        </Table.Cell>
                    </Table.Row>
                ));
            }

            return (
                <div>
                    <Input icon='search' placeholder='Rechercher...' value={this.state.filter} type="text" onChange={this.handleFilterInputChange.bind(this)} />
                    <Table basic='very' celled collapsing>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>NC</Table.HeaderCell>
                                <Table.HeaderCell>Nom</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {list}
                        </Table.Body>
                    </Table>
                </div>
            );
        }
    }
}

export default List;