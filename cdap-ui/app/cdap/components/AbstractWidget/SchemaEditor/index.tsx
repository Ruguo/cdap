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
import { FieldType } from 'components/AbstractWidget/SchemaEditor/FieldType';
import { UnionType } from 'components/AbstractWidget/SchemaEditor/UnionType';
import { MapType } from 'components/AbstractWidget/SchemaEditor/MapType';
import { EnumType } from 'components/AbstractWidget/SchemaEditor/EnumType';
import { ArrayType } from 'components/AbstractWidget/SchemaEditor/ArrayType';
import Paper from '@material-ui/core/Paper';
import { SchemaContext } from 'components/AbstractWidget/SchemaEditor/Context';
import { SchemaTree } from 'components/AbstractWidget/SchemaEditor/Context/SchemaTree';
import JSONEditor from 'components/AbstractWidget/CodeEditorWidget/JsonEditorWidget';

const styles = (theme): StyleRules => {
  return {
    container: {
      height: 'auto',
      display: 'grid',
      gridTemplateColumns: '75%',
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

interface ISchemaEditorProps extends WithStyles<typeof styles> {}

const RenderSubType = ({ field }) => {
  switch (field.internalType) {
    case 'record-field-simple-type':
    case 'record-field-complex-type-root':
      return <FieldType field={field} />;
    case 'array-simple-type':
    case 'array-complex-type':
    case 'array-complex-type-root':
      return <ArrayType field={field} />;
    case 'enum-symbol':
      return <EnumType field={field} />;
    case 'map-keys-complex-type-root':
    case 'map-keys-simple-type':
    case 'map-values-complex-type-root':
    case 'map-values-simple-type':
      return <MapType field={field} />;
    case 'union-simple-type':
    case 'union-complex-type-root':
      return <UnionType field={field} />;
    default:
      return null;
  }
};

function SchemaEditor({ classes }: ISchemaEditorProps) {
  console.log('Rendering schema editor');
  return (
    <SchemaContext.Consumer>
      {({ state }) => {
        const { flatSchema, schemaTree } = state;
        return (
          <React.Fragment>
            <h1>Schema Editor</h1>
            <div className={classes.container}>
              <div className={classes.schemaContainer}>
                {flatSchema.map((field) => {
                  return <RenderSubType field={field} key={field.id} />;
                })}
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
      }}
    </SchemaContext.Consumer>
  );
}

const StyledDemo = withStyles(styles)(SchemaEditor);
export default function SchemaEditorWrapper(props) {
  return (
    <ThemeWrapper>
      <StyledDemo {...props} />
    </ThemeWrapper>
  );
}
