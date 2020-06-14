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
  IFlattenRowType,
  IFieldIdentifier,
  IOnChangePayload,
} from 'components/AbstractWidget/SchemaEditor/EditorTypes';
import uuidV4 from 'uuid/v4';
import isNil from 'lodash/isNil';
import {
  logicalTypes,
  defaultTimeStampTypeProperties,
  defaultDecimalTypeProperties,
  defaultTimeTypeProperties,
  defaultDateTypeProperties,
  defaultArrayType,
  defaultEnumType,
  defaultMapType,
  defaultRecordType,
  defaultUnionType,
} from 'components/AbstractWidget/SchemaEditor/SchemaConstants';
import isEmpty from 'lodash/isEmpty';
import {
  INode,
  parseSchema,
  parseUnionType,
  parseArrayType,
  parseEnumType,
  parseMapType,
  IOrderedChildren,
  parseComplexType,
} from 'components/AbstractWidget/SchemaEditor/Context/SchemaParser';
import { FlatSchema } from 'components/AbstractWidget/SchemaEditor/Context/FlatSchema';

function getInternalType(tree: INode) {
  const hasChildren = tree.children ? Object.keys(tree.children).length : 0;
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

const branchCount = (tree: INode): number => {
  let count = 0;
  if (tree && !isEmpty(tree.children) && Object.keys(tree.children).length) {
    // skip 'order' array which is under children.
    const children = Object.values(tree.children).filter((child) => !Array.isArray(child));
    count += children.length;
    children.forEach((child: INode) => {
      count += branchCount(child);
    });
  }
  return count;
};

const initChildren = (type): IOrderedChildren => {
  switch (type) {
    case 'array':
      return parseArrayType(defaultArrayType);
    case 'enum':
      return parseEnumType(defaultEnumType);
    case 'map':
      return parseMapType(defaultMapType);
    case 'record': {
      return parseComplexType(defaultRecordType);
    }
    case 'union':
      return parseUnionType(defaultUnionType);
    default:
      return;
  }
};

const initTypeProperties = (tree: INode) => {
  if (logicalTypes.indexOf(tree.type) === -1) {
    return {};
  }
  switch (tree.type) {
    case 'decimal':
      return defaultDecimalTypeProperties;
    case 'time':
      return defaultTimeTypeProperties;
    case 'timestamp':
      return defaultTimeStampTypeProperties;
    case 'date':
      return defaultDateTypeProperties;
    default:
      return {};
  }
};

interface ISchemaTree {
  getSchemaTree: () => INode;
  getFlatSchema: () => IFlattenRowType[];
  onChange: (
    fieldId: IFieldIdentifier,
    currentIndex: number,
    onChangePayload: IOnChangePayload
  ) => void;
}

class SchemaTreeBase implements ISchemaTree {
  private schemaTree: INode;
  private flatTree: IFlattenRowType[];
  constructor(avroSchema) {
    this.schemaTree = parseSchema(avroSchema);
    this.flatTree = FlatSchema(this.schemaTree);
  }

  public getSchemaTree = () => this.schemaTree;
  public getFlatSchema = () => this.flatTree;

  private insertNewIdToOrder = (order = [], referenceId) => {
    const id = uuidV4();
    // +1 to add next to the current element.
    const currentIndexOfChild = order.findIndex((c) => c === referenceId) + 1;
    order = [...order.slice(0, currentIndexOfChild), id, ...order.slice(currentIndexOfChild)];
    return { id, order };
  };
  private addNewEnumSymbol = (tree: INode, fieldId: IFieldIdentifier) => {
    if (!tree.children || (tree.children && !Array.isArray(tree.children.order))) {
      return { tree, newTree: undefined, currentField: undefined };
    }
    const { id = uuidV4(), order = [] } = this.insertNewIdToOrder(
      tree.children.order as string[],
      fieldId.id
    );
    tree.children.order = order;
    tree.children[id] = {
      id,
      internalType: 'enum-symbol',
      typeProperties: {
        symbol: '',
      },
    };
    return { tree, newTree: tree.children[id], currentField: tree.children[fieldId.id] };
  };

  private addNewFieldType = (tree: INode, fieldId: IFieldIdentifier) => {
    if (!tree.children || (tree.children && !Array.isArray(tree.children.order))) {
      return { tree, newTree: undefined, currentField: undefined };
    }
    const { id = uuidV4(), order = [] } = this.insertNewIdToOrder(
      tree.children.order as string[],
      fieldId.id
    );
    tree.children.order = order;
    tree.children[id] = {
      id,
      internalType: 'record-field-simple-type',
      nullable: false,
      type: 'string',
      name: '',
    };
    return { tree, newTree: tree.children[id], currentField: tree.children[fieldId.id] };
  };

  private addNewUnionType = (tree: INode, fieldId: IFieldIdentifier) => {
    if (!tree.children || (tree.children && !Array.isArray(tree.children.order))) {
      return { tree, newTree: undefined, currentField: undefined };
    }
    const { id = uuidV4(), order = [] } = this.insertNewIdToOrder(
      tree.children.order as string[],
      fieldId.id
    );
    tree.children.order = order;
    tree.children[id] = {
      id,
      internalType: 'union-simple-type',
      nullable: false,
      type: 'string',
    };
    return { tree, newTree: tree.children[id], currentField: tree.children[fieldId.id] };
  };

  private addSpecificTypesToTree = (tree: INode, fieldId: IFieldIdentifier) => {
    switch (tree.type) {
      case 'enum':
        return this.addNewEnumSymbol(tree, fieldId);
      case 'schema':
        return this.addNewFieldType(tree, fieldId);
      case 'union':
        return this.addNewUnionType(tree, fieldId);
      default:
        return { tree: undefined, newTree: undefined, currentField: undefined };
    }
  };

  private addToTree = (
    tree: INode,
    fieldId: IFieldIdentifier
  ): {
    tree: INode;
    newTree: INode;
    currentField: INode;
  } => {
    if (!tree) {
      return { tree: undefined, newTree: undefined, currentField: undefined };
    }
    if (fieldId.ancestors.length === 1) {
      return this.addSpecificTypesToTree(tree, fieldId);
    }
    const { tree: child, newTree, currentField } = this.addToTree(
      tree.children[fieldId.ancestors[1]],
      { id: fieldId.id, ancestors: fieldId.ancestors.slice(1) }
    );
    return {
      tree: {
        ...tree,
        children: {
          ...tree.children,
          [child.id]: child,
        },
      },
      newTree,
      currentField,
    };
  };

  private removeFromTree = (tree: INode, fieldId) => {
    if (!tree) {
      return { tree: undefined };
    }
    if (fieldId.ancestors.length === 1) {
      const field = { ...tree.children[fieldId.id] };
      delete tree.children[fieldId.id];
      if (Array.isArray(tree.children.order)) {
        tree.children.order = tree.children.order.filter((id) => id === fieldId.id);
      }
      return { tree, removedField: field };
    }
    const { tree: newTree, removedField } = this.removeFromTree(
      tree.children[fieldId.ancestors[1]],
      { id: fieldId.id, ancestors: fieldId.ancestors.slice(1) }
    );
    return {
      tree: {
        ...tree,
        children: {
          ...tree.children,
          ...newTree,
        },
      },
      removedField,
    };
  };

  private remove = (currentIndex: number) => {
    const matchingEntry = this.flatTree[currentIndex];
    const idObj = { id: matchingEntry.id, ancestors: matchingEntry.ancestors };
    const { tree, removedField } = this.removeFromTree(this.schemaTree, idObj);
    this.schemaTree = tree;
    const childrenInBranch = branchCount(removedField);
    this.flatTree = [
      ...this.flatTree.slice(0, currentIndex),
      ...this.flatTree.slice(currentIndex + 1 + childrenInBranch),
    ];
  };

  private updateTree = (
    tree: INode,
    fieldId: IFieldIdentifier,
    { property, value }: Partial<IOnChangePayload>
  ): {
    tree: INode;
    childrenCount: number;
    newTree: INode;
  } => {
    if (!tree) {
      return { childrenCount: undefined, tree: undefined, newTree: undefined };
    }
    if (fieldId.ancestors.length === 1 && !isEmpty(tree.children[fieldId.id])) {
      tree.children[fieldId.id][property] = value;
      let childrenInBranch = 0;
      let newChildTree: INode;
      if (property === 'type') {
        childrenInBranch = branchCount(tree.children[fieldId.id]);
        tree.children[fieldId.id].children = initChildren(value);
        newChildTree = tree.children[fieldId.id];
        tree.children[fieldId.id].internalType = getInternalType(tree.children[fieldId.id]);
        tree.children[fieldId.id].typeProperties = initTypeProperties(tree.children[fieldId.id]);
      }
      return {
        tree,
        childrenCount: childrenInBranch,
        newTree: newChildTree,
      };
    }

    const { tree: child, childrenCount, newTree } = this.updateTree(
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

  private update = (currentIndex: number, { property, value }: Partial<IOnChangePayload>) => {
    this.flatTree[currentIndex][property] = value;
    const matchingEntry = this.flatTree[currentIndex];
    let result: { tree: INode; childrenCount: number; newTree: INode };
    let newFlatSubTree: IFlattenRowType[];
    const idObj = { id: matchingEntry.id, ancestors: matchingEntry.ancestors };
    result = this.updateTree(this.schemaTree, idObj, { property, value });
    this.schemaTree = result.tree;
    this.flatTree = [
      ...this.flatTree.slice(0, currentIndex),
      ...this.flatTree.slice(currentIndex + result.childrenCount + (!result.newTree ? 0 : 1)),
    ];
    if (result.newTree) {
      newFlatSubTree = FlatSchema(result.newTree, matchingEntry.ancestors);
      this.flatTree = [
        ...this.flatTree.slice(0, currentIndex),
        ...newFlatSubTree,
        ...this.flatTree.slice(currentIndex),
      ];
    }
  };

  private add = (currentIndex) => {
    const matchingEntry = this.flatTree[currentIndex];
    let result: { tree: INode; newTree: INode; currentField: INode };
    let newFlatSubTree: IFlattenRowType[];
    const idObj = { id: matchingEntry.id, ancestors: matchingEntry.ancestors };
    result = this.addToTree(this.schemaTree, idObj);
    newFlatSubTree = FlatSchema(result.newTree, matchingEntry.ancestors);
    this.schemaTree = result.tree;
    const currentFieldBranchCount = branchCount(result.currentField);
    this.flatTree = [
      ...this.flatTree.slice(0, currentIndex + currentFieldBranchCount + 1),
      ...newFlatSubTree,
      ...this.flatTree.slice(currentIndex + currentFieldBranchCount + 1),
    ];
  };

  public onChange = (
    fieldId: IFieldIdentifier,
    currentIndex: number,
    { type, property, value }: IOnChangePayload
  ) => {
    if (isNil(currentIndex) || currentIndex === -1) {
      return;
    }
    switch (type) {
      case 'update':
        this.update(currentIndex, { property, value });
        break;
      case 'add':
        this.add(currentIndex);
        break;
      case 'remove':
        this.remove(currentIndex);
        break;
    }
  };
}
function SchemaTree(avroSchema) {
  const schemaTreeInstance = new SchemaTreeBase(avroSchema);
  return {
    getInstance: () => schemaTreeInstance,
  };
}
export { SchemaTree, INode, ISchemaTree };
