import React, { Component } from 'react';
import { TextField, CircularProgress } from '@mui/material';
import { Table, TableHead, TableCell, TableBody, TableRow } from '@mui/material';
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
                list = <TableRow><TableCell colSpan='2'><CircularProgress /></TableCell></TableRow>;
            } else {
                let filtered = items.filter(creature => this.state.filter === '' || creature.nom.toLowerCase().includes(this.state.filter.toLowerCase()));
                list = filtered.map(item => (
                    <TableRow key={item.id} onClick={this.handleCreatureClick.bind(this)} data-id={item.id} active={this.props.creature && this.props.creature.id === item.id} >
                        <TableCell align='center'>
                            {item.nc}
                        </TableCell>
                        <TableCell>
                            {/*<h4>*/}
                                {item.nom}<br />
                                {item.milieu_naturel}
                            {/*</h4>*/}
                        </TableCell>
                    </TableRow>
                ));
            }

            return (
                <div>
                    <TextField fullWidth icon='search' placeholder='Rechercher...' value={this.state.filter} type="text" onChange={this.handleFilterInputChange.bind(this)} />
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell width={2}>NC</TableCell>
                                <TableCell>Nom</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {list}
                        </TableBody>
                    </Table>
                </div>
            );
        }
    }
}

export default List;