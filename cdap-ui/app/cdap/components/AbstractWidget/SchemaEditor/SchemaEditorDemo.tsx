/*
 * Copyright © 2019 Cask Data, Inc.
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
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import simpleSchema from 'components/AbstractWidget/SchemaEditor/data/simpleSchema';
import { complex1, complex2 } from 'components/AbstractWidget/SchemaEditor/data/complexSchema';
import SchemaEditor from 'components/AbstractWidget/SchemaEditor';
import { SchemaContext, SchemaProvider } from 'components/AbstractWidget/SchemaEditor/Context';
import { objectQuery } from 'services/helpers';

const schemas = {
  simple1: simpleSchema,
  complex1,
  complex2,
};
export default function SchemaEditorDemo() {
  const [value, setValue] = React.useState('complex1');
  const handleChange = (setSchema, event) => {
    const { value: radioValue } = event.target;
    setValue(radioValue);
    setSchema(schemas[radioValue]);
  };

  return (
    <SchemaProvider>
      <FormControl component="fieldset">
        <SchemaContext.Consumer>
          {({ setSchema }) => {
            return (
              <RadioGroup
                aria-label="position"
                name="position"
                value={value}
                onChange={handleChange.bind(null, setSchema)}
                row
              >
                {Object.keys(schemas).map((s, i) => {
                  return (
                    <FormControlLabel
                      key={i}
                      value={s}
                      control={<Radio color="primary" />}
                      label={s}
                      labelPlacement="start"
                    />
                  );
                })}
              </RadioGroup>
            );
          }}
        </SchemaContext.Consumer>
      </FormControl>
      <SchemaEditor />
    </SchemaProvider>
  );
}
