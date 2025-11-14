/**
 * 리스트 아이템 설정 인터페이스
 * @template T - 리스트 아이템의 타입
 */
export interface ListItemConfig<T> {
  /** 리스트 데이터 배열 */
  data: T[];
  /** 데이터 매핑 설정 */
  mapping: {
    /** ID를 추출하는 방법 (키 또는 함수) */
    id: keyof T | ((item: T) => string);
    /** 라벨을 추출하는 방법 (키 또는 함수) */
    label: keyof T | ((item: T) => string);
    /** 설명을 추출하는 방법 (키 또는 함수, 선택) */
    description?: keyof T | ((item: T) => string);
    /** 비활성화 여부를 추출하는 방법 (키 또는 함수, 선택) */
    disabled?: keyof T | ((item: T) => boolean);
  };
}

/**
 * 리스트 아이템 설정 객체를 생성합니다.
 *
 * @template T - 리스트 아이템의 타입
 * @param data - 리스트 데이터 배열
 * @param mapping - 데이터 매핑 설정
 * @returns 생성된 ListItemConfig 객체
 * @example
 * ```ts
 * const config = createListConfig(users, {
 *   id: 'userId',
 *   label: 'userName'
 * });
 * ```
 */
export const createListConfig = <T>(data: T[], mapping: ListItemConfig<T>['mapping']): ListItemConfig<T> => ({
  data,
  mapping,
});

/**
 * 라벨과 ID를 가진 리스트 아이템 타입
 */
export type ListItem = { label: string; id: string | number };

/**
 * ListItemConfig를 ListItem 배열로 변환합니다.
 *
 * @template T - 리스트 아이템의 타입
 * @param config - 변환할 ListItemConfig 객체
 * @returns 변환된 ListItem 배열
 * @example
 * ```ts
 * const items = transformToLabeledItems(config);
 * // Returns: [{ id: '1', label: 'Item 1' }, { id: '2', label: 'Item 2' }]
 * ```
 */
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
