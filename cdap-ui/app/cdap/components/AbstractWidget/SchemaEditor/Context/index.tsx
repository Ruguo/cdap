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
  ISchemaType,
  ISimpleType,
  IComplexTypeNames,
} from 'components/AbstractWidget/SchemaEditor/SchemaTypes';
import { SchemaTree, INode } from 'components/AbstractWidget/SchemaEditor/Context/SchemaTree';
import { IFlattenRowType } from 'components/AbstractWidget/SchemaEditor/SchemaTypes';
import { complex1 } from 'components/AbstractWidget/SchemaEditor/data/complexSchema';

interface ISchemaContextState {
  avroSchema: ISchemaType;
  schemaTree: INode;
  flatSchema: IFlattenRowType[];
}
interface ISchemaContext {
  state: ISchemaContextState;
  setSchema: (schema: ISchemaType) => void;
  clearSchema: () => void;
  addNewField: (index: number) => void;
  removeField: (index: number) => void;
  changeType: (index: number, newType: ISimpleType | IComplexTypeNames) => void;
  changeName: (fieldId: IFieldIdentifier, newValue: string) => void;
  setNullable: (index: number, nullable: boolean) => void;
  setFieldProperties: (index: number, properties) => void;
}
interface IFieldIdentifier {
  id: string;
  ancestors: string[];
}

const DEFAULT_SCHEMA: ISchemaType = {
  name: 'etlSchemaBody',
  schema: {
    name: 'etlSchemaBody',
    type: 'record',
    fields: [],
  },
};
const DEFAULT_TREE = SchemaTree(complex1 as ISchemaType);
const DEFAULT_SCHEMA_TREE = DEFAULT_TREE.tree();
const DEFAULT_FLAT_SCHEMA = DEFAULT_TREE.flat();
const SchemaContext = React.createContext<ISchemaContext>({
  state: {
    avroSchema: complex1 as ISchemaType,
    schemaTree: DEFAULT_SCHEMA_TREE as INode,
    flatSchema: DEFAULT_FLAT_SCHEMA as IFlattenRowType[],
  },
  clearSchema: () => undefined,
  setSchema: () => undefined,
  addNewField: () => undefined,
  removeField: () => undefined,
  changeType: () => undefined,
  changeName: () => undefined,
  setNullable: () => undefined,
  setFieldProperties: () => undefined,
});

class SchemaProvider extends React.Component<{}, ISchemaContextState> {
  public clearSchema = () => {
    console.log(' inside clearSchema function');
  };
  public setSchema = (avroSchema: ISchemaType) => {
    const parsedSchema = SchemaTree(avroSchema);
    const schemaTree = parsedSchema.tree();
    const flatSchema = parsedSchema.flat();
    this.setState({
      avroSchema,
      schemaTree,
      flatSchema,
    });
  };
  public addNewField = () => {};
  public removeField = () => {};
  public changeType = () => {};
  public changeName = (fieldId: IFieldIdentifier, newValue: string) => {
    const { schemaTree, flatSchema } = this.state;
    const flatRowIndex = flatSchema.findIndex((field) => field.id === fieldId.id);
    const getField = (id, ancestors, tree) => {
      if (ancestors.length === 0) {
        return tree[id];
      }
      return getField(id, ancestors.slice(1), tree.children);
    };
    flatSchema[flatRowIndex].name = newValue;
    getField(fieldId.id, fieldId.ancestors, schemaTree).name = newValue;
    this.setState({
      schemaTree,
      flatSchema,
    });
  };
  public setNullable = () => {};
  public setFieldProperties = () => {};

  public state: ISchemaContextState = {
    avroSchema: complex1 as ISchemaType,
    schemaTree: DEFAULT_SCHEMA_TREE as INode,
    flatSchema: DEFAULT_FLAT_SCHEMA as IFlattenRowType[],
  };

  public render() {
    return (
      <SchemaContext.Provider
        value={{
          state: this.state,
          clearSchema: this.clearSchema.bind(this),
          setSchema: this.setSchema.bind(this),
          addNewField: this.addNewField.bind(this),
          removeField: this.removeField.bind(this),
          changeType: this.changeType.bind(this),
          changeName: this.changeName.bind(this),
          setNullable: this.setNullable.bind(this),
          setFieldProperties: this.setFieldProperties.bind(this),
        }}
      >
        {this.props.children}
      </SchemaContext.Provider>
    );
  }
}

export { SchemaContext, SchemaProvider };
