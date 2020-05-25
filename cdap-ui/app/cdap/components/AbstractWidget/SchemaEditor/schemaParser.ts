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
  isNullable,
  isComplexType,
  getNonNullableType,
  getComplexTypeName,
} from 'components/AbstractWidget/SchemaEditor/SchemaHelpers';
import uuidV4 from 'uuid/v4';
import { IFlattenRowType } from 'components/AbstractWidget/SchemaEditor/SchemaTypes';

const flattenUnionType = (complexType, ancestors) => {
  if (!Array.isArray(complexType)) {
    return [];
  }
  const result: IFlattenRowType[] = [];
  for (const subType of getNonNullableType(complexType)) {
    if (isComplexType(subType)) {
      const complexTypeName = getComplexTypeName(subType);
      const id = `id-${uuidV4()}`;
      result.push({
        internalType: 'union-complex-type-root',
        id,
        type: complexTypeName,
        ancestors,
        nullable: isNullable(subType),
      });
      result.push(...flattenSubTree(subType, ancestors.concat([id])));
    } else {
      result.push({
        internalType: 'union-simple-type',
        id: `id-${uuidV4()}`,
        type: subType,
        ancestors,
        nullable: isNullable(subType),
      });
    }
  }
  return result;
};

const flattenMapType = (complexType, ancestors) => {
  if (typeof complexType !== 'object') {
    return [];
  }
  const result: IFlattenRowType[] = [];
  const { keys, values } = getNonNullableType(complexType);
  const mapKeysId = `id-${uuidV4()}`;
  const mapValuesId = `id-${uuidV4()}`;
  if (!isComplexType(keys)) {
    result.push({
      internalType: 'map-keys-simple-type',
      id: mapKeysId,
      type: keys,
      ancestors,
      nullable: isNullable(keys),
    });
  } else {
    const complexTypeName = getComplexTypeName(keys);
    result.push({
      internalType: 'map-keys-complex-type-root',
      id: mapKeysId,
      type: complexTypeName,
      ancestors,
      nullable: isNullable(keys),
    });
    result.push(...flattenSubTree(keys, ancestors.concat([mapKeysId])));
  }
  if (!isComplexType(values)) {
    result.push({
      internalType: 'map-values-simple-type',
      id: mapValuesId,
      type: values,
      ancestors,
      nullable: isNullable(values),
    });
  } else {
    const complexTypeName = getComplexTypeName(values);
    result.push({
      internalType: 'map-values-complex-type-root',
      id: mapValuesId,
      type: complexTypeName,
      ancestors,
      nullable: isNullable(values),
    });
    result.push(...flattenSubTree(values, ancestors.concat([mapValuesId])));
  }
  return result;
};

const flattenEnumType = (complexType, ancestors) => {
  if (typeof complexType !== 'object') {
    return [];
  }
  const result: IFlattenRowType[] = [];
  const { symbols } = getNonNullableType(complexType);
  for (const symbol of symbols) {
    result.push({
      id: `id-${uuidV4()}`,
      internalType: 'enum-symbol',
      ancestors,
      typeProperties: { symbol },
    });
  }
  return result;
};

const flattenArrayType = (complexType, ancestors) => {
  if (typeof complexType !== 'object') {
    return [];
  }
  const result = [];
  const { items } = getNonNullableType(complexType);
  const nullable = isNullable(items);
  const itemsId = `id-${uuidV4()}`;
  if (!isComplexType(items)) {
    result.push({
      internalType: 'array-simple-type',
      name: itemsId,
      type: getNonNullableType(items),
      ancestors,
      nullable,
    });
  } else {
    const complexTypeName = getComplexTypeName(items);
    result.push({
      internalType: 'array-complex-type-root',
      type: complexTypeName,
      name: itemsId,
      nullable,
      ancestors,
    });
    result.push(...flattenSubTree(items, ancestors.concat([itemsId])));
  }
  return result;
};

const flattenSubTree = (complexType, ancestors) => {
  const type = getComplexTypeName(complexType);
  switch (type) {
    case 'union':
      return flattenUnionType(complexType, ancestors);
    case 'map':
      return flattenMapType(complexType, ancestors);
    case 'enum':
      return flattenEnumType(complexType, ancestors);
    case 'array':
      return flattenArrayType(complexType, ancestors);
    case 'record':
      return flattenSchema({ schema: getNonNullableType(complexType) }, ancestors);
    default:
      return complexType;
  }
};

const flattenFields = (fields, ancestors) => {
  /**
   * check if it is nullable
   *  check if it is a simple type
   *    if so just add it to the array
   *    else parse the complex type
   * else it is a union type parse and add it to array
   */
  if (!Array.isArray(fields)) {
    return [];
  }
  const result = [];
  for (const field of fields) {
    const nullable = isNullable(field.type);
    const id = `id-${uuidV4()}`;
    const fieldObj: IFlattenRowType = {
      id,
      name: field.name,
      nullable,
      ancestors,
      type: getNonNullableType(field.type),
      internalType: 'record-field-simple-type',
    };
    if (isComplexType(field.type)) {
      fieldObj.type = getComplexTypeName(field.type);
      fieldObj.internalType = 'record-field-complex-type-root';
      result.push(fieldObj);
      // flatten the complex type subtree.
      result.push(...flattenSubTree(field.type, ancestors.concat([field.name])));
    } else {
      fieldObj.internalType = 'record-field-simple-type';
      result.push(fieldObj);
    }
  }
  return result;
};

const flattenSchema = (s, ancestors = ['root']) => {
  const schema = s.schema;
  const op = [];
  if (schema.fields) {
    op.push(...flattenFields(schema.fields, ancestors));
  }
  return op;
};

export { flattenSchema };
