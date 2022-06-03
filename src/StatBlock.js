import React, {Component} from 'react';
import {Form, TextArea} from 'semantic-ui-react'

class StatBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statblock: 'Mandefer - Cuirasse du dragon\n' +
                'Boss rang 4\n' +
                'NC 8\n' +
                'FOR +4* DEX +0 CON +3\n' +
                'INT +2 SAG +0 CHA +0\n' +
                'DEF 25 PV 125 Init 10\n' +
                'Hache (2 attaque) +14 DM 2d6+13'
        };
        this.handleStatBlockChange = this.handleStatBlockChange.bind(this);
    }

    render() {
        return <Form><TextArea value={this.state.statblock} onChange={this.handleStatBlockChange.bind(this)}/></Form>;
    }

    buildRegexp(obj) {
        var res = "\\b(";
        var premier = true;
        for (var field in obj) {
            if (premier) {
                res += field;
                premier = false;
            } else {
                res += "|" + field;
            }
        }
        res += "|créature)\\b"; //pour la version accentuée
        return new RegExp(res, 'gi');
    }

    handleStatBlockChange(event) {
        const statBlock = event.target.value;
        this.setState({statblock: statBlock});
        let attributes = this.parseStatBlock(statBlock);
        if (typeof this.props.setCreatureFromStatBlock === 'function') {
            this.props.setCreatureFromStatBlock(attributes);
        }
    }

    parseStatBlock(statBlock) {
        var maxAttack = 0;
        var statsReconnues = {
            for: 'FOR',
            dex: 'DEX',
            con: 'CON',
            int: 'INT',
            sag: 'SAG',
            per: 'SAG',
            cha: 'CHA',
            creature: 'profil',
            nc: 'nc',
            niveau: 'nc',
            taille: 'taille',
            profil: 'profil',
            init: 'init',
            def: 'DEF',
            pv: 'PV',
            rd: 'RD',
        };
        var patternStats = this.buildRegexp(statsReconnues);

        if (statBlock === '') {
            return;
        }
        let stats = statBlock.replace(/\r/g, '');
        //On enlève les caractères images des dernières versions de COF
        stats = stats.replace(/\ue1e9/g, ''); //DEF
        stats = stats.replace(/♥/g, ''); //PV
        stats = stats.replace(/\ue0bf/g, ''); //Attaque
        // stats = stats.replace(/\, /g, ' ');
        var rows = stats.split(/\n/);
        var newAttrs = {};
        var previousLine = ''; //Au cas d'attaque sur plusieurs lignes
        var previousContainsDM = false;
        var lastPrefix = ''; //Pour les suites d'attaque sur la ligne suivante
        var firstLine = true; //si la première ligne ne correspond à rien, c'est le nom
        rows.forEach(function (row) {
            if (row === '') {
                previousLine = '';
                lastPrefix = '';
                firstLine = false;
                previousContainsDM = false;
                return;
            }
            row = row.trim();
            if (row.endsWith('DM')) {
                previousLine += row + ' ';
                previousContainsDM = true;
            } else if (previousContainsDM || row.search(/\bDM\b/i) >= 0) { //Attaque
                var currentRow = previousLine + row;
                var nomAttaqueFin = currentRow.search(/\s(\+\d+|0\b|DM)/i);
                var nomAttaque = currentRow.substring(0, nomAttaqueFin);
                var portee = /\(\d+\s*m\)/i.exec(nomAttaque);
                if (portee) {
                    nomAttaque = nomAttaque.substring(0, portee.index).trim();
                    portee = parseInt(portee[0].substring(1));
                    if (isNaN(portee)) portee = 0;
                }
                currentRow = currentRow.substring(nomAttaqueFin).trim();
                var bonusAtt = 0;
                if (currentRow.startsWith('+')) {
                    currentRow = currentRow.substring(1);
                    bonusAtt = parseInt(currentRow);
                    if (isNaN(bonusAtt)) {
                        console.log("Sheet worker: bonus d'attaque incorrect " + row);
                        previousLine = '';
                        return;
                    }
                    currentRow = currentRow.substring(currentRow.search(/\D/));
                } else if (currentRow.startsWith('0')) {
                    currentRow = currentRow.substring(1).trim();
                }
                var index = currentRow.search(/\bDM\b/i);
                var specAtt = currentRow.substring(0, index);
                currentRow = currentRow.substring(index + 3).trim();
                index = currentRow.search(/\s/);
                if (index < 0) {
                    index = currentRow.length;
                }
                var nbDe = 0;
                var de = 4;
                var bonusDM = 0;
                var dmExpr = currentRow.substring(0, index);
                var indexDe = dmExpr.search(/d/i);
                if (indexDe < 0) {
                    bonusDM = parseInt(dmExpr);
                    if (isNaN(bonusDM)) {
                        console.log("Impossible de trouver les DM dans " + row);
                        previousLine += row + ' ';
                        previousContainsDM = true;
                        return;
                    }
                } else {
                    nbDe = parseInt(dmExpr.substring(0, indexDe));
                    dmExpr = dmExpr.substring(indexDe + 1);
                    de = parseInt(dmExpr);
                    if (isNaN(bonusDM) || isNaN(de)) {
                        console.log("Impossible de trouver les DM dans " + row);
                        previousLine += row + ' ';
                        previousContainsDM = true;
                        return;
                    }
                    var indexBonusDM = dmExpr.search(/(\+|-)/);
                    if (indexBonusDM >= 0) {
                        bonusDM = parseInt(dmExpr.substring(indexBonusDM));
                        if (isNaN(bonusDM)) {
                            bonusDM = 0;
                        }
                    } else if (index > 0 && index < currentRow.length - 1) {
                        currentRow = currentRow.substring(index).trim();
                        index = 0;
                        if (currentRow.startsWith('+') || currentRow.startsWith('-')) {
                            bonusDM = parseInt(currentRow);
                            if (isNaN(bonusDM)) {
                                bonusDM = 0;
                            } else index = currentRow.search(/\s/);
                        }
                    }
                }
                if (index >= 0 && index < currentRow.length - 1) {
                    specAtt += currentRow.substring(index).trim();
                }

                var prefix = 'repeating_pnjatk_' + Math.random() + '_arme';
                maxAttack++;
                // newAttrs[prefix + 'label'] = maxAttack;
                // newAttrs[prefix + 'nom'] = nomAttaque;
                // newAttrs[prefix + 'atk'] = bonusAtt;
                // newAttrs[prefix + 'dmnbde'] = nbDe;
                // newAttrs[prefix + 'dmde'] = de;
                // newAttrs[prefix + 'dm'] = bonusDM;
                // newAttrs[prefix + 'spec'] = specAtt;
                // if (portee) newAttrs[prefix + 'portee'] = portee;

                if (!newAttrs.attaques) {
                    newAttrs.attaques = [];
                }
                newAttrs.attaques.push(
                    nomAttaque + ' +' + bonusAtt + ' DM ' + nbDe + 'd' + de + (bonusDM ? '+' + bonusDM : '') + ' ' + specAtt
                );

                lastPrefix = prefix;
                previousContainsDM = false;
                previousLine = '';
            } else if (row.startsWith('+') && lastPrefix !== '') {
                newAttrs[lastPrefix + 'spec'] += row;
            } else { //Pas attaque
                lastPrefix = '';
                var lexemes = [];
                var lastMatch;
                var match = patternStats.exec(row);
                while (match) {
                    if (lastMatch) {
                        lexemes.push({
                            match: lastMatch,
                            end: match.index
                        });
                    }
                    lastMatch = match;
                    match = patternStats.exec(row);
                }
                if (lastMatch) {
                    lexemes.push({
                        match: lastMatch,
                        end: row.length
                    });
                }
                if (lexemes.length === 0) {
                    if (firstLine) {
                        newAttrs.nom = row;
                    } else {
                        console.log("La ligne " + row + " ne correspond à rien");
                        previousLine = row + ' ';
                    }
                } else previousLine = '';
                lexemes.forEach(function (l) {
                    var lstat = l.match[0].toLowerCase();
                    var lattr = statsReconnues[lstat];
                    if (lattr === undefined && lstat === 'créature') lattr = statsReconnues.creature;
                    if (lattr === undefined) {
                        console.log("Erreur ! Pattern " + lstat + " non reconne. La ligne était " + l);
                        return;
                    }
                    var valAttr = row.substring(l.match.index + lstat.length, l.end).trim();
                    valAttr = valAttr.replace(/\)$/, '');
                    console.log(lattr);
                    if (lattr.search(/(FOR|DEX|CON|SAG|INT|CHA)/) !== -1) {
                        if (valAttr.endsWith('*')) {
                            valAttr = valAttr.substr(0, valAttr.length - 1);
                            if (!newAttrs.caracteristiques_superieures) {
                                newAttrs.caracteristiques_superieures = [];
                            }
                            newAttrs.caracteristiques_superieures.push(lattr);
                        }
                        //cas où le statblock donne valeur/bonus
                        var caracSlash = valAttr.indexOf('/');
                        if (caracSlash > 0) {
                            // var caracVal = parseInt(valAttr);
                            valAttr = parseInt(valAttr.substring(caracSlash + 1));
                        } else {
                            valAttr = parseInt(valAttr);
                        }
                        if (!newAttrs.caracteristiques) {
                            newAttrs.caracteristiques = [];
                        }
                        newAttrs.caracteristiques[lattr] = valAttr;
                    } else if (lattr === 'pnj_pv_max') {
                        //On met aussi les pv courants à jour
                        var pvMax = parseInt(valAttr);
                        //Cas où on note entre parenhèse les PV courants
                        var caracParen = valAttr.indexOf('(');
                        if (caracParen > 0) {
                            var pvCourant = parseInt(valAttr.substring(caracParen + 1));
                            newAttrs.PV = pvCourant;
                            valAttr = valAttr.substring(0, caracParen).trim();
                        } else newAttrs.PV = pvMax;
                    }
                    newAttrs[lattr] = valAttr;
                });
            }
            firstLine = false;
        });
        newAttrs.max_attack_label = maxAttack;

        return newAttrs;
    }
}

export default StatBlock;