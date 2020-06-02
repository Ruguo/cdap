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
import Paper from '@material-ui/core/Paper';
import { SchemaContext } from 'components/AbstractWidget/SchemaEditor/Context';
import { SchemaTree, INode } from 'components/AbstractWidget/SchemaEditor/Context/SchemaTree';
import JSONEditor from 'components/AbstractWidget/CodeEditorWidget/JsonEditorWidget';
import {
  ISchemaType,
  IFlattenRowType,
  IFieldIdentifier,
} from 'components/AbstractWidget/SchemaEditor/SchemaTypes';
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
}

interface ISchemaEditorState {
  tree: INode;
  flat: IFlattenRowType[];
}

class SchemaEditor extends React.Component<ISchemaEditorProps, ISchemaEditorState> {
  constructor(props) {
    super(props);
    const schema = SchemaTree(this.props.schema);
    this.state = {
      flat: schema.flat(),
      tree: schema.tree(),
    };
  }

  public onChange = (fieldId: IFieldIdentifier, property, value) => {
    console.log(
      this.state.flat.map((row) => {
        if (row.id === fieldId.id) {
          return {
            ...row,
            [property]: value,
          };
        }
        return row;
      })
    );
  };
  public render() {
    console.log('Rendering schema editor');
    const { flat, tree } = this.state;
    const { classes } = this.props;
    return (
      <React.Fragment>
        <h1>Schema Editor</h1>
        <div>
          <div className={classes.schemaContainer}>
            <FieldsList value={flat} onChange={this.onChange} />
          </div>
          {/* <Paper elevation={2} className={classes.pre}>
            <pre>{JSON.stringify(flatSchema, null, 2)}</pre>
          </Paper>
          <Paper elevation={2} className={classes.pre}>
            <JSONEditor value={JSON.stringify(schemaTree, null, 2)} rows={300} />
          </Paper> */}
        </div>
      </React.Fragment>
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
