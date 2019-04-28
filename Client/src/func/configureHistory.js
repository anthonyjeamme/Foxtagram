import { createBrowserHistory, createHashHistory } from 'history'

export function configureHistory() {
  return window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: standalone)').matches
    ? createHashHistory()
    : createBrowserHistory()
}