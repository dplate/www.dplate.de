import React, { useMemo, useState } from 'react';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import formatDate from '../utils/formatDate';

const Background = styled.div`
  position: fixed;
  z-index: 3;
  top: 0;
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
  top: 0;
  left: 0;
  height: 100%;
  width: 250px;
  background-color: #9ec1a3;
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
        background-color: #8eb193;
      }
    }

    > div > div {
      cursor: pointer;
      padding: 5px;

      &:hover {
        background-color: #8eb193;
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

const toggleSub = (item, forceUpdate) => {
  item.show = !item.show;
  forceUpdate();
};

const renderLink = (item, onClose) => {
  return (
    <Link to={item.path} className={item.selected ? 'selected' : ''} onClick={onClose}>
      {item.name}
    </Link>
  );
};

const renderSubTitle = (item, forceUpdate) => {
  const boundToggleSub = toggleSub.bind(null, item, forceUpdate);
  if (item.path) {
    return (
      <Link to={item.path} className={item.selected ? 'selected' : ''}>
        {item.name}
      </Link>
    );
  }
  return (
    <div
      className={item.selected ? 'selected' : ''}
      role="presentation"
      onClick={boundToggleSub}
      onKeyDown={boundToggleSub}
    >
      {item.name}
    </div>
  );
};

const renderSub = (item, forceUpdate, onClose) => {
  return (
    <div>
      {renderSubTitle(item, forceUpdate)}
      {item.show && renderItems(item.items, forceUpdate, onClose)}
    </div>
  );
};

const renderItem = (item, forceUpdate, onClose) => {
  return <li key={item.id}>{item.items ? renderSub(item, forceUpdate, onClose) : renderLink(item, onClose)}</li>;
};

const renderItems = (items, forceUpdate, onClose) => {
  return <ItemList>{items.map((item) => renderItem(item, forceUpdate, onClose))}</ItemList>;
};

const selectCurrentPath = (currentPath, items) => {
  const item = items.find((i) => {
    return i.path === currentPath || (i.items && selectCurrentPath(currentPath, i.items));
  });
  if (item) {
    item.selected = true;
    item.show = true;
    return true;
  }
  return false;
};

const createAlpineItem = (report) => {
  return {
    id: report.date,
    name: (
      <div>
        {report.type === 'hike' ? '☀' : '❄'} {report.shortTitle}
        <ItemDate>{formatDate(report.date)}</ItemDate>
      </div>
    ),
    path: `/alpine/${report.destination}/${report.date.substring(1)}`
  };
};

const createAlpineItems = (destinations, reports) => {
  return destinations.map((destination) => ({
    id: destination.destination,
    name: destination.name,
    path: `/alpine/${destination.destination}`,
    items: reports
      .filter((report) => report.destination === destination.destination)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(createAlpineItem)
  }));
};

const createAlpine = (destinations, reports) => {
  return {
    id: 'alpine',
    name: 'Alpinfunk',
    items: createAlpineItems(destinations, reports)
  };
};

const createItems = (destinations, reports, currentPath) => {
  const items = [
    {
      id: 'start',
      name: 'Start',
      path: '/'
    },
    createAlpine(destinations, reports),
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
          id: 'alpine-route',
          name: 'Alpine Route',
          path: '/games/alpine-route'
        },
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
  ];
  selectCurrentPath(currentPath, items);
  return items;
};

const forceUpdate = (items, setItems) => {
  setItems([...items]);
};

const Menu = ({ destinations, reports, currentPath, onClose }) => {
  const initialItems = useMemo(
    () => createItems(destinations, reports, currentPath),
    [destinations, reports, currentPath]
  );
  const [items, setItems] = useState(initialItems);

  return (
    <div>
      <MenuLayer>{renderItems(items, forceUpdate.bind(null, items, setItems), onClose)}</MenuLayer>
      <Background onClick={onClose} />
    </div>
  );
};

Menu.propTypes = {
  onClose: PropTypes.func.isRequired,
  reports: PropTypes.arrayOf(
    PropTypes.shape({
      destination: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      type: PropTypes.string,
      shortTitle: PropTypes.string.isRequired
    })
  ),
  destinations: PropTypes.arrayOf(
    PropTypes.shape({
      destination: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  currentPath: PropTypes.string.isRequired
};

export default Menu;
