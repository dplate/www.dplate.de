import React from 'react';
import styled from 'styled-components';
import { cardStyle, pictureStyle } from '../../styles/basestyle.js';
import Layout from '../../components/Layout.jsx';

const Card = styled.div`
  ${cardStyle}
`;

const Picture = styled.img`
  ${pictureStyle};
  margin-left: 0;
  margin-right: 0;
  max-width: 100%;
`;

const pageAncient = (props) => {
  return (
    <Layout location={props.location}>
      <div>
        <Card>
          <h1>Labyland</h1>
          <Picture src="/screenshots/labyland.jpg" />
          <p>
            Inspiriert vom Brettspiel "Das verrückte Labyrinth" sammelt man mit bis zu 4 Spielern Geldscheine in einer
            Stadt ein. Dabei lassen sich ganze Straßenzüge verschieben und damit neue Wege erschaffen.
          </p>
          <p>
            Start im Windows 3.1 Emulator von archive.org:
            <br />
            <a href="https://archive.org/details/labyland">Labyland spielen</a>
          </p>
          <p>
            Download (Windows 3.1 oder Windows XP notwendig):
            <br />
            <a href="/zips/labyland.zip">labyland.zip: 181 KByte</a>
          </p>
          <p>
            Sourcecode für Pascal:
            <br />
            <a href="/zips/labylandsdk.zip">labylandsdk.zip: 48 KByte</a>
          </p>
        </Card>

        <Card>
          <h1>Cups</h1>
          <Picture src="/screenshots/cups.jpg" />
          <p>
            Vom Bettler zum Millionär, in dem man ein Jahr lang Geschirr von der Küche in ein Schrank sortiert. Da die
            Geschwindigkeit immer mehr ansteigt, wird das am Ende des Jahres zu einem stressigen Unterfangen... außerdem
            kommen noch andere Gemeinheiten dazu.
          </p>
          <p>
            Start im Windows 3.1 Emulator von archive.org:
            <br />
            <a href="https://archive.org/details/win31_cups">Cups spielen</a>
          </p>
          <p>
            Download (Windows 3.1 oder Windows XP notwendig):
            <br />
            <a href="/zips/cups.zip">cups.zip: 211 KByte</a>
          </p>
          <p>
            Sourcecode für Pascal:
            <br />
            <a href="/zips/cupssdk.zip">cupssdk.zip: 28 KByte</a>
          </p>
        </Card>

        <Card>
          <h1>Die Vulkaninsel</h1>
          <Picture src="/screenshots/vulkan.jpg" />
          <p>
            Praktisch der Vorgänger von "Schiffbruch", nur dass es sich hier um ein Textadventure mit statischen Bildern
            handelt. Über Texteingaben steuert man Erik über eine Vulkaninsel und löst einige Rätsel.
          </p>
          <p>
            Start im DOS Emulator von archive.org:
            <br />
            <a href="https://archive.org/details/dos_vulkaninsel">Die Vulkaninsel spielen</a>
          </p>
          <p>
            Download (Dosbox für Windows enthalten):
            <br />
            <a href="/zips/vulkan.zip">vulkan.zip: 2,1 MByte</a>
          </p>
          <p>
            Sourcecode für Pascal:
            <br />
            <a href="/zips/vulkansource.zip">vulkansource.zip: 11 KByte</a>
          </p>
        </Card>

        <Card>
          <h1>Das Katapultspiel</h1>
          <Picture src="/screenshots/katapult.jpg" />
          <p>
            "Das Katapultspiel" ist der Vorläufer von "Cannonhill". Im Gegensatz zu "Cannonhill" spielt man hier aber
            nicht gleichzeitig, sondern nacheinander. Mit Katapulten muss man versuchen, sich in einer Gebirgslandschaft
            gegenseitig abzuschießen.
          </p>
          <p>
            Start im DOS Emulator von archive.org:
            <br />
            <a href="https://archive.org/details/dos_katapultspiel">Das Katapultspiel spielen</a>
          </p>
          <p>
            Download (Dosbox für Windows enthalten):
            <br />
            <a href="/zips/katapult.zip">katapult.zip: 1,7 MByte</a>
          </p>
          <p>
            Sourcecode für Pascal:
            <br />
            <a href="/zips/katapultsource.zip">katapultsource.zip: 5 KByte</a>
          </p>
        </Card>

        <Card>
          <h1>Zahlorie</h1>
          <Picture src="/screenshots/zahlorie.jpg" />
          <p>
            Ein Mix aus Memory und Mathespiel. Statt zwei Bildern werden drei Zahlen aufgedeckt. Diese drei Zahlen
            müssen eine Formel erfüllen. Dabei stehen verschiedene Schwierigkeitsgrade und auch Computergegner zur
            Verfügung.
          </p>
          <p>
            Start im DOS Emulator von archive.org:
            <br />
            <a href="https://archive.org/details/zahlorie">Zahlorie spielen</a>
          </p>
          <p>
            Download (Dosbox für Windows enthalten):
            <br />
            <a href="/zips/zahlorie.zip">zahlorie.zip: 1,7 MByte</a>
          </p>
          <p>
            Sourcecode für Pascal:
            <br />
            <a href="/zips/zahloriesource.zip">zahloriesource.zip: 9 KByte</a>
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export const Head = () => {
  return (
    <>
      <title>Antike Spiele</title>
    </>
  );
};

export default pageAncient;
