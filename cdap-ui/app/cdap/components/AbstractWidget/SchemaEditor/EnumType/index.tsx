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
import TextBox from 'components/AbstractWidget/FormInputs/TextBox';
import { IFieldTypeBaseProps } from 'components/AbstractWidget/SchemaEditor/EditorTypes';
import { RowButtons } from 'components/AbstractWidget/SchemaEditor/RowButtons';
import { defaultEnumType } from 'components/AbstractWidget/SchemaEditor/SchemaConstants';

const EnumTypeBase = ({
  ancestorsCount,
  typeProperties,
  onChange,
  onAdd,
  onRemove,
}: IFieldTypeBaseProps) => {
  const { symbol } = typeProperties;
  const [enumSymbol, setEnumSymbol] = React.useState(symbol);
  return (
    <FieldWrapper ancestorsCount={ancestorsCount}>
      <TextBox
        value={enumSymbol}
        onChange={(value) => {
          setEnumSymbol(value);
          onChange('typeProperties', {
            symbol: enumSymbol,
          });
        }}
        widgetProps={{ placeholder: 'symbol' }}
      />
      <RowButtons onRemove={onRemove} onAdd={onAdd} />
    </FieldWrapper>
  );
};
const EnumType = React.memo(EnumTypeBase);
export { EnumType };
