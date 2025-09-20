import { ListIcon, ListOrderedIcon, ListTodoIcon, type LucideProps } from 'lucide-react';
import { type Editor } from '@tiptap/react';

export type ListType = 'bulletList' | 'orderedList' | 'taskList';
export type ListOptions = {
  [key in ListType]: {
    label: string;
    Icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
  };
};

export interface UseListConfig {
  editor?: Editor | null;
  type: ListType;
  hideWhenUnavailable?: boolean;
  listOptions?: ListOptions[];
  onToggled?: () => void;
}

export const listLabels: Record<ListType, string> = {
  bulletList: 'unordered list',
  orderedList: 'ordered list',
  taskList: 'task list',
};

export const listIcons = {
  bulletList: ListIcon,
  orderedList: ListOrderedIcon,
  taskList: ListTodoIcon,
};
