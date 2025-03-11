import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// lib/index.js
import * as sst from "@serverless-stack/resources";
var MyStack = class extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
  }
};
__name(MyStack, "MyStack");
export {
  MyStack as default
};
//# sourceMappingURL=index.js.map
