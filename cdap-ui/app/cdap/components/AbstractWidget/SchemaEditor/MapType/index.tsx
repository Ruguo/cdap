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
import { FieldWrapper } from 'components/AbstractWidget/SchemaEditor/FieldType/FieldWrapper';
import Select from 'components/AbstractWidget/FormInputs/Select';
import { schemaTypes } from 'components/AbstractWidget/SchemaEditor/SchemaConstants';
import { Nullable } from 'components/AbstractWidget/SchemaEditor/Nullable';
import Box from '@material-ui/core/Box';
import withStyles, { StyleRules } from '@material-ui/core/styles/withStyles';
import { IFieldTypeBaseProps } from 'components/AbstractWidget/SchemaEditor/SchemaTypes';

const MapWrapper = withStyles(
  (): StyleRules => {
    return {
      root: {
        display: 'grid',
        gridTemplateColumns: '50px 100px',
        alignItems: 'center',
        gridGap: '10px',
      },
    };
  }
)(Box);

const MapTypeBase = ({ field, type, nullable, onChange }: IFieldTypeBaseProps) => {
  let label = '';
  if (['map-keys-complex-type-root', 'map-keys-simple-type'].indexOf(field.internalType) !== -1) {
    label = 'Keys: ';
  }
  if (
    ['map-values-complex-type-root', 'map-values-simple-type'].indexOf(field.internalType) !== -1
  ) {
    label = 'Values: ';
  }
  return (
    <FieldWrapper field={field}>
      <MapWrapper>
        <span>{label}</span>
        <Select
          value={type}
          onChange={(newValue) => {
            onChange('type', newValue);
          }}
          widgetProps={{ options: schemaTypes, dense: true, inline: true }}
        />
      </MapWrapper>
      <Nullable nullable={nullable} onChange={(checked) => onChange('nullable', checked)} />
    </FieldWrapper>
  );
};
const MapType = React.memo(MapTypeBase);
export { MapType };
