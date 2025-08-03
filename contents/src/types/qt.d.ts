export type Signal<Handler> = Function & {
  connect: (d: Handler) => undefined;
};
