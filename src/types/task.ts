export type Task = {
    id: string;
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    status: "Todo" | "InProgress" | "Done";
    deadline?: Date;
    assignedTo?: string;
    assignedToUser?: { id: string; name: string; image?: string };
    tags?: string[];
    createdAt: Date;
  };
  
  export type UserType = {
    id: string;
    name: string;
    image?: string;
  };
  
  export type FormErrors = {
    title?: string;
    priority?: string;
    deadline?: string;
    assignedTo?: string;
  };