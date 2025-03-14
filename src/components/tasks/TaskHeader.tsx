import { Button } from "components/button";
import { ListTodo, PlusCircleIcon } from "lucide-react";
import { Card, CardContent } from "components/card";

export function TaskHeader({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <>
      <Card className="mb-6 rounded-2xl border border-white/40 bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white shadow-lg">
                <ListTodo size={30} />
              </div>
              <div className="w-full">
                <h1 className="bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-lg font-bold text-transparent md:text-xl lg:text-3xl">
                  Task Management
                </h1>
              </div>
            </div>
            <Button
              onClick={onCreateClick}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 shadow-md transition-all hover:scale-105 hover:shadow-lg"
            >
              <span className="flex items-center gap-2">
                Create Task <PlusCircleIcon size={16} />
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
