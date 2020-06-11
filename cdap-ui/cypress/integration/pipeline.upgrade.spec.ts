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

import * as Helpers from '../helpers';
import * as pipeline1 from '../fixtures/pipeline1.json';
import {dataCy, generateDraftFromPipeline} from '../helpers';

let headers = {};
describe('Pipeline Upgrade should work fine', () => {
  // Uses API call to login instead of logging in manually through UI
  before(() => {
    Helpers.loginIfRequired().then(() => {
      cy.getCookie('CDAP_Auth_Token').then((cookie) => {
        if (!cookie) {
          return;
        }
        headers = {
          Authorization: 'Bearer ' + cookie.value,
        };
      });
    });
    const stub = cy.stub();
    cy.window().then((win) => {
      win.onbeforeunload = null;
    });
    cy.on('window:confirm', stub);
  });

  beforeEach(() => {
    Helpers.getArtifactsPoll(headers);
  });

  it('should not show upgrade modal on uploading pipeline with valid plugin versions', () => {
    // Go to Pipelines studio
    cy.visit('/cdap/ns/default/pipelines');
    cy.get('#resource-center-btn').click();
    cy.get('#create-pipeline-link').click();
    cy.url().should('include', '/studio');
    cy.upload_pipeline('pipeline1.json', '#pipeline-import-config-link > input[type="file"]').then(
      (subject) => {
        expect(subject.length).to.be.eq(1);
      }
    );
  });

  it('should show upgrade modal on uploading pipeline invalid plugin versions', () => {
    cy.visit('/cdap/ns/default/pipelines');
    cy.get('#resource-center-btn').click();
    cy.get('#create-pipeline-link').click();
    cy.url().should('include', '/studio');
    cy.upload_pipeline(
      'pipeline_old.json',
      '#pipeline-import-config-link > input[type="file"]'
    ).then((subject) => {
      expect(subject.length).to.be.eq(1);
      cy.get('.hydrator-modal.node-config-modal.upgrade-modal');
      cy.should('contain', 'Missing Plugin Artifacts');
      cy.contains('Find Plugin in Hub').click();
      cy.get('.cdap-modal.cask-market');
      cy.contains('Hub');
    });
  });

  it.only("should upgrade pipelines that are saved in drafts", () => {
    cy.visit("/cdap/ns/default/pipelines/drafts");
    const pipelineName = `${pipeline1.name}-${Date.now()}`;
    const pipelineDraft = generateDraftFromPipeline({...pipeline1, name: pipelineName});
    cy.upload_draft_via_api(headers, pipelineDraft).then(resp => {
      console.log("uploaded?", resp);
    });
    cy.get(dataCy(`draft-${pipelineName}`)).should("be.visible");
    cy.get(dataCy(`draft-${pipelineName}`)).click();
    cy.get(dataCy("upgrade-modal-header")).should("contain", "Import Pipeline");
    cy.get(dataCy("upgrade-modal-body")).should(
      "contain",
      "Your pipeline cannot be imported because of the following issues:"
    );
    // cy.get(dataCy('import-error-row-0')).should('contain','Pipeline Artifact');
    cy.get(dataCy('import-error-row-0')).should('contain','File');
    cy.get(dataCy('import-error-row-1')).should('contain','File2');
    cy.get(dataCy('fix-all-btn')).click();
    cy.get(dataCy('plugin-node-File-batchsource-0')).should('be.visible');
    cy.get(dataCy('plugin-node-File-batchsink-1')).should('be.visible');
    cy.get(dataCy('deploy-pipeline-btn')).click();
    cy.get(dataCy('Deployed')).should('be.visible');
  });
});
