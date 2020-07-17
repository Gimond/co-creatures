import React, {Component} from 'react';
import background from './background.jpg';

class Card extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false
        };
        this.canvasRef = React.createRef();
        this.backgroundImgRef = React.createRef();

        this.templates = {
            'modern': {
                width: 360,
                height: 600,
                padding: 20,
                smallSize: 10,
                caracSize: 20,
                textSize: 14,
                titleSize: 14,
                accentColor: '#df4a4a'
            }
        };
        this.template = this.templates[this.props.template];
    }

    componentDidMount() {
        this.ctx = this.canvasRef.current.getContext("2d");

        this.backgroundImgRef.current.onload = () => {
            this.ctx.drawImage(this.backgroundImgRef.current, 0, 0);
        }
    }

    render() {
        if (this.props.creature) {
            const creature = this.props.creature[0];
            let global_y = this.template.padding;
            // creature = <div>
            //     {JSON.stringify(this.props.creature)}
            //     {this.props.creature[0].id}
            //     {this.props.creature[0].nom}
            //     {((caracs) => {
            //         let rows = [];
            //         for (const carac in caracs) {
            //             rows.push(<div>{carac} : {caracs[carac]}</div>);
            //         }
            //         return rows;
            //     })(this.props.creature[0].caracteristiques)}
            // </div>;
            this.ctx.drawImage(this.backgroundImgRef.current, 0, 0);

            // NAME
            global_y = this.wrapText(creature.nom, this.template.padding, global_y, 22, 22, this.template.width - this.template.padding * 2 - 120);

            // DETAILS
            global_y += 25;
            let details = [];
            details.push('NC ' + creature.nc);
            // details.push('Milieu naturel : '+creature.milieu_naturel);
            // details.push('archétype '+creature.archetype.toLowerCase());
            details.push('créature ' + creature.categorie.toLowerCase());
            details.push('taille ' + creature.taille.toLowerCase());
            if (creature.rang_de_boss !== '') {
                details.push('Boss rang ' + creature.rang_de_boss);
            }
            this.ctx.font = this.template.smallSize + "px NexusSansOT";
            this.ctx.textAlign = "left";
            global_y = this.wrapText(details.join(', '), this.template.padding, global_y, this.template.smallSize, this.template.smallSize*1.3, this.template.width - this.template.padding * 2 - 120);

            // DEF, PV, Init
            this.displayCarac('DEF', creature.DEF, this.template.width - 120, this.template.padding - 5, 'white', 'white');
            this.displayCarac('PV', creature.PV, this.template.width - 75, this.template.padding - 5, 'white', 'white');
            this.displayCarac('Init', creature.init, this.template.width - 30, this.template.padding - 5, 'white', 'white');

            // CARACS
            let index = 1;
            global_y += 35;
            for (const carac in creature.caracteristiques) {
                let y = global_y;
                let x = (this.template.width) / 7 * index;
                let value = creature.caracteristiques[carac];
                value = parseInt(value);
                if (value >= 0) {
                    value = '+' + value;
                }
                this.displayCarac(' ' + carac + (creature.caracteristiques_superieures.indexOf(carac) !== -1 ? '*' : ' '), value, x, y);
                index++;
            }
            global_y += 20;

            // ATQ
            if (creature.attaques.length) {
                global_y += 35;
                this.displayTitle('Attaques', this.template.padding, global_y);
                for (let atq in creature.attaques) {
                    if (atq) {
                        global_y += 20;
                        global_y = this.wrapText(creature.attaques[atq], this.template.padding, global_y, this.template.textSize, 20);
                    }
                }
            }

            // VOIES

            // CAPS
            if (creature.capacites_speciales !== '') {
                global_y += 30;
                this.displayTitle('Capacités', this.template.padding, global_y);
                global_y += 20;
                global_y = this.wrapText(creature.capacites_speciales, this.template.padding, global_y, this.template.textSize, 20);
            }

        } else {
            // this.ctx.font = "30px NexusSansOT";
            // this.ctx.textAlign = "center";
            // this.ctx.fillText("Sélectionnez une créature", 0, 20);
        }

        return (
            <div>
                <canvas ref={this.canvasRef} width={this.template.width} height={this.template.height}/>
                <img ref={this.backgroundImgRef} src={background} alt="" hidden/><br/>
                <a href="https://www.freepik.com/free-photos-vectors/background">Background photo created by aopsan - www.freepik.com</a>
            </div>
        );
    }

    displayTitle(text, x, y) {
        this.ctx.save();
        this.ctx.font = "bold " + this.template.titleSize + "px NexusSansOT";
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = this.template.accentColor;
        this.ctx.fillText(text.toUpperCase(), x, y);
        this.ctx.restore();
    }

    displayCarac(label, value, x, y, color_label, color_value) {
        if (!color_label) {
            color_label = this.template.accentColor;
        }
        if (!color_value) {
            color_value = "black";
        }
        this.ctx.save();
        this.ctx.font = "bold " + this.template.smallSize + "px NexusSansOT";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = color_label;
        this.ctx.fillText(label, x, y);
        this.ctx.font = this.template.caracSize + "px NexusSansOT";
        this.ctx.fillStyle = color_value;
        this.ctx.fillText(value, x, y + 12);
        this.ctx.restore();
        return y + 12;
    }

    wrapText(text, x, y, fontSize, lineHeight, maxWidth) {
        // strip tags
        text = text.replace(/(<([^>]+)>)/ig, "");

        if (!maxWidth) {
            maxWidth = this.template.width - this.template.padding * 2;
        }
        var words = text.split(' ');
        var line = '';
        if (!lineHeight) {
            lineHeight = fontSize * 1.286; // a good approx for 10-18px sizes
        }

        this.ctx.font = fontSize + "px NexusSansOT";
        this.ctx.textBaseline = 'top';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = this.ctx.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth) {
                this.ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, x, y);
        return y;
    }

    saveImg() {
        this.canvasRef.current.toDataURL();
    }
}

export default Card;