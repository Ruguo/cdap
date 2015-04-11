/*
 * Copyright © 2014-2015 Cask Data, Inc.
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
package co.cask.cdap.internal.app.runtime.workflow;

import co.cask.cdap.api.spark.Spark;
import co.cask.cdap.api.spark.SparkSpecification;
import co.cask.cdap.api.workflow.Workflow;
import co.cask.cdap.api.workflow.WorkflowSpecification;
import co.cask.cdap.app.ApplicationSpecification;
import co.cask.cdap.app.program.Program;
import co.cask.cdap.app.runtime.ProgramController;
import co.cask.cdap.app.runtime.ProgramOptions;
import co.cask.cdap.internal.app.runtime.ProgramRunnerFactory;
import co.cask.cdap.internal.app.runtime.spark.SparkProgramController;
import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import org.apache.twill.api.RunId;

import java.util.Map;
import java.util.concurrent.Callable;

/**
 * Creates {@link Callable} for executing {@link Spark} programs from {@link Workflow}.
 */
final class SparkProgramWorkflowRunner extends AbstractProgramWorkflowRunner {

  SparkProgramWorkflowRunner(WorkflowSpecification workflowSpec, ProgramRunnerFactory programRunnerFactory,
                             Program workflowProgram, RunId runId, ProgramOptions workflowProgramOptions) {
    super(runId, workflowProgram, programRunnerFactory, workflowSpec, workflowProgramOptions);
  }

  /**
   * Gets the Specification of the program by its name from the {@link WorkflowSpecification}. Creates an
   * appropriate {@link Program} using this specification through a suitable concrete implementation of
   * {@link AbstractWorkflowProgram} and then gets the {@link Callable} for the program which can be called to
   * execute the program
   *
   * @param name name of the program in the workflow
   * @return {@link Callable} associated with this program run.
   */
  @Override
  public Callable<Map<String, String>> create(String name) {
    ApplicationSpecification spec = workflowProgram.getApplicationSpecification();
    final SparkSpecification sparkSpec = spec.getSpark().get(name);
    Preconditions.checkArgument(sparkSpec != null,
                                "No Spark with name %s found in Workflow %s", name, workflowSpec.getName());

    final Program sparkProgram = new WorkflowSparkProgram(workflowProgram, sparkSpec);
    return getRuntimeContextCallable(name, sparkProgram);
  }

  /**
   * Executes given {@link Program} with the given {@link ProgramOptions} and block until it completed.
   * On completion, currently this always returns the empty {@link Map}.
   *
   * @throws Exception if execution failed.
   */
  @Override
  public Map<String, String> runAndWait(Program program, ProgramOptions options) throws Exception {
    ProgramController controller = programRunnerFactory.create(ProgramRunnerFactory.Type.SPARK).run(program, options);

    if (controller instanceof SparkProgramController) {
      executeProgram(controller, ((SparkProgramController) controller).getContext());
    } else {
      throw new IllegalStateException("Failed to run program. The controller is not an instance of " +
                                        "SparkProgramController");
    }
    // TODO: currently Spark program returns the empty map
    return Maps.newHashMap();
  }
}
