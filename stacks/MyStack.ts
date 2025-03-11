import { StackContext, Config } from "sst/constructs";

export const MyStack = ({ stack }: StackContext) => {
  new Config.Parameter(stack, "APP_NAME", { value: "projectmanagementdemmoapp" });
};