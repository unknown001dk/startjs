export function compose(middleware) {
  return async function (req, res) {
    let index = -1;

    async function dispatch(i, err) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }

      index = i;
      const fn = middleware[i];
      if (!fn) {
        if (err) throw err;
        return;
      }

      try {
        if (err) {
          if (fn.length === 4) {
            return await fn(err, req, res, (nextErr) =>
              dispatch(i + 1, nextErr),
            );
          }
          return dispatch(i + 1, err);
        }

        if (fn.length === 4) {
          return dispatch(i + 1);
        }

        return await fn(req, res, (nextErr) => dispatch(i + 1, nextErr));
      } catch (error) {
        return dispatch(i + 1, error);
      }
    }

    await dispatch(0);
  };
}
