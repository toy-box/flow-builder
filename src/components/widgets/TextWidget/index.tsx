import React, { Fragment } from 'react';
import { isStr } from '@toy-box/toybox-shared';
import { observer } from '@formily/reactive-react';
import { useRegistry } from '../../../hooks';

export interface ITextWidgetProps {
  token?: string;
}

export const TextWidget: React.FC<ITextWidgetProps> = observer((props) => {
  const registry = useRegistry()
  const token = props.token
    ? props.token
    : isStr(props.children)
      ? props.children
      : null;
  if (token) {
    const message = registry.getDesignerMessage(token);
    if (message) return message;
  }
  return <Fragment>{props.children}</Fragment>;
});
