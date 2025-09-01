const actual = jest.requireActual('framer-motion');

module.exports = {
  ...actual,
  AnimatePresence: ({ children }) => children,
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    img: 'img',
    svg: 'svg',
    path: 'path',
  },
  useReducedMotion: () => true,
  domAnimation: () => ({}),
};
