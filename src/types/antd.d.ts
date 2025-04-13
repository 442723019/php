import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';

declare module '@ant-design/icons' {
  export interface AntdIconProps {
    rev?: string;
  }
} 