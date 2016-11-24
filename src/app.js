import {div, h, input} from '@cycle/dom';
import xs from 'xstream';

function App ({DOM}) {
  // TODO - do this better
  const width = window.innerWidth - 30;
  const height = (window.innerHeight - 120) / 3;

  const f$ = DOM
    .select('.f')
    .events('input')
    .map(ev => ev.target.value)
    .startWith('x * x');

  function executeF (fString) {
    let points;

    try {
      const f = new Function('x', 'return ' + fString);

      points = new Array(width)
        .fill(0)
        .map((_, index) => f(index - width / 2));
    } catch (e) {
      return null;
    }

    return points;
  }

  const points$ = f$.map(executeF).filter(points => !!points);

  return {
    DOM: xs.combine(f$, points$).map(([f, points]) =>
      div('.derivatives', [
        input('.f', {attrs: {value: f}}),

        renderGraph({width, height, path: buildPath({width, height}, points)}),
        renderGraph({width, height, path: buildDerivativePath({width, height}, points)}),
        renderGraph({width, height, path: buildDerivativeDerivativePath({width, height}, points)}),
      ])
    )
  };
}

function renderGraph({width, height, path}) {
  const left = -(width / 2);

  return (
    h('svg', {attrs: {width, height, viewBox: `${-(width / 2)} ${(height / 2)} ${width} ${height}`}}, [
      h('line', {
        attrs: {
          stroke: '#333',
          'stroke-width': 1,
          x1: left,
          y1: height,
          x2: width / 2,
          y2: height
        }
      }),

      h('line', {
        attrs: {
          stroke: '#333',
          'stroke-width': 1,
          x1: 0,
          y1: 0,
          x2: 0,
          y2: height * 2
        }
      }),
      h('path', {attrs: {d: path, fill: 'none', stroke: 'white'}}),
    ])
  )
}

function pointsToPath ({width, height}, points) {
  return `M ${-(width / 2)} ${height - points[0]} ` + points.slice(1).map((point, index) => `L ${index - width / 2} ${height - point}`).join(' ');
}

function buildPoints ({width, height}, fString) {
  const f = new Function('x', 'return ' + fString);

  const points = new Array(width).fill(0).map((_, index) => f(index - width / 2));

  return points;
}

function derive (points) {
  const initialState = {
    previousValue: null,
    differences: []
  }


  const diff = (acc, val) => {
    if (acc.previousValue === null) {
      return {
        ...acc,

        previousValue: val
      }
    }

    return {
      differences: [...acc.differences, val - acc.previousValue],

      previousValue: val
    }
  }


  return points.reduce(diff, initialState).differences;
}

function buildPath (dimensions, points) {
  return pointsToPath(
    dimensions,
    points
  );
}

function buildDerivativePath (dimensions, points) {
  return pointsToPath(
    dimensions,
    derive(points)
  );
}

function buildDerivativeDerivativePath (dimensions, points) {
  return pointsToPath(
    dimensions,
    derive(derive(points))
  );
}

export default App;
