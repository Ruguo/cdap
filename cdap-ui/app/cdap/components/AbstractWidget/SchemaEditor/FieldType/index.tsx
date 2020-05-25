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
import { schemaTypes } from 'components/AbstractWidget/SchemaEditor/SchemaConstants';
import { Nullable } from 'components/AbstractWidget/SchemaEditor/Nullable';
import { SchemaContext } from 'components/AbstractWidget/SchemaEditor/Context';
const FieldTypeBase = ({ field }) => {
  return (
    <SchemaContext.Consumer>
      {({ changeName }) => {
        console.log('rendering fieldtype: ', field.id);
        return (
          <FieldWrapper field={field}>
            <FieldInputWrapper>
              <TextBox
                onChange={(newValue) => {
                  const { id, ancestors } = field;
                  changeName({ id, ancestors }, newValue);
                }}
                widgetProps={{ placeholder: 'name' }}
                value={field.name}
              />
              <Select
                value={field.type}
                onChange={() => {}}
                widgetProps={{ options: schemaTypes, dense: true }}
              />
            </FieldInputWrapper>
            <Nullable field={field} />
          </FieldWrapper>
        );
      }}
    </SchemaContext.Consumer>
  );
};

const FieldType = React.memo(FieldTypeBase);
export { FieldType };
