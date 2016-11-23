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
    .events('chang')
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

function buildPath ({width, height}, fString) {
  const f = new Function('x', 'return ' + fString);

  const points = new Array(width).fill(0).map((_, index) => f(index));

  return `M 0 ${height - 50} ` + points.map((point, index) => `L ${index} ${height - point - 50}`).join(' ');
}

function buildDerivativePath ({width, height}, fString) {
  const f = new Function('x', 'return ' + fString);

  const initialState = {
    previousValue: null,
    differences: []
  }

  const points = new Array(width)
    .fill(0)
    .map((_, index) => f(index))
    .reduce((acc, val) => {
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
    }, initialState).differences;

  return `M 0 ${height - 50} ` + points.map((point, index) => `L ${index} ${height - point - 50}`).join(' ');
}

function buildDerivativeDerivativePath ({width, height}, fString) {
  const f = new Function('x', 'return ' + fString);

  const initialState = {
    previousValue: null,
    differences: []
  }

  const points = new Array(width)
    .fill(0)
    .map((_, index) => f(index))
    .reduce((acc, val) => {
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
    }, initialState).differences;

  const points2 = points
    .reduce((acc, val) => {
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
    }, initialState).differences;

  return `M 0 ${height - 50} ` + points2.map((point, index) => `L ${index} ${height - point - 50}`).join(' ');
}

export default App;
