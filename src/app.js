import {div, h, input} from '@cycle/dom';
import xs from 'xstream';

function App ({DOM}) {
  const width = 500;
  const height = 200;

  function f (x) {
    return x * x;
  }

 const f$ = DOM
    .select('.f')
    .events('change')
    .map(ev => ev.target.value)
    .startWith('x * x');

  return {
    DOM: f$.map(f =>
      div([
        input('.f', {attrs: {value: f}}),

        h('svg', {attrs: {width, height}}, [
          h('path', {attrs: {d: buildPath({width, height}, f), fill: 'none', stroke: 'black'}})
        ]),

        h('svg', {attrs: {width, height}}, [
          h('path', {attrs: {d: buildDerivativePath({width, height}, f), fill: 'none', stroke: 'black'}})
        ]),

        h('svg', {attrs: {width, height}}, [
          h('path', {attrs: {d: buildDerivativeDerivativePath({width, height}, f), fill: 'none', stroke: 'black'}})
        ])
      ])
    )
  };
}

function pointsToPath ({width, height}, points) {
  return `M 0 ${height - 50} ` + points.map((point, index) => `L ${index} ${height - point - 50}`).join(' ');
}

function buildPoints ({width, height}, fString) {
  const f = new Function('x', 'return ' + fString);

  const points = new Array(width).fill(0).map((_, index) => f(index));

  return points;
}

function derive (points) {
  const initialState = {
    previousValue: null,
    differences: []
  }


  const diff = (acc, val) => {
    if (!acc.previousValue) {
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

function buildPath (dimensions, fString) {
  return pointsToPath(
    dimensions,
    buildPoints(
      dimensions,
      fString
    )
  );
}

function buildDerivativePath (dimensions, fString) {
  return pointsToPath(
    dimensions,
    derive(
      buildPoints(
        dimensions,
        fString
      )
    )
  );
}

function buildDerivativeDerivativePath (dimensions, fString) {
  return pointsToPath(
    dimensions,
    derive(
      derive(
        buildPoints(
          dimensions,
          fString
        )
      )
    )
  );
}

export default App;
