import React, { useCallback, useEffect, useReducer, useState } from 'react';
import logoIcon from '../icons/logo.png?url';
import menuIcon from '../icons/menu.svg?url';
import styles from './Layout.module.css';
import Link from './Link.jsx';
import Menu from './Menu.jsx';

const Layout = (props) => {
  const { children, menuData = [], location = { pathname: '/' } } = props;
  const [showHeader, setShowHeader] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  
  const toggleMenu = useCallback(() => {
    setShowMenu(!showMenu);
  }, [showMenu]);
  
  const [, handleScrolling] = useReducer((lastScrollY) => {
    if (window.scrollY === lastScrollY) {
      return lastScrollY;
    }
    setShowHeader(window.scrollY < lastScrollY);
    return window.scrollY;
  }, 0);

  useEffect(() => {
    window.addEventListener('scroll', handleScrolling);
    return () => {
      window.removeEventListener('scroll', handleScrolling);
    };
  }, []);

  return (
    <div>
      <div className={styles.content}>{children}</div>
      <div className={`${styles.header} ${showHeader ? 'showHeader' : ''}`}>
        <div className={styles.menuButton} onClick={toggleMenu}>
          <img src={menuIcon} width="24px" height="24px" alt="Menü" />
          <span className={styles.menuText}>Menü</span>
        </div>
        <Link to="/">
          <div className={styles.title}>www.dplate.de</div>
          <img className={styles.logo} src={logoIcon} width="48px" height="48px" alt="" />
        </Link>
      </div>
      {showMenu && (
        <Menu
          onClose={toggleMenu}
          menuData={menuData}
          currentPath={location.pathname}
        />
      )}
    </div>
  );
};

export default Layout;

