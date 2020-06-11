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
import withStyles, { WithStyles, StyleRules } from '@material-ui/core/styles/withStyles';
import ThemeWrapper from 'components/ThemeWrapper';
import {
  SchemaTree,
  INode,
  ISchemaTree,
} from 'components/AbstractWidget/SchemaEditor/Context/SchemaTree';
import { ISchemaType } from 'components/AbstractWidget/SchemaEditor/SchemaTypes';
import {
  IFlattenRowType,
  IFieldIdentifier,
  IOnChangePayload,
} from 'components/AbstractWidget/SchemaEditor/EditorTypes';
import { FieldsList } from 'components/AbstractWidget/SchemaEditor/FieldsList';

const styles = (theme): StyleRules => {
  return {
    container: {
      height: 'auto',
      display: 'grid',
      gridTemplateColumns: '34% ',
    },
    pre: {
      backgroundColor: theme.palette.grey[600],
      padding: '10px',
      borderRadius: '8px',
      margin: '20px',
    },
    schemaContainer: {
      width: 'auto',
      margin: '20px',
      height: 'auto',
      maxWidth: '500px',
      '& >div': {
        padding: '2px 10px',
        display: 'grid',
        minHeight: '36px',
        marginTop: '2px',
      },
    },
  };
};

interface ISchemaEditorProps extends WithStyles<typeof styles> {
  schema: ISchemaType;
  onChange: (props: { tree: INode; flat: IFlattenRowType[] }) => void;
}

interface ISchemaEditorState {
  tree: INode;
  flat: IFlattenRowType[];
}

class SchemaEditor extends React.Component<ISchemaEditorProps, ISchemaEditorState> {
  private schema: ISchemaTree = null;
  constructor(props) {
    super(props);
    this.schema = SchemaTree(this.props.schema).getInstance();
    this.state = {
      flat: this.schema.getFlattedTree(),
      tree: this.schema.getTree(),
    };
  }

  public componentWillReceiveProps(nextProps) {
    this.schema = SchemaTree(nextProps.schema).getInstance();
    this.setState({
      flat: this.schema.getFlattedTree(),
      tree: this.schema.getTree(),
    });
  }

  public onChange = (
    index: number,
    fieldId: IFieldIdentifier,
    onChangePayload: IOnChangePayload
  ) => {
    this.schema.update(fieldId, index, onChangePayload);
    this.setState({
      flat: this.schema.getFlattedTree(),
      tree: this.schema.getTree(),
    });
    this.props.onChange({ tree: this.schema.getTree(), flat: this.schema.getFlattedTree() });
  };
  public render() {
    const { flat } = this.state;
    const { classes } = this.props;
    return (
      <div>
        <div className={classes.schemaContainer}>
          <FieldsList value={flat} onChange={this.onChange} />
        </div>
      </div>
    );
  }
}

const StyledDemo = withStyles(styles)(SchemaEditor);
export default function SchemaEditorWrapper(props) {
  return (
    <ThemeWrapper>
      <StyledDemo {...props} />
    </ThemeWrapper>
  );
}
