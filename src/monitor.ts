/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CustomOptionsType } from './types';
import { JSErrors, PromiseErrors, AjaxErrors, ResourceErrors, VueErrors } from './errors/index';
import Performance from './performance/index';

const ClientMonitor = {
  customOptions: {
    jsErrors: true, // vue, js and promise errors
    apiErrors: true,
    resourceErrors: true,
    autoTracePerf: true, // trace performance detail
    useFmp: false, // use first meaningful paint
    enableSPA: false,
    autoSendPerf: true,
  } as CustomOptionsType,

  register(configs: CustomOptionsType) {
    this.customOptions = {
      ...this.customOptions,
      ...configs,
    };
    this.errors(configs);
    if (this.customOptions.autoSendPerf) {
      this.performance();
    }
  },
  performance() {
    // trace and report perf data and pv to serve when page loaded
    if (document.readyState === 'complete') {
      Performance.recordPerf(this.customOptions);
    } else {
      window.addEventListener('load', () => {
        Performance.recordPerf(this.customOptions);
      }, false);
    }
    if (this.customOptions.enableSPA) {
      // hash router
      window.addEventListener('hashchange', () => {
        Performance.recordPerf(this.customOptions);
      }, false);
    }
  },
  errors(options: CustomOptionsType) {
    const { service, reportUrl, pagePath, serviceVersion } = options;

    if (this.customOptions.jsErrors) {
      JSErrors.handleErrors({reportUrl, service, pagePath, serviceVersion});
      PromiseErrors.handleErrors({reportUrl, service, pagePath, serviceVersion});
      if (this.customOptions.vue) {
        VueErrors.handleErrors({reportUrl, service, pagePath, serviceVersion}, this.customOptions.vue);
      }
    }
    if (this.customOptions.apiErrors) {
      AjaxErrors.handleError({reportUrl, service, pagePath, serviceVersion});
    }
    if (this.customOptions.resourceErrors) {
      ResourceErrors.handleErrors({reportUrl, service, pagePath, serviceVersion});
    }
  },
  setPerformance(configs: CustomOptionsType) {
    // history router
    this.customOptions = {
      ...this.customOptions,
      ...configs,
    };
    this.performance();
  },
};

export default ClientMonitor;
