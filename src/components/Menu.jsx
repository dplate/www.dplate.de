import React, { useState } from 'react';
import Link from './Link.jsx';
import PropTypes from 'prop-types';
import styles from './Menu.module.css';

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
  return     <ul className={styles.itemList}>{items.map((item) => renderItem(item, forceUpdate, onClose))}    </ul>;
};

const forceUpdate = (items, setItems) => {
  setItems([...items]);
};

const Menu = ({ menuData, currentPath, onClose }) => {
  const [items, setItems] = useState(menuData);

  return (
    <div>
      <div className={styles.menuLayer}>{renderItems(items, forceUpdate.bind(null, items, setItems), onClose)}</div>
      <div className={styles.background} onClick={onClose} />
    </div>
  );
};

Menu.propTypes = {
  onClose: PropTypes.func.isRequired,
  menuData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      path: PropTypes.string,
      items: PropTypes.array,
      selected: PropTypes.bool,
      show: PropTypes.bool
    })
  ),
  currentPath: PropTypes.string.isRequired
};

export default Menu;
