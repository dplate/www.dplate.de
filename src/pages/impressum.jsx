import React from 'react';
import styled from 'styled-components';
import { cardStyle } from '../styles/basestyle.js';
import Layout from '../components/Layout.jsx';

const Content = styled.div`
  ${cardStyle}
`;

const PageImpressum = (props) => {
  return (
    <Layout location={props.location}>
      <Content>
        <h1>Impressum und Datenschutzerklärung</h1>
        <h2>Kontaktadresse</h2>
        <p>
          Dirk Plate
          <br />
          Seestr. 23
          <br />
          CH-8596 Scherzingen
        </p>
        <p>
          <a href="mailto:email@dplate.de">email@dplate.de</a>
        </p>
        <h2>Haftungsausschluss</h2>
        <p>
          Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität,
          Zuverlässigkeit und Vollständigkeit der Informationen.
        </p>
        <p>
          Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff
          oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder
          durch technische Störungen entstanden sind, werden ausgeschlossen.
        </p>
        <p>
          Alle Angebote sind unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile der Seiten oder das gesamte
          Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise
          oder endgültig einzustellen.
        </p>
        <h2>Haftung für Links</h2>
        <p>
          Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres Verantwortungsbereichs Es wird jegliche
          Verantwortung für solche Webseiten abgelehnt. Der Zugriff und die Nutzung solcher Webseiten erfolgen auf
          eigene Gefahr des Nutzers oder der Nutzerin.{' '}
        </p>
        <h2>Urheberrechte</h2>
        <p>
          Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf der Website gehören
          ausschließlich dem Autor oder den speziell genannten Rechtsinhabern. Für die Reproduktion jeglicher Elemente
          ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen.
        </p>
        <h2>Datenschutzerklärung für die Nutzung von Google Analytics</h2>
        <p>
          Diese Website benutzt Google Analytics, einen Webanalysedienst der Google Inc. ("Google"). Google Analytics
          verwendet sog. "Cookies", Textdateien, die auf Ihrem Computer gespeichert werden und die eine Analyse der
          Benutzung der Website durch Sie ermöglichen. Die durch den Cookie erzeugten Informationen über Ihre Benutzung
          dieser Website werden in der Regel an einen Server von Google in den USA übertragen und dort gespeichert. Im
          Falle der Aktivierung der IP-Anonymisierung auf dieser Webseite wird Ihre IP-Adresse von Google jedoch
          innerhalb von Mitgliedstaaten der Europäischen Union oder in anderen Vertragsstaaten des Abkommens über den
          Europäischen Wirtschaftsraum zuvor gekürzt.
        </p>
        <p>
          Nur in Ausnahmefällen wird die volle IP-Adresse an einen Server von Google in den USA übertragen und dort
          gekürzt. Google wird diese Informationen benutzen, um Ihre Nutzung der Website auszuwerten, um Reports über
          die Websiteaktivitäten für die Websitebetreiber zusammenzustellen und um weitere mit der Websitenutzung und
          der Internetnutzung verbundene Dienstleistungen zu erbringen. Auch wird Google diese Informationen
          gegebenenfalls an Dritte übertragen, sofern dies gesetzlich vorgeschrieben oder soweit Dritte diese Daten im
          Auftrag von Google verarbeiten. Die im Rahmen von Google Analytics von Ihrem Browser übermittelte IP-Adresse
          wird nicht mit anderen Daten von Google zusammengeführt.{' '}
        </p>
        <p>
          Sie können der Erhebung der Daten durch Google-Analytics mit Wirkung für die Zukunft widersprechen, indem sie
          ein Deaktivierungs-Add-on für Ihren Browser installieren:{' '}
          <a href="https://tools.google.com/dlpage/gaoptout?hl=de" target="_blank" rel="noopener noreferrer">
            https://tools.google.com/dlpage/gaoptout?hl=de
          </a>
        </p>
      </Content>
    </Layout>
  );
};

export const Head = () => {
  return (
    <>
      <title>Impressum und Datenschutzerklärung</title>
    </>
  );
};

export default PageImpressum;
