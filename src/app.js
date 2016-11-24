import {div, h, input, label} from '@cycle/dom';
import xs from 'xstream';

function graphDimensions () {
  return {
    width: window.innerWidth - 30,
    height: (window.innerHeight - 120) / 3
  }
}

function executeF (fString, width) {
  try {
    const f = new Function('x', 'return ' + fString);

    const points = new Array(width)
      .fill(0)
      .map((_, index) => f(index - width / 2));

    return {points};
  } catch (error) {
    console.error(error);
    return {error};
  }
}

function updateF (state, fString) {
  const executionResult = executeF(fString, state.dimensions.width);

  if (executionResult.error) {
    return {
      ...state,

      ...executionResult,

      f: fString
    }
  }

  return {
    ...state,

    ...executionResult,

    error: null,

    f: fString
  }
}

function updateDimensions (state, dimensions) {
  return updateF({
    ...state,

    dimensions
  }, state.f);
}

function App ({DOM, Resize}) {
  const startingDimensions = graphDimensions();
  const startingF = 'x * x';

  const initialState = {
    dimensions: startingDimensions,
    points: executeF(startingF, startingDimensions.width).points,
    f: startingF,
    error: null
  };

  const resize$ = Resize
    .debug('now!')
    .map(graphDimensions)
    .map(dimensions => (state) => updateDimensions(state, dimensions))

  const f$ = DOM
    .select('.f')
    .events('input')
    .map(ev => ev.target.value)
    .map(fString => (state) => updateF(state, fString))

  const reducer$ = xs.merge(
    resize$,
    f$
  );

  const state$ = reducer$.fold((state, reducer) => reducer(state), initialState).debug('state');

  return {
    DOM: state$.map(({points, error, dimensions, f}) =>
      div('.derivatives', [
        div('.input-container', [
          label('.formula'),
          input('.f', {class: {error: !!error}, attrs: {value: f}})
        ]),

        renderGraph({
          dimensions,
          path: buildPath(dimensions, points)
        }),

        renderGraph({
          dimensions,
          path: buildDerivativePath(dimensions, points)
        }),

        renderGraph({
          dimensions,
          path: buildDerivativeDerivativePath(dimensions, points)
        })
      ])
    )
  };
}

function renderGraph({dimensions, path}) {
  const {width, height} = dimensions;
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
