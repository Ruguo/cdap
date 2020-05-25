/*
 * Copyright © 2020 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import * as React from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import isObject from 'lodash/isObject';
import withStyles from '@material-ui/core/styles/withStyles';
import { INDENTATION_SPACING } from 'components/AbstractWidget/SchemaEditor/SchemaConstants';
import { IFieldRowComponentTypeProps } from 'components/AbstractWidget/SchemaEditor/SchemaTypes';

interface IFieldWrapperProps extends IFieldRowComponentTypeProps {
  children?: React.ReactNode;
  style?: any;
}
const FieldWrapperBase = ({ field, children, style = {} }: IFieldWrapperProps) => {
  const spacing =
    field.ancestors && Array.isArray(field.ancestors)
      ? field.ancestors.length * INDENTATION_SPACING
      : 0;
  const spacingWithLeftMargin = spacing + 10;
  const spacingMinusLeftMargin = spacing - 10;
  const firstColumn = `calc(100% - 100px - ${spacingWithLeftMargin}px)`;
  const secondColumn = `calc(100px + ${spacingWithLeftMargin * 2}px)`;
  let customStyles = {
    marginLeft: `${spacing}px`,
    gridTemplateColumns: `${firstColumn} ${secondColumn}`,
    width: `calc(100% - ${spacingMinusLeftMargin}px)`,
    alignItems: 'center',
  };
  if (style && isObject(style)) {
    customStyles = {
      ...customStyles,
      ...style,
    };
  }
  return (
    <Paper elevation={2} key={field.name} style={customStyles}>
      {children}
    </Paper>
  );
};

const FieldInputWrapperBase = withStyles(() => {
  return {
    root: {
      display: 'grid',
      gridTemplateColumns: '75% 25%',
    },
  };
})(Box);

const FieldWrapper = React.memo(FieldWrapperBase);
const FieldInputWrapper = React.memo(FieldInputWrapperBase);
export { FieldWrapper, FieldInputWrapper };
