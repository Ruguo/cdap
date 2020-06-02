/*
 * Copyright © 2019 Cask Data, Inc.
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
import { IFlattenRowType } from 'components/AbstractWidget/SchemaEditor/SchemaTypes';
import { schemaTypes } from 'components/AbstractWidget/SchemaEditor/SchemaConstants';
import { IFieldIdentifier } from 'components/AbstractWidget/SchemaEditor/SchemaTypes';
import { FieldType } from 'components/AbstractWidget/SchemaEditor/FieldType';
import { UnionType } from 'components/AbstractWidget/SchemaEditor/UnionType';
import { MapType } from 'components/AbstractWidget/SchemaEditor/MapType';
import { EnumType } from 'components/AbstractWidget/SchemaEditor/EnumType';
import { ArrayType } from 'components/AbstractWidget/SchemaEditor/ArrayType';

interface IFieldRowState {
  name: string;
  type: string;
  nullable: boolean;
  typeProperties: Record<string, string>;
}

interface IFieldRowProps {
  field: IFlattenRowType;
  onChange: (id: IFieldIdentifier, property, value: string | boolean) => void;
}

class FieldRow extends React.Component<IFieldRowProps, IFieldRowState> {
  public state: IFieldRowState = {
    name: '',
    type: schemaTypes[0],
    nullable: false,
    typeProperties: {},
  };

  constructor(props) {
    super(props);
    const { field } = this.props;
    this.state = {
      name: field.name,
      type: field.type,
      nullable: field.nullable,
      typeProperties: field.typeProperties,
    };
  }

  public onChange = (property: string, value) => {
    if (['name', 'type', 'nullable'].indexOf(property) === -1) {
      return;
    }
    this.setState({
      [property]: value,
    } as Pick<IFieldRowState, 'name' | 'type' | 'nullable'>);

    const { onChange, field } = this.props;
    if (onChange) {
      this.props.onChange({ id: field.id, ancestors: field.ancestors }, property, value);
    }
    return;
  };

  public RenderSubType = (field) => {
    switch (field.internalType) {
      case 'record-field-simple-type':
      case 'record-field-complex-type-root':
        return (
          <FieldType
            field={this.props.field}
            name={this.state.name}
            type={this.state.type}
            nullable={this.state.nullable}
            onChange={this.onChange}
          />
        );
      case 'array-simple-type':
      case 'array-complex-type':
      case 'array-complex-type-root':
        return (
          <ArrayType
            field={this.props.field}
            type={this.state.type}
            nullable={this.state.nullable}
            onChange={this.onChange}
          />
        );
      case 'enum-symbol':
        return (
          <EnumType
            field={this.props.field}
            typeProperties={this.state.typeProperties}
            onChange={this.onChange}
          />
        );
      case 'map-keys-complex-type-root':
      case 'map-keys-simple-type':
      case 'map-values-complex-type-root':
      case 'map-values-simple-type':
        return (
          <MapType
            field={this.props.field}
            type={this.state.type}
            nullable={this.state.nullable}
            onChange={this.onChange}
          />
        );
      case 'union-simple-type':
      case 'union-complex-type-root':
        return (
          <UnionType
            field={this.props.field}
            type={this.state.type}
            nullable={this.state.nullable}
            onChange={this.onChange}
          />
        );
      default:
        return null;
    }
  };

  public render() {
    return this.RenderSubType(this.props.field);
  }
}

export { FieldRow };
