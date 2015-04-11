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

import co.cask.cdap.api.mapreduce.MapReduceContext;
import co.cask.cdap.api.mapreduce.MapReduceSpecification;
import co.cask.cdap.api.workflow.WorkflowSpecification;
import co.cask.cdap.app.ApplicationSpecification;
import co.cask.cdap.app.program.Program;
import co.cask.cdap.app.runtime.ProgramController;
import co.cask.cdap.app.runtime.ProgramOptions;
import co.cask.cdap.internal.app.runtime.ProgramRunnerFactory;
import co.cask.cdap.internal.app.runtime.batch.MapReduceProgramController;
import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import org.apache.hadoop.mapreduce.Counter;
import org.apache.hadoop.mapreduce.CounterGroup;
import org.apache.hadoop.mapreduce.Counters;
import org.apache.hadoop.mapreduce.Job;
import org.apache.twill.api.RunId;

import java.util.Map;
import java.util.concurrent.Callable;

/**
 * A {@link ProgramWorkflowRunner} that creates {@link Callable} for executing MapReduce job from Workflow.
 */
final class MapReduceProgramWorkflowRunner extends AbstractProgramWorkflowRunner {

  MapReduceProgramWorkflowRunner(WorkflowSpecification workflowSpec, ProgramRunnerFactory programRunnerFactory,
                                 Program workflowProgram, RunId runId, ProgramOptions workflowProgramOptions) {
    super(runId, workflowProgram, programRunnerFactory, workflowSpec, workflowProgramOptions);
  }

  /**
   * Gets the Specification of the program by its name from the {@link WorkflowSpecification}. Creates an
   * appropriate {@link Program} using this specification through a suitable concrete implementation of
   * * {@link AbstractWorkflowProgram} and then gets the {@link Callable} for the program
   * which can be called to execute the program
   *
   * @param name name of the program in the workflow
   * @return {@link Callable} associated with this program run.
   */
  @Override
  public Callable<Map<String, String>> create(String name) {
    ApplicationSpecification spec = workflowProgram.getApplicationSpecification();
    final MapReduceSpecification mapReduceSpec = spec.getMapReduce().get(name);
    Preconditions.checkArgument(mapReduceSpec != null,
                                "No MapReduce with name %s found in Application %s", name, spec.getName());

    final Program mapReduceProgram = new WorkflowMapReduceProgram(workflowProgram, mapReduceSpec);
    return getRuntimeContextCallable(name, mapReduceProgram);
  }

  /**
   * Executes given {@link Program} with the given {@link ProgramOptions} and block until it completed.
   * On completion, return the {@link Map} of hadoop counters for the program run.
   *
   * @throws Exception if execution failed.
   */
  @Override
  public Map<String, String> runAndWait(Program program, ProgramOptions options) throws Exception {
    ProgramController controller = programRunnerFactory.create(ProgramRunnerFactory.Type.MAPREDUCE).run(program,
                                                                                                        options);
    if (controller instanceof MapReduceProgramController) {
      MapReduceContext context = ((MapReduceProgramController) controller).getContext();
      executeProgram(controller, context);
      return getCounterMap(context);
    } else {
      throw new IllegalStateException("Failed to run program. The controller is not an instance of " +
                                        "MapReduceProgramController");
    }
  }

  private Map<String, String> getCounterMap(MapReduceContext context) throws Exception {
    Map<String, String> mapCounters = Maps.newHashMap();
    Counters counters = ((Job) context.getHadoopJob()).getCounters();
    for (CounterGroup group : counters) {
      for (Counter counter : group) {
        mapCounters.put(group.getName() + "." + counter.getName(), Long.toString(counter.getValue()));
      }
    }
    return mapCounters;
  }
}
