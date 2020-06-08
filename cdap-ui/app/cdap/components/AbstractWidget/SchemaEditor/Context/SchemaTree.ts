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

import {
  ISchemaType,
  IDisplayType,
  IInternalFieldType,
  IFlattenRowType,
  IFieldType,
  IFieldTypeNullable,
  ILogicalTypeBase,
  IFieldIdentifier,
} from 'components/AbstractWidget/SchemaEditor/SchemaTypes';
import uuidV4 from 'uuid/v4';
import isNil from 'lodash/isNil';
import {
  getComplexTypeName,
  isNullable,
  isComplexType,
  getNonNullableType,
  getSimpleType,
} from 'components/AbstractWidget/SchemaEditor/SchemaHelpers';
import isObject from 'lodash/isObject';
import isEmpty from 'lodash/isEmpty';

type ITypeProperties = Record<string, any>;

interface INode {
  name?: string;
  children?: Record<string, INode>;
  id: string;
  internalType: IInternalFieldType;
  nullable?: boolean;
  type?: IDisplayType;
  typeProperties?: ITypeProperties;
}

function getInternalType(tree: INode) {
  const hasChildren = Object.keys(tree.children).length;
  if (tree.internalType === 'record-field-simple-type' && hasChildren) {
    return 'record-field-complex-type-root';
  }
  if (tree.internalType === 'record-field-complex-type-root' && !hasChildren) {
    return 'record-field-simple-type';
  }
  if (tree.internalType === 'union-simple-type' && hasChildren) {
    return 'union-complex-type-root';
  }
  if (tree.internalType === 'union-complex-type-root' && !hasChildren) {
    return 'union-simple-type';
  }
  if (tree.internalType === 'array-simple-type' && hasChildren) {
    return 'array-complex-type-root';
  }
  if (tree.internalType === 'array-complex-type-root' && !hasChildren) {
    return 'array-simple-type';
  }
  if (tree.internalType === 'map-keys-simple-type' && hasChildren) {
    return 'map-keys-complex-type-root';
  }
  if (tree.internalType === 'map-keys-complex-type-root' && hasChildren) {
    return 'map-keys-simple-type';
  }
  if (tree.internalType === 'map-values-simple-type' && hasChildren) {
    return 'map-values-complex-type-root';
  }
  if (tree.internalType === 'map-values-complex-type-root' && hasChildren) {
    return 'map-values-simple-type';
  }
  return tree.internalType;
}

function parseUnionType(type): Record<string, INode> {
  const result: Record<string, INode> = {} as Record<string, INode>;
  for (const subType of type) {
    const id = uuidV4();
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

function parseArrayType(type): Record<string, INode> {
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

function parseEnumType(type): Record<string, INode> {
  const nullable = isNullable(type);
  const t = getNonNullableType(type);
  const result = {};
  for (const symbol of t.symbols) {
    const id = uuidV4();
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

function parseMapType(type): Record<string, INode> {
  const t = getNonNullableType(type);
  const keysType = t.keys;
  const valuesType = t.values;
  const result: Record<string, INode> = {};
  const mapKeysSubType = getMapSubType(keysType, {
    simpleType: 'map-keys-simple-type',
    complexType: 'map-keys-complex-type',
  });
  const mapValuesSubType = getMapSubType(valuesType, {
    simpleType: 'map-values-simple-type',
    complexType: 'map-values-complex-type',
  });
  result[mapKeysSubType.id] = mapKeysSubType;
  result[mapValuesSubType.id] = mapValuesSubType;
  return result;
}

function parseComplexType(type): Record<string, INode> {
  const complexTypeName = getComplexTypeName(type);
  let record: Record<string, INode> = {};
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
  if (type.logicalType) {
    return {
      typeProperties: {
        logicalType: type.logicalType,
        precision: type.precision,
        scale: type.scale,
      },
    };
  }
  return {};
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
    id: uuidV4(),
    children: {} as Record<string, INode>,
  };
  for (const field of fields) {
    const child = parseSubTree(field);
    root.children[child.id] = child;
  }
  return root;
}

function flattenTree(schemaTree: INode, ancestors = []) {
  const result: IFlattenRowType[] = [];
  if (!schemaTree) {
    return [];
  }
  const { internalType, name, id, children, type, typeProperties, nullable } = schemaTree;
  result.push({
    internalType,
    name,
    id,
    type,
    typeProperties,
    ancestors,
    nullable,
  });
  if (isObject(children) && Object.keys(children).length) {
    for (const [_, value] of Object.entries(children)) {
      result.push(...flattenTree(value, ancestors.concat(id)));
    }
  }
  return result;
}

interface ISchemaTree {
  tree: () => INode;
  flat: () => IFlattenRowType[];
  update: (fieldId: IFieldIdentifier, index: number, property, value) => void;
}

const branchCount = (tree: INode): number => {
  let count = 1;
  if (tree && !isEmpty(tree.children) && Object.keys(tree.children).length) {
    Object.values(tree.children).forEach((child: INode) => {
      count += branchCount(child);
    });
  }
  return count;
};

const initChildren = (tree: INode, type): Record<string, INode> => {
  switch (type) {
    case 'array':
      return parseArrayType({
        type: 'array',
        items: 'string',
      });
    case 'enum':
      return parseEnumType({
        type: 'enum',
        symbols: [''],
      });
    case 'map':
      return parseMapType({
        type: 'map',
        keys: 'string',
        values: 'string',
      });
    case 'record': {
      return parseComplexType({
        name: 'etlSchemaBody',
        type: 'record',
        fields: [
          {
            name: '',
            type: 'string',
          },
        ],
      });
    }
    case 'union':
      return parseUnionType(['string']);
    default:
      return {};
  }
};
const updateTree = (
  tree: INode,
  fieldId: IFieldIdentifier,
  { property, value }
): {
  tree: INode;
  childrenCount: number;
  newTree: INode;
} => {
  if (!tree) {
    return { childrenCount: undefined, tree: undefined, newTree: undefined };
  }
  if (fieldId.ancestors.length === 1) {
    if (fieldId.id === tree.id) {
      let childrenInBranch = 0;
      tree[property] = value;
      if (property === 'type') {
        childrenInBranch = branchCount(tree);
        tree.children = initChildren(tree, value);
        tree.internalType = getInternalType(tree);
        return { childrenCount: childrenInBranch, tree, newTree: tree };
      }
      return { childrenCount: childrenInBranch, tree, newTree: undefined };
    }
    return undefined;
  }
  const { tree: child, childrenCount, newTree } = updateTree(
    tree.children[fieldId.ancestors[1]],
    { id: fieldId.id, ancestors: fieldId.ancestors.slice(1) },
    { property, value }
  );
  return {
    tree: {
      ...tree,
      children: {
        ...tree.children,
        [child.id]: child,
      },
    },
    childrenCount,
    newTree,
  };
};

function SchemaTree(avroSchema: ISchemaType): ISchemaTree {
  let schemaTree: INode = parseSchema(avroSchema);
  let flatTree: IFlattenRowType[] = flattenTree(schemaTree);
  return {
    tree: () => schemaTree,
    flat: () => flatTree,
    update: (fieldId: IFieldIdentifier, index: number, property, value) => {
      if (isNil(index) || index === -1) {
        return;
      }
      flatTree[index][property] = value;
      const matchingEntry = flatTree[index];
      const id = {
        id: matchingEntry.id,
        ancestors: matchingEntry.ancestors.concat([matchingEntry.id]),
      };
      const valueObj = { property, value };
      const { tree, childrenCount, newTree } = updateTree(schemaTree, id, valueObj);
      const newFlatSubTree = flattenTree(newTree, matchingEntry.ancestors);
      schemaTree = tree;
      if (childrenCount > 1 || newTree) {
        flatTree = [...flatTree.slice(0, index), ...flatTree.slice(index + childrenCount)];
        flatTree = [...flatTree.slice(0, index), ...newFlatSubTree, ...flatTree.slice(index)];
      }
    },
  };
}

export { SchemaTree, INode, ISchemaTree };
