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

const UnionTypeBase = ({ field, type, nullable, onChange }: IFieldTypeBaseProps) => {
  return (
    <FieldWrapper field={field}>
      <SingleColumnWrapper>
        <Select
          value={type}
          onChange={(newValue) => {
            onChange('type', newValue);
          }}
          widgetProps={{ options: schemaTypes, dense: true }}
        />
      </SingleColumnWrapper>
      <Nullable nullable={nullable} onChange={(checked) => onChange('nullable', checked)} />
    </FieldWrapper>
  );
};
const UnionType = React.memo(UnionTypeBase);
export { UnionType };
