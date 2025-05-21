import React from 'react';
import Dropdown, { DropdownProps } from './Dropdown';

export default function SmallDropdown(props: Omit<DropdownProps, 'size'>) {
  return <Dropdown {...props} size='small' />;
}
