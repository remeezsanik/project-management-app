import { APIGatewayEvent } from "aws-lambda";

export async function create(event: APIGatewayEvent) {
  const body = JSON.parse(event.body || "{}");

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Task Created", task: body }),
  };
}

export async function list() {
  return {
    statusCode: 200,
    body: JSON.stringify({ tasks: [{ id: 1, name: "Sample Task" }] }),
  };
}
