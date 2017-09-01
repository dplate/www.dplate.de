import React from 'react'
import ReactDisqusComments from 'react-disqus-comments-sso'
import logoIcon from '../icons/logo.png'
import menuIcon from '../icons/menu.svg'
import styled from 'styled-components'
import Link from 'gatsby-link'
import Menu from '../components/menu'

const Header = styled.div`
  background-color: #CFE0C3;
  text-align: right;
  position: fixed;
  z-index: 2;
  top: -57px;
  left: 0px;
  width: 100%;
  height: 57px;
  &.showHeader {
    top: 0px;  
  }
  transition: top 0.5s;
  
  a {
    color: black;
    :visited: {
      color: black;
    }
  }
`;

const MenuButton = styled.img`
  display: inline-block;
  position: absolute;
  left: 20px;
  top: 17px;
  height: 24px;
  width: 24px;
  cursor: pointer;
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
`;

const Content = styled.div`
  padding-top: 57px;  
`;

const Disqus = styled.div`
  margin: 25px 15px; 
  max-width: 800px;
`;

class Layout extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showHeader: true,
      showMenu: false
    };
    this.lastScrollY = 0;
    this.scrollHandler = this.scrollHandler.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  scrollHandler() {
    if (window.pageYOffset === this.lastScrollY) return;
    this.setState({ showHeader: window.pageYOffset < this.lastScrollY });
    this.lastScrollY = window.pageYOffset
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
    const reports = this.props.data.allReportJson.edges.map((element) => element.node);
    let disqusId = this.props.location.pathname.substr(1);
    if (!disqusId) disqusId = 'start';
    return (
      <div>
        <Content>
          {this.props.children()}
        </Content>
        <Disqus>
          <ReactDisqusComments
            shortname="dplate"
            identifier={disqusId}
            url={'http://www.dplate.de' + this.props.location.pathname}
            title={disqusId}
          />
        </Disqus>
        <Header className={this.state.showHeader?'showHeader':''}>
          <MenuButton src={menuIcon} onClick={this.toggleMenu} />
          <Link to="/">
            <Title>www.dplate.de</Title>
            <Logo src={logoIcon} />
          </Link>
        </Header>
        { this.state.showMenu && <Menu onClose={this.toggleMenu} reports={reports} currentPath={this.props.location.pathname} />}
      </div>
    )
  }
}

export default Layout;

export const layoutQuery = graphql`
  query AllReports{
   allReportJson(filter:{}, sort:{fields:[destination, date], order:ASC }) {
     edges {
       node {
         destination, 
         date, 
         shortTitle
       }
     }
   }
 }
`;