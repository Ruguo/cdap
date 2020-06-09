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
import withStyles from '@material-ui/core/styles/withStyles';
import Box from '@material-ui/core/Box';
import { Nullable } from 'components/AbstractWidget/SchemaEditor/Nullable';
import AddRowButton from 'components/AbstractWidget/SchemaEditor/RowButtons/AddRowButton';
import RemoveRowButton from 'components/AbstractWidget/SchemaEditor/RowButtons/RemoveRowButton';

const RowButtonWrapper = withStyles(() => {
  return {
    root: {
      display: 'grid',
      gridTemplateColumns: '24px 24px 24px',
      gridTemplateRows: '24px',
    },
  };
})(Box);

interface IRowButtonsProps {
  nullable: boolean;
  onNullable: (checked: boolean) => void;
  onAdd: () => void;
  onRemove: () => void;
}

function RowButtons({ nullable, onNullable, onAdd, onRemove }: IRowButtonsProps) {
  return (
    <RowButtonWrapper>
      <Nullable onNullable={onNullable} nullable={nullable} />
      <AddRowButton onAdd={onAdd} />
      <RemoveRowButton onRemove={onRemove} />
    </RowButtonWrapper>
  );
}

export { RowButtons };
