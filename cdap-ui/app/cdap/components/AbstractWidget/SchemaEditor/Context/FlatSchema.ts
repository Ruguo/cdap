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

import isObject from 'lodash/isObject';
import { INode } from 'components/AbstractWidget/SchemaEditor/Context/SchemaParser';
import { IFlattenRowType } from 'components/AbstractWidget/SchemaEditor/EditorTypes';

function FlatSchema(schemaTree: INode, ancestors = []) {
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
    let iterable;
    if (Array.isArray(children.order) && children.order.length) {
      iterable = children.order;
      for (const childId of iterable) {
        result.push(...FlatSchema(children[childId], ancestors.concat(id)));
      }
    } else {
      iterable = children;
      for (const [_, value] of Object.entries<INode>(iterable)) {
        result.push(...FlatSchema(value, ancestors.concat(id)));
      }
    }
  }
  return result;
}
export { FlatSchema };
