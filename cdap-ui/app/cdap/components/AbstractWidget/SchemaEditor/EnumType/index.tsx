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
import { IFieldRowComponentTypeProps } from 'components/AbstractWidget/SchemaEditor/SchemaTypes';

const EnumTypeBase = ({ field }: IFieldRowComponentTypeProps) => {
  const { symbol } = field.typeProperties;
  return (
    <FieldWrapper field={field}>
      <TextBox value={symbol} onChange={() => {}} widgetProps={{ placeholder: 'symbol' }} />
    </FieldWrapper>
  );
};
const EnumType = React.memo(EnumTypeBase);
export { EnumType };
