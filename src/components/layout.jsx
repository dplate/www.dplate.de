import React, { useCallback, useEffect, useReducer, useState } from 'react';
import logoIcon from '../icons/logo.png';
import menuIcon from '../icons/menu.svg';
import styled from 'styled-components';
import { graphql, Link, useStaticQuery } from 'gatsby';
import Menu from './Menu.jsx';

const Header = styled.div`
  background-color: #cfe0c3;
  text-align: right;
  position: fixed;
  z-index: 2;
  top: -57px;
  left: 0;
  width: 100%;
  height: 57px;

  &.showHeader {
    top: 0;
  }

  transition: top 0.5s;

  a {
    color: black;

    :visited {
      color: black;
    }
  }
`;

const MenuButton = styled.div`
  display: inline-block;
  position: absolute;
  left: 20px;
  top: 17px;
  height: 24px;
  width: 24px;
  cursor: pointer;
  white-space: nowrap;
`;

const MenuText = styled.span`
  position: absolute;
  margin-left: 8px;
  @media (max-width: 420px) {
    display: none;
  }
`;

const Title = styled.div`
  display: inline-block;
  font-size: 25px;
  padding-right: 20px;
  position: relative;
  top: -11px;
`;

const Logo = styled.img`
  display: inline-block;
  position: relative;
  top: 5px;
  margin-right: 15px;
  width: auto;
  height: auto;
`;

const Content = styled.div`
  padding-top: 57px;
`;

const layoutQuery = graphql`
  query AllDynamicItems {
    allDestinationJson(filter: {}, sort: { name: ASC }) {
      edges {
        node {
          destination
          name
        }
      }
    }
    allReportJson(filter: {}, sort: { date: DESC }) {
      edges {
        node {
          destination
          date
          type
          shortTitle
        }
      }
    }
  }
`;

const Layout = (props) => {
  const [showHeader, setShowHeader] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = useCallback(() => {
    setShowMenu(!showMenu);
  }, [showMenu]);
  const [, handleScrolling] = useReducer((lastScrollY) => {
    if (window.scrollY === lastScrollY) {
      return;
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

  const data = useStaticQuery(layoutQuery);
  const reports = data.allReportJson.edges.map((element) => element.node);
  const destinations = data.allDestinationJson.edges.map((element) => element.node);

  return (
    <div>
      <Content>{props.children}</Content>
      <Header className={showHeader ? 'showHeader' : ''}>
        <MenuButton onClick={toggleMenu}>
          <img src={menuIcon} width="24px" height="24px" alt="Menü" />
          <MenuText>Menü</MenuText>
        </MenuButton>
        <Link to="/">
          <Title>www.dplate.de</Title>
          <Logo src={logoIcon} width="48px" height="48px" alt="" />
        </Link>
      </Header>
      {showMenu && (
        <Menu
          onClose={toggleMenu}
          reports={reports}
          destinations={destinations}
          currentPath={props.location.pathname}
        />
      )}
    </div>
  );
};

export default Layout;
