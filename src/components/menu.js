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
        
    a {
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

class Menu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      items: []
    };
    this.renderItem = this.renderItem.bind(this);
  }

  componentWillMount() {
    const items = this.createItems(this.props.destinations, this.props.reports);
    this.selectCurrentPath(this.props.currentPath, items);
    this.setState({items});
  }

  selectCurrentPath(currentPath, items) {
    const item = items.find((i) => {
      return i.path === currentPath || (i.items && this.selectCurrentPath(currentPath, i.items));
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

  renderSubTitle(item) {
    if (item.path) {
      return (
        <Link to={item.path} className={item.selected ? 'selected' : ''} onClick={this.toggleSub.bind(this, item)}>
          {item.name}
        </Link>
      );
    }
    return (
      <div className={item.selected ? 'selected' : ''} onClick={this.toggleSub.bind(this, item)}>
        {item.name}
      </div>
    );
  }

  renderSub(item) {
    return (
      <div>
        {this.renderSubTitle(item)}
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
      name: <div>{report.type === 'hike' ? '☀' : '❄'} {report.shortTitle}<ItemDate>{formatDate(report.date)}</ItemDate></div>,
      path: `/alpine/${report.destination}/${report.date.substring(1)}`
    }
  }

  createAlpineItems(destinations, reports) {
    return destinations.map((destination) => ({
      id: destination.destination,
      name: destination.name,
      path: `/alpine/${destination.destination}`,
      items: reports
        .filter((report) => report.destination === destination.destination)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(this.createAlpineItem)
    }));
  }

  createAlpine(destinations, reports ) {
    return {
      id: 'alpine',
      name: 'Alpinfunk',
      items: this.createAlpineItems(destinations, reports)
    }
  }

  createItems(destinations, reports) {
    return [
      {
        id: 'start',
        name: 'Start',
        path: '/'
      },
      this.createAlpine(destinations, reports),
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
            id: 'draw-a-mountain',
            name: 'Draw-A-Mountain',
            path: '/games/draw-a-mountain'
          },
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
        name: 'Impressum / Datenschutz',
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
    type: PropTypes.string,
    shortTitle: PropTypes.string.isRequired,
  })),
  destinations: PropTypes.arrayOf(PropTypes.shape({
    destination: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })),
  currentPath: PropTypes.string.isRequired
};

export default Menu;


