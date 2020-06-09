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

interface IFieldWrapperProps {
  ancestorsCount: number;
  children?: React.ReactNode;
  style?: any;
}
const FieldWrapperBase = ({ ancestorsCount = 0, children, style = {} }: IFieldWrapperProps) => {
  const spacing = ancestorsCount * INDENTATION_SPACING;
  const spacingWithLeftMargin = spacing + 10;
  const spacingMinusLeftMargin = spacing - 10;
  const firstColumn = `calc(100% - 75px)`;
  const secondColumn = `75px`;
  let customStyles = {
    marginLeft: `${spacing}px`,
    gridTemplateColumns: `${firstColumn} ${secondColumn}`,
    width: `calc(100% - ${spacingMinusLeftMargin}px)`,
    gridGap: '10px',
    alignItems: 'center',
  };
  if (style && isObject(style)) {
    customStyles = {
      ...customStyles,
      ...style,
    };
  }
  return (
    <Paper elevation={2} style={customStyles}>
      {children}
    </Paper>
  );
};

const FieldInputWrapperBase = withStyles(() => {
  return {
    root: {
      display: 'grid',
      gridTemplateColumns: 'auto 100px',
    },
  };
})(Box);

const FieldWrapper = React.memo(FieldWrapperBase);
const FieldInputWrapper = React.memo(FieldInputWrapperBase);
export { FieldWrapper, FieldInputWrapper };
