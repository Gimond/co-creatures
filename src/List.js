import React, { Component } from 'react';
import { Loader, Header, Table, Input } from 'semantic-ui-react'
import { apiCall } from './Helpers.js'

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
        apiCall('https://co-api.gimond.fr/api/v1/creatures').then((result) => {
            this.setState({
                isLoaded: true,
                items: result
            });
        });
    }

    handleFilterInputChange(event) {
        this.setState({filter: event.target.value});
    }

    handleCreatureClick(event) {
        event.preventDefault();
        if (typeof this.props.setCreature === 'function') {
            this.props.setCreature(event.currentTarget.getAttribute('data-id'));
        }
    }

    render() {
        const { error, isLoaded, items } = this.state;
        if (error) {
            return <div>Erreur : {error.message}</div>;
        } else {
            let list = '';
            if (!isLoaded) {
                list = <Table.Row><Table.Cell colSpan='2'><Loader inverted /></Table.Cell></Table.Row>;
            } else {
                let filtered = items.filter(creature => this.state.filter === '' || creature.nom.toLowerCase().includes(this.state.filter.toLowerCase()));
                list = filtered.map(item => (
                    <Table.Row key={item.id} onClick={this.handleCreatureClick.bind(this)} data-id={item.id} active={this.props.creature && this.props.creature[0].id === item.id} >
                        <Table.Cell>
                            {item.nc}
                        </Table.Cell>
                        <Table.Cell>
                            <Header as='h4'>
                                <Header.Content>
                                    {item.nom}
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
                    <Loader inverted />
                    <Table basic='very' celled collapsing selectable>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell width={2}>NC</Table.HeaderCell>
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