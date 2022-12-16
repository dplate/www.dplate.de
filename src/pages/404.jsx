import React from 'react';
import styled from 'styled-components';
import { cardStyle } from '../styles/basestyle.js';
import Layout from '../components/layout.jsx';

const Content = styled.div`
  ${cardStyle}
`;

const Page404 = (props) => {
  return (
    <Layout location={props.location}>
      <Content>
        <h1>404 - Seite nicht gefunden</h1>
        <p>Die gewünschte Seite konnte leider nicht gefunden werden. :(</p>
      </Content>
    </Layout>
  );
};

export const Head = () => {
  return (
    <>
      <title>404 - Seite nicht gefunden</title>
    </>
  );
};

export default Page404;
