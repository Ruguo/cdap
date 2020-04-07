/*
 * Copyright © 2016 Cask Data, Inc.
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

package io.cdap.cdap.etl.api.batch;

import io.cdap.cdap.api.annotation.Beta;
import io.cdap.cdap.api.data.schema.Schema;
import io.cdap.plugin.common.LineageRecorder;
import org.apache.spark.api.java.JavaRDD;

import java.io.Serializable;
import java.util.List;
import java.util.stream.Collectors;


/**
 * SparkSink composes a final, optional stage of a Batch ETL Pipeline. In addition to configuring the Batch run, it
 * can also perform RDD operations on the key value pairs provided by the Batch run.
 *
 * {@link SparkSink#run} method is called inside the Batch Run while {@link SparkSink#prepareRun} and
 * {@link SparkSink#onRunFinish} methods are called on the client side, which launches the Batch run, before the
 * Batch run starts and after it finishes respectively.
 *
 * @param <IN> The type of input record to the SparkSink.
 */
@Beta
public abstract class SparkSink<IN> extends BatchConfigurable<SparkPluginContext> implements Serializable {

  public static final String PLUGIN_TYPE = "sparksink";

  private static final long serialVersionUID = -8600555200583639593L;

  /**
   * User Spark job which will be executed and is responsible for persisting any data.
   *
   * @param context {@link SparkExecutionPluginContext} for this job
   * @param input the input from previous stages of the Batch run.
   */
  public abstract void run(SparkExecutionPluginContext context, JavaRDD<IN> input) throws Exception;

  /**
   * Record field-level lineage for spark sink plugins (WriteOperation). This method should be called from prepareRun of
   * any spark sink plugin.
   * @param context BatchContext from prepareRun
   * @param outputName name of output dataset
   * @param tableSchema schema of fields. Also used to determine list of field names. Schema and schema.getFields() must
   * not be null.
   * @param operationName name of the operation
   * @param description operation description; complete sentences preferred
   */
  protected void recordLineage(BatchContext context, String outputName, Schema tableSchema, String operationName,
                               String description) {
    LineageRecorder lineageRecorder = new LineageRecorder(context, outputName);
    lineageRecorder.createExternalDataset(tableSchema);
    List<String> fieldNames = tableSchema.getFields().stream().map(Schema.Field::getName).collect(Collectors.toList());
    if (!fieldNames.isEmpty()) {
      lineageRecorder.recordWrite(operationName, description, fieldNames);
    }
  }
}
