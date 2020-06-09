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

type IComplexTypeNames = 'array' | 'enum' | 'map' | 'record' | 'union';
type ISimpleType =
  | 'boolean'
  | 'bytes'
  | 'date'
  | 'decimal'
  | 'double'
  | 'float'
  | 'int'
  | 'long'
  | 'number'
  | 'string'
  | 'time'
  | 'timestamp';
type ILogicalTypeNames = 'timestamp-micros' | 'date' | 'time-micros' | 'decimal';

type IDisplayType = ISimpleType | IComplexTypeNames;

type ISimpleTypeNullable = Array<ISimpleType | 'null'>;

type IComplexType =
  | IArrayFieldBase
  | IEnumFieldBase
  | IMapFieldBase
  | IRecordField
  | IUnionField
  | ILogicalTypeBase;
type IComplexTypeNullable =
  | Array<IArrayFieldBase | 'null'>
  | Array<IEnumFieldBase | 'null'>
  | Array<IMapFieldBase | 'null'>
  | Array<IRecordField | 'null'>;

type IComplexTypeFieldNullable =
  | IArrayFieldNullable
  | IEnumFieldNullable
  | IMapFieldNullable
  | IRecordFieldNullable;

type IInternalFieldType =
  | 'schema'
  | 'record-field-simple-type'
  | 'record-field-complex-type-root'
  | 'array-simple-type'
  | 'array-complex-type'
  | 'array-complex-type-root'
  | 'enum-symbol'
  | 'map-keys-complex-type-root'
  | 'map-keys-simple-type'
  | 'map-values-complex-type-root'
  | 'map-values-simple-type'
  | 'union-simple-type'
  | 'union-complex-type-root';

interface IFieldBaseType {
  name: string;
}

interface IEnumFieldBase {
  type: 'enum';
  symbols: string[];
}
interface IEnumField extends IFieldBaseType {
  type: IEnumFieldBase;
}
interface IEnumFieldNullable extends IFieldBaseType {
  type: Array<IEnumFieldBase | 'null'>;
}

interface IMapFieldBase {
  type: 'map';
  keys: ISimpleType | ISimpleTypeNullable | IComplexType | IComplexTypeFieldNullable;
  values: ISimpleType | ISimpleTypeNullable | IComplexType | IComplexTypeFieldNullable;
}
interface IMapField extends IFieldBaseType {
  type: IMapFieldBase;
}
interface IMapFieldNullable extends IFieldBaseType {
  type: Array<IMapFieldBase | 'null'>;
}

interface IArrayFieldBase {
  type: 'array';
  items: ISimpleType | ISimpleTypeNullable | IComplexType | IComplexTypeFieldNullable;
}

interface IArrayField extends IFieldBaseType {
  type: IArrayFieldBase;
}
interface IArrayFieldNullable extends IFieldBaseType {
  type: Array<IArrayFieldBase | 'null'>;
}

interface ILogicalTypeBase {
  type: ISimpleType;
  logicalType: ILogicalTypeNames;
  precision?: number;
  scale?: number;
}

type ILogicalTypeNullable = Array<ILogicalTypeBase | 'null'>;

interface ILogicalType extends IFieldBaseType {
  type: ILogicalTypeBase;
}

interface ILogicalTypeFieldNullable extends IFieldBaseType {
  type: Array<ILogicalTypeBase | 'null'>;
}

interface IFieldType extends IFieldBaseType {
  type: ISimpleType | IComplexType | ILogicalType;
}

interface IFieldTypeNullable extends IFieldBaseType {
  type: ISimpleTypeNullable | IComplexTypeNullable | ILogicalTypeNullable;
}

interface IRecordField extends IFieldBaseType {
  type: 'record';
  fields: Array<IFieldType | IFieldTypeNullable>;
}
type IRecordFieldNullable = Array<IRecordField | 'null'>;

interface IUnionField extends IFieldBaseType {
  type: Array<ISimpleType | IComplexType>;
}

interface ISchemaType {
  name: string;
  schema: IRecordField;
}

interface IFlattenRowType {
  id: string;
  name?: string;
  type?: ISimpleType | IComplexTypeNames;
  internalType: IInternalFieldType;
  nullable?: boolean;
  ancestors: string[];
  typeProperties?: Record<string, any>;
}

interface IFieldIdentifier {
  id: string;
  ancestors: string[];
}

interface IFieldTypeBaseProps {
  name?: string;
  type?: string;
  nullable?: boolean;
  internalType?: IInternalFieldType;
  typeProperties?: Record<string, any>;
  ancestorsCount: number;
  onChange: (property: string, value?: string | boolean | Record<string, string>) => void;
}

export {
  ISimpleType,
  IComplexTypeNames,
  ILogicalTypeNames,
  ILogicalType,
  ILogicalTypeFieldNullable,
  ILogicalTypeNullable,
  IDisplayType,
  ISimpleTypeNullable,
  IComplexTypeNullable,
  IComplexTypeFieldNullable,
  IComplexType,
  IEnumField,
  IEnumFieldNullable,
  IMapFieldBase,
  IMapField,
  IMapFieldNullable,
  IArrayFieldBase,
  IArrayField,
  IArrayFieldNullable,
  IRecordField,
  IRecordFieldNullable,
  IUnionField,
  IFieldType,
  IFieldTypeNullable,
  IFieldBaseType,
  ISchemaType,
  IFlattenRowType,
  IInternalFieldType,
  ILogicalTypeBase,
  IFieldIdentifier,
  IFieldTypeBaseProps,
};
