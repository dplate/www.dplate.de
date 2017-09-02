import React from 'react'
import Link from 'gatsby-link'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import formatDate from '../utils/formatDate'

const Background = styled.div`
  position: fixed;
  z-index: 3;
  top: 0px;
  left: 250px;
  height: 100%;
  width: 100%;
  background-color: black;
  opacity: 0.5;
  cursor: pointer;
`;

const MenuLayer = styled.div`
  position: fixed;
  display: block;
  z-index: 3;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 250px;
  background-color: #9EC1A3;
  overflow: auto;
`;

const ItemList = styled.ul`
  list-style-type: none;
  padding-left: 10px;
  li {
    padding-top: 5px;
        
    > a {
      display: block;
      text-decoration: none;
      color: black;
      padding: 5px;
      &:hover {
        background-color: #8EB193;
      }
    }
    > div > div {
      cursor: pointer;
      padding: 5px;
      &:hover {
        background-color: #8EB193;
      }
    }
    .selected {
      font-weight: bold;
    }
  }
`;

const ItemDate = styled.div`
  font-style: italic;
  font-size: 12px;
`;

const destinationNames = {
  'airolo': 'Airolo',
  'alpstein': 'Alpstein',
  'alvier': 'Alvier',
  'andermatt': 'Andermatt',
  'arlberg': 'Arlberg',
  'brandnertal': 'Brandnertal',
  'boedele': 'Bödele',
  'damuels': 'Damüls',
  'davos': 'Davos',
  'disentis': 'Disentis',
  'flumserberg': 'Flumserberg',
  'fronalpstock': 'Fronalpstock',
  'gargellen': 'Gargellen',
  'grasgehren': 'Grasgehren',
  'hohekugel': 'Hohe Kugel',
  'hoher-freschen': 'Hoher Freschen',
  'ischgl': 'Ischgl',
  'kaunertal': 'Kaunertal',
  'laax': 'Laax',
  'laterns': 'Laterns',
  'lenzerheide': 'Lenzerheide-Arosa',
  'malbun': 'Malbun',
  'montafon': 'Silvretta-Montafon',
  'murgseen': 'Murgseen',
  'obersaxen': 'Obersaxen-Mundaun',
  'pizol': 'Pizol',
  'sankt-moritz': 'St. Moritz',
  'savognin': 'Savognin',
  'serfaus-fiss-ladis': 'Serfaus-Fiss-Ladis',
  'speer': 'Speer',
  'sulzfluh': 'Sulzfluh',
  'titlis': 'Titlis',
  'toggenburg': 'Toggenburg'
};

class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
    this.renderItem = this.renderItem.bind(this);
  }

  componentWillMount() {
    const items = this.createItems(this.props.reports);
    this.selectCurrentPath(this.props.currentPath, items);
    this.setState({items});
  }

  selectCurrentPath(currentPath, items) {
    const item = items.find((i) => {
      if (i.items) return this.selectCurrentPath(currentPath, i.items);
      else return i.path === currentPath;
    });
    if (item) {
      item.selected = true;
      item.show = true;
      return true;
    }
    return false;
  }

  renderLink(item) {
    return (
      <Link to={item.path} className={item.selected ? 'selected' : ''} onClick={this.props.onClose}>
        {item.name}
        </Link>
    )
  };

  toggleSub(item) {
    item.show = !item.show;
    this.forceUpdate();
  }

  renderSub(item) {
    return (
      <div>
        <div className={item.selected ? 'selected' : ''} onClick={this.toggleSub.bind(this, item)}>
          {item.name}
        </div>
        {item.show && this.renderItems(item.items)}
      </div>
    )
  }

  renderItem(item) {
    return (
      <li key={item.id}>
        {item.items ? this.renderSub(item) : this.renderLink(item)}
      </li>
    )
  }

  renderItems(items) {
    return (
      <ItemList>
        {items.map(this.renderItem)}
      </ItemList>
    )
  }

  createAlpineItem(report) {
    return {
      id: report.date,
      name: <div>{report.shortTitle}<ItemDate>{formatDate(report.date)}</ItemDate></div>,
      path: `/alpine/${report.destination}/${report.date}`
    }
  }

  createAlpineItems(reports) {
    const items = [];
    reports.forEach((report) => {
      let item = items.find((i) => i.id === report.destination);
      if (!item) {
        item = {
          id: report.destination,
          name: destinationNames[report.destination],
          items: []
        };
        items.push(item);
      }
      item.items.push(this.createAlpineItem(report));
    });
    return items;
  }

  createAlpine(reports) {
    const sortedReports = reports.sort((a, b) => {
      if (a.destination !== b.destination) {
        return a.destination.localeCompare(b.destination);
      }
      return b.date.localeCompare(a.date);
    });
    return {
      id: 'alpine',
      name: 'Alpinfunk',
      items: this.createAlpineItems(sortedReports)
    }
  }

  createItems(reports) {
    return [
      {
        id: 'start',
        name: 'Start',
        path: '/'
      },
      this.createAlpine(reports),
      {
        id: 'showcase',
        name: 'Photolabor',
        path: '/showcase'
      },
      {
        id: 'games',
        name: 'Spielzimmer',
        items: [
          {
            id: 'schiffbruch',
            name: 'Schiffbruch',
            path: '/games/schiffbruch'
          },
          {
            id: 'cannonhill',
            name: 'Cannonhill',
            path: '/games/cannonhill'
          },
          {
            id: 'modracer',
            name: 'Modracer',
            path: '/games/modracer'
          },
          {
            id: 'ancient',
            name: 'Antike Spiele',
            path: '/games/ancient'
          }
        ]
      },
      {
        id: 'tools',
        name: 'Werkzeugschuppen',
        items: [
          {
            id: 'scapemaker',
            name: 'ScapeMaker',
            path: '/tools/scapemaker'
          },
          {
            id: 'kensentme',
            name: 'KenSentMe',
            path: '/tools/kensentme'
          }
        ]
      },
      {
        id: 'impressum',
        name: 'Impressum',
        path: '/impressum'
      }
    ]
  }

  render() {
    return (
      <div>
        <MenuLayer>
          {this.renderItems(this.state.items)}
        </MenuLayer>
        <Background onClick={this.props.onClose} />
      </div>
    )
  }
}

Menu.propTypes = {
  onClose: PropTypes.func.isRequired,
  reports: PropTypes.arrayOf(PropTypes.shape({
    destination: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    shortTitle: PropTypes.string.isRequired
  })),
  currentPath: PropTypes.string.isRequired
};

export default Menu;


