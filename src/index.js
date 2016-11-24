import {run} from '@cycle/xstream-run';
import {makeDOMDriver} from '@cycle/dom';
import App from './app';
import xs from 'xstream';

function resizeDriver (sink$, adapter) {
  const subject = xs.create();

  window.addEventListener(
    "resize",
    () => subject.shamefullySendNext()
  );

  return subject;
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  Resize: resizeDriver
};

run(App, drivers);
