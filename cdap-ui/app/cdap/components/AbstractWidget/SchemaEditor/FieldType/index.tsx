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
import {
  FieldWrapper,
  FieldInputWrapper,
} from 'components/AbstractWidget/SchemaEditor/FieldType/FieldWrapper';
import TextBox from 'components/AbstractWidget/FormInputs/TextBox';
import Select from 'components/AbstractWidget/FormInputs/Select';
import {
  schemaTypes,
  defaultFieldType,
} from 'components/AbstractWidget/SchemaEditor/SchemaConstants';
import { IFieldTypeBaseProps } from 'components/AbstractWidget/SchemaEditor/SchemaTypes';
import { RowButtons } from 'components/AbstractWidget/SchemaEditor/RowButtons';

const FieldTypeBase = ({ ancestorsCount, name, type, nullable, onChange }: IFieldTypeBaseProps) => {
  const [fieldName, setFieldName] = React.useState(name);
  const [fieldType, setFieldType] = React.useState(type);
  const [fieldNullable, setFieldNullable] = React.useState(nullable);
  return (
    <FieldWrapper ancestorsCount={ancestorsCount}>
      <FieldInputWrapper>
        <TextBox
          onChange={(newValue) => {
            setFieldName(newValue);
            onChange('name', newValue);
          }}
          widgetProps={{ placeholder: 'name' }}
          value={fieldName}
        />
        <Select
          value={fieldType}
          onChange={(newValue) => {
            setFieldType(newValue);
            onChange('type', newValue);
          }}
          widgetProps={{ options: schemaTypes, dense: true }}
        />
      </FieldInputWrapper>
      <RowButtons
        nullable={fieldNullable}
        onNullable={(checked) => {
          setFieldNullable(checked);
          onChange('nullable', checked);
        }}
        onAdd={() => {
          onChange('add', defaultFieldType);
        }}
        onRemove={() => {
          onChange('remove');
        }}
      />
    </FieldWrapper>
  );
};

const FieldType = React.memo(FieldTypeBase);
export { FieldType };
