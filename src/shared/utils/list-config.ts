export interface ListItemConfig<T> {
  data: T[];
  mapping: {
    id: keyof T | ((item: T) => string);
    label: keyof T | ((item: T) => string);
    description?: keyof T | ((item: T) => string);
    disabled?: keyof T | ((item: T) => boolean);
  };
}

export const createListConfig = <T>(data: T[], mapping: ListItemConfig<T>['mapping']): ListItemConfig<T> => ({
  data,
  mapping,
});

export type ListItem = { label: string; id: string | number };

export const transformToLabeledItems = <T>(config: ListItemConfig<T>): ListItem[] => {
  if (config.data.length === 0) return [];

  return config.data.map((item) => {
    const getId =
      typeof config.mapping.id === 'function'
        ? config.mapping.id
        : (item: T) => String(item[config.mapping.id as keyof T]);

    const getLabel =
      typeof config.mapping.label === 'function'
        ? config.mapping.label
        : (item: T) => String(item[config.mapping.label as keyof T]);

    return {
      id: getId(item),
      label: getLabel(item),
    };
  });
};
