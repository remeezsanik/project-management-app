import { SSTConfig } from "sst";
import { MyStack } from "./stacks/MyStack"; // Adjust path if necessary

export default {
  config(_input) {
    return {
      name: "projectmanagementdemmoapp",
      region: "ap-south-1",
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: "nodejs18.x",
    });
    app.stack(MyStack);
  },
} satisfies SSTConfig;