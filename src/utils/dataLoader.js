import destinationsData from '../destinations/destination.json';

// Eagerly import all report JSON files at module level so Vite can statically
// analyze the glob once instead of creating a new module context on every call.
const reportsGlob = import.meta.glob('../reports/**/*.json', { eager: true });

export function getDestinations() {
  return destinationsData;
}

export function getReports() {
  return Object.values(reportsGlob).map((module) => module.default || module);
}

// Pre-compute the menu structure at build time.
// Returns a lightweight data structure containing only the fields needed
// for navigation, without the full report objects that bloat the HTML.
export function getMenuData(reports, destinations, currentPath) {
  const formatDate = (date) => {
    return date.substring(7, 9) + '.' + date.substring(5, 7) + '.' + date.substring(1, 5);
  };

  const createAlpineItem = (report) => {
    return {
      id: report.date,
      name: (report.type === 'hike' ? '☀' : '❄') + ' ' + report.shortTitle + ' — ' + formatDate(report.date),
      path: '/alpine/' + report.destination + '/' + report.date.substring(1)
    };
  };

  const createAlpineItems = (dests, reps) => {
    return dests.map((destination) => ({
      id: destination.destination,
      name: destination.name,
      path: '/alpine/' + destination.destination,
      items: reps
        .filter((report) => report.destination === destination.destination)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(createAlpineItem)
    }));
  };

  const createAlpine = (dests, reps) => {
    return {
      id: 'alpine',
      name: 'Alpinfunk',
      items: createAlpineItems(dests, reps)
    };
  };

  const selectCurrentPath = (path, items) => {
    const item = items.find((i) => {
      return i.path === path || (i.items && selectCurrentPath(path, i.items));
    });
    if (item) {
      item.selected = true;
      item.show = true;
      return true;
    }
    return false;
  };

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
        { id: 'alpine-route', name: 'Alpine Route', path: '/games/alpine-route' },
        { id: 'draw-a-mountain', name: 'Draw-A-Mountain', path: '/games/draw-a-mountain' },
        { id: 'schiffbruch', name: 'Schiffbruch', path: '/games/schiffbruch' },
        { id: 'cannonhill', name: 'Cannonhill', path: '/games/cannonhill' },
        { id: 'modracer', name: 'Modracer', path: '/games/modracer' },
        { id: 'ancient', name: 'Antike Spiele', path: '/games/ancient' }
      ]
    },
    {
      id: 'tools',
      name: 'Werkzeugschuppen',
      items: [
        { id: 'scapemaker', name: 'ScapeMaker', path: '/tools/scapemaker' },
        { id: 'kensentme', name: 'KenSentMe', path: '/tools/kensentme' }
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
}
