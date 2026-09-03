export function useMDXComponents(components: Record<string, React.ComponentType>) {
  return {
    wrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    ...components,
  };
}
