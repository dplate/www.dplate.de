import React from 'react'
import logoIcon from '../icons/logo.png'
import menuIcon from '../icons/menu.svg'
import styled from 'styled-components'
import { graphql, Link, StaticQuery } from 'gatsby'
import Menu from '../components/menu'

const Header = styled.div`
  background-color: #CFE0C3;
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
  @media(max-width: 420px) {
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
  query AllDynamicItems{
    allDestinationJson(filter:{}, sort:{fields:[name], order:ASC }) {
      edges {
        node {
          destination, 
          name
        }
      }
    },
    allReportJson(filter:{}, sort:{fields:[date], order:DESC }) {
      edges {
        node {
          destination, 
          date, 
          type,
          shortTitle
        }
      }
    }
  }
`;

class Layout extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showHeader: true,
      showMenu: false,
      lastScrollY: 0
    };
    this.scrollHandler = this.scrollHandler.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  scrollHandler() {
    if (window.pageYOffset === this.state.lastScrollY) return;
    this.setState({
      showHeader: window.pageYOffset < this.state.lastScrollY,
      lastScrollY: window.pageYOffset
    });
  }

  toggleMenu() {
    this.setState({showMenu: !this.state.showMenu});
  }

  componentDidMount() {
    window.addEventListener('scroll', this.scrollHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  render() {
    return (
      <StaticQuery
        query={layoutQuery}
        render={data => {
          const reports = data.allReportJson.edges.map((element) => element.node);
          const destinations = data.allDestinationJson.edges.map((element) => element.node);
          return (
            <div>
              <Content>
                {this.props.children}
              </Content>
              <Header className={this.state.showHeader?'showHeader':''}>
                <MenuButton onClick={this.toggleMenu}><img src={menuIcon} width="24px" height="24px" alt="Menü" /><MenuText>Menü</MenuText></MenuButton>
                <Link to="/">
                  <Title>www.dplate.de</Title>
                  <Logo src={logoIcon} width="48px" height="48px" alt="" />
                </Link>
              </Header>
              { this.state.showMenu && <Menu onClose={this.toggleMenu} reports={reports} destinations={destinations} currentPath={this.props.location.pathname} />}
            </div>
          )
        }}
      />
    )
  }
}

export default Layout;
