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
import { schemaTypes } from 'components/AbstractWidget/SchemaEditor/SchemaConstants';
import { Nullable } from 'components/AbstractWidget/SchemaEditor/Nullable';
import { SingleColumnWrapper } from 'components/AbstractWidget/SchemaEditor/SingleColumnWrapper';
import Select from 'components/AbstractWidget/FormInputs/Select';
import { IFieldTypeBaseProps } from 'components/AbstractWidget/SchemaEditor/SchemaTypes';

const ArrayType = ({ ancestorsCount, type, nullable, onChange }: IFieldTypeBaseProps) => {
  const [fieldType, setFieldType] = React.useState(type);
  const [fieldNullable, setFieldNullable] = React.useState(nullable);
  return (
    <FieldWrapper ancestorsCount={ancestorsCount}>
      <SingleColumnWrapper>
        <Select
          value={fieldType}
          onChange={(newValue) => {
            setFieldType(newValue);
            onChange('type', newValue);
          }}
          widgetProps={{ options: schemaTypes, dense: true }}
        />
      </SingleColumnWrapper>
      <Nullable
        nullable={fieldNullable}
        onChange={(checked) => {
          setFieldNullable(checked);
          onChange('nullable', checked);
        }}
      />
    </FieldWrapper>
  );
};

export { ArrayType };
