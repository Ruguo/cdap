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
import { IInternalFieldType } from 'components/AbstractWidget/SchemaEditor/EditorTypes';
import {
  ISchemaType,
  IDisplayType,
  IFieldType,
  IFieldTypeNullable,
  ILogicalTypeBase,
} from 'components/AbstractWidget/SchemaEditor/SchemaTypes';
import {
  getComplexTypeName,
  isNullable,
  isComplexType,
  getNonNullableType,
  getSimpleType,
} from 'components/AbstractWidget/SchemaEditor/SchemaHelpers';
import uuidV4 from 'uuid/v4';

type ITypeProperties = Record<string, any>;

interface INode {
  name?: string;
  children?: IOrderedChildren;
  id: string;
  internalType: IInternalFieldType;
  nullable?: boolean;
  type?: IDisplayType;
  typeProperties?: ITypeProperties;
}

type IOrderedChildren = Record<string, INode> | Record<'order', string[]>;

function parseUnionType(type): IOrderedChildren {
  const result: IOrderedChildren = {
    order: [],
  };
  for (const subType of type) {
    const id = uuidV4();
    result.order.push(id);
    if (isComplexType(subType)) {
      const typeName = getComplexTypeName(subType);
      result[id] = {
        id,
        type: typeName,
        internalType: 'union-complex-type-root',
        children: parseComplexType(subType),
      };
    } else {
      result[id] = {
        id,
        type: subType,
        nullable: false,
        internalType: 'union-simple-type',
      };
    }
  }
  return result;
}

function parseArrayType(type): IOrderedChildren {
  const nullable = isNullable(type);
  const t = getNonNullableType(type);
  const id = uuidV4();
  if (t.items && !isComplexType(t.items)) {
    return {
      [id]: {
        internalType: 'array-simple-type',
        id,
        nullable,
        type: getNonNullableType(t.items),
      },
    };
  }
  return {
    [id]: {
      internalType: 'array-complex-type-root',
      id,
      nullable,
      type: getComplexTypeName(t.items),
      children: parseComplexType(t.items),
    },
  };
}

function parseEnumType(type): IOrderedChildren {
  const nullable = isNullable(type);
  const t = getNonNullableType(type);
  const result = {
    order: [],
  };
  for (const symbol of t.symbols) {
    const id = uuidV4();
    result.order.push(id);
    result[id] = {
      id,
      internalType: 'enum-symbol',
      nullable,
      typeProperties: {
        symbol,
      },
    };
  }
  return result;
}

function getMapSubType(type, internalTypeName): INode {
  const id = uuidV4();
  if (!isComplexType(type)) {
    return {
      id,
      internalType: internalTypeName.simpleType,
      nullable: isNullable(type),
      type: getNonNullableType(type),
    };
  } else {
    const complexType = getComplexTypeName(type);
    const nullable = isNullable(type);
    return {
      children: parseComplexType(type),
      id,
      internalType: internalTypeName.complexType,
      type: complexType,
      nullable,
    };
  }
}

function parseMapType(type): IOrderedChildren {
  const t = getNonNullableType(type);
  const keysType = t.keys;
  const valuesType = t.values;
  const result: Record<string, INode> = {};
  const mapKeysSubType = getMapSubType(keysType, {
    simpleType: 'map-keys-simple-type',
    complexType: 'map-keys-complex-type-root',
  });
  const mapValuesSubType = getMapSubType(valuesType, {
    simpleType: 'map-values-simple-type',
    complexType: 'map-values-complex-type-root',
  });
  result[mapKeysSubType.id] = mapKeysSubType;
  result[mapValuesSubType.id] = mapValuesSubType;
  return result;
}

function parseComplexType(type): IOrderedChildren {
  const complexTypeName = getComplexTypeName(type);
  let record: IOrderedChildren = {};
  switch (complexTypeName) {
    case 'enum':
      record = parseEnumType(type);
      break;
    case 'array':
      record = parseArrayType(type);
      break;
    case 'record': {
      const schema: ISchemaType = { name: 'etlSchemaBody', schema: getNonNullableType(type) };
      const parsedSchema = parseSchema(schema);
      record[parsedSchema.id] = parsedSchema;
      break;
    }
    case 'union':
      record = parseUnionType(type);
      break;
    case 'map':
      record = parseMapType(type);
      break;
    default:
      record = {};
  }
  return record;
}

function checkForLogicalType(field: IFieldType | IFieldTypeNullable) {
  let type = field.type;
  type = getNonNullableType(type) as ILogicalTypeBase;
  switch (type.logicalType) {
    case 'decimal':
      return {
        typeProperties: {
          type: 'bytes',
          logicalType: type.logicalType,
          precision: type.precision,
          scale: type.scale,
        },
      };
    case 'date':
      return {
        typeProperties: {
          type: 'int',
          logicalType: type.logicalType,
        },
      };
    case 'time-micros':
      return {
        typeProperties: {
          type: 'long',
          logicalType: type.logicalType,
        },
      };
    case 'timestamp-micros':
      return {
        typeProperties: {
          type: 'long',
          logicalType: type.logicalType,
        },
      };
    default:
      return {};
  }
}

function parseSubTree(field: IFieldType | IFieldTypeNullable): INode {
  const { type, name } = field;
  const nullable = isNullable(type);
  const complexType = isComplexType(type);
  const t = getNonNullableType(type);
  if (!complexType) {
    return {
      name,
      id: uuidV4(),
      internalType: 'record-field-simple-type',
      nullable,
      type: getSimpleType(t),
      ...checkForLogicalType(field),
    };
  }
  return {
    name,
    children: parseComplexType(type),
    id: uuidV4(),
    internalType: 'record-field-complex-type-root',
    nullable,
    type: getComplexTypeName(t),
  };
}

function parseSchema(avroSchema: ISchemaType, name = 'etlSchemaBody'): INode {
  const fields = avroSchema.schema.fields;
  const root: INode = {
    name,
    internalType: 'schema',
    type: 'schema',
    id: uuidV4(),
    children: {
      order: [],
    } as IOrderedChildren,
  };
  for (const field of fields) {
    const child = parseSubTree(field);
    if (Array.isArray(root.children.order)) {
      root.children.order.push(child.id);
    }
    root.children[child.id] = child;
  }
  return root;
}

export {
  parseSchema,
  INode,
  ITypeProperties,
  IOrderedChildren,
  parseComplexType,
  parseUnionType,
  parseArrayType,
  parseEnumType,
  parseMapType,
  checkForLogicalType,
};
