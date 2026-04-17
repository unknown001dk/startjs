export function compose(middleware) {
  return async function (req, res) {
    let index = -1;

    async function dispatch(i) {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;
      const fn = middleware[i];
      if (!fn) return;
      await fn(req, res, () => dispatch(i + 1));
    }

    await dispatch(0);
  };
}
