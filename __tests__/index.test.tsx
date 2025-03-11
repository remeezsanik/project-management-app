import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router"; // Will use the mock automatically
import Home from "../pages/home";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import "@testing-library/jest-dom";

// Mock the modules
jest.mock("next-auth/react");
jest.mock("@supabase/supabase-js");
jest.mock("sonner");

// Mock data
const mockTasks = [
  {
    id: "1",
    title: "Complete unit tests",
    description: "Write comprehensive tests for the task manager",
    priority: "High",
    status: "Todo",
    deadline: new Date("2025-04-01"),
    assignedTo: "user1",
    assignedToUser: { id: "user1", name: "Test User", image: "/avatar.png" },
    tags: ["Testing", "Development"],
    createdAt: new Date("2025-03-01"),
  },
  {
    id: "2",
    title: "Review code",
    description: "Review pull requests",
    priority: "Medium",
    status: "InProgress",
    deadline: new Date("2025-03-15"),
    assignedTo: "user2",
    assignedToUser: { id: "user2", name: "Another User", image: null },
    tags: ["Code Review"],
    createdAt: new Date("2025-03-02"),
  },
  {
    id: "3",
    title: "Deploy application",
    description: "Deploy to production",
    priority: "Low",
    status: "Done",
    deadline: new Date("2025-03-05"),
    assignedTo: "user1",
    assignedToUser: { id: "user1", name: "Test User", image: "/avatar.png" },
    tags: ["Deployment"],
    createdAt: new Date("2025-03-03"),
  },
];

const mockUsers = [
  { id: "user1", name: "Test User", image: "/avatar.png" },
  { id: "user2", name: "Another User", image: null },
];

const mockTags = [
  { name: "Testing" },
  { name: "Development" },
  { name: "Code Review" },
  { name: "Deployment" },
];

// Mock implementations
const mockSupabaseSelect = jest.fn();
const mockSupabaseInsert = jest.fn();
const mockSupabaseUpdate = jest.fn();
const mockSupabaseDelete = jest.fn();
const mockSupabaseEq = jest.fn();
const mockSupabaseSingle = jest.fn();
const mockSupabaseFrom = jest.fn().mockImplementation(() => ({
  select: mockSupabaseSelect,
  insert: mockSupabaseInsert,
  update: mockSupabaseUpdate,
  delete: mockSupabaseDelete,
  eq: mockSupabaseEq,
  single: mockSupabaseSingle,
}));

// Setup before tests
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();

  // Mock useSession - added this implementation
  (useSession as jest.Mock).mockReturnValue({
    data: { user: { id: "user1", name: "Test User" } },
    status: "authenticated",
  });

  // Mock Supabase client
  (createClient as jest.Mock).mockReturnValue({
    from: mockSupabaseFrom,
  });

  // Mock Supabase responses
  mockSupabaseSelect.mockReturnValue({
    eq: mockSupabaseEq,
    single: mockSupabaseSingle,
  });

  mockSupabaseEq.mockReturnValue({
    single: mockSupabaseSingle,
  });

  // Setup successful responses for tasks, users, and tags
  mockSupabaseSelect.mockImplementation((field) => {
    if (!field) {
      return {
        data: mockTasks,
        error: null,
      };
    }
    return {
      eq: mockSupabaseEq,
      single: mockSupabaseSingle,
    };
  });

  mockSupabaseSingle.mockReturnValue({
    data: mockUsers[0],
    error: null,
  });

  // Mock responses for specific queries
  mockSupabaseFrom.mockImplementation((table) => {
    if (table === "tasks") {
      return {
        select: () => ({
          data: mockTasks,
          error: null,
        }),
        insert: mockSupabaseInsert,
        update: mockSupabaseUpdate,
        delete: mockSupabaseDelete,
        eq: mockSupabaseEq,
      };
    }
    if (table === "User") {
      return {
        select: () => ({
          data: mockUsers,
          error: null,
        }),
        eq: mockSupabaseEq,
      };
    }
    if (table === "tags") {
      return {
        select: () => ({
          data: mockTags,
          error: null,
        }),
      };
    }
    return {
      select: mockSupabaseSelect,
      insert: mockSupabaseInsert,
      update: mockSupabaseUpdate,
      delete: mockSupabaseDelete,
      eq: mockSupabaseEq,
    };
  });

  // Mock insert, update, delete responses
  mockSupabaseInsert.mockReturnValue({
    select: () => ({
      data: [{ ...mockTasks[0], id: "4" }],
      error: null,
    }),
  });

  mockSupabaseUpdate.mockReturnValue({
    eq: () => ({
      data: null,
      error: null,
    }),
  });

  mockSupabaseDelete.mockReturnValue({
    eq: () => ({
      data: null,
      error: null,
    }),
  });

  // Mock toast
  (toast.success as jest.Mock).mockImplementation(() => {});
  (toast.error as jest.Mock).mockImplementation(() => {});
});

describe("Home Component", () => {
  test("renders login page when user is not authenticated", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
    });

    render(<Home />);

    expect(screen.getByText("Please sign in")).toBeInTheDocument();
    expect(
      screen.getByText("You need to be signed in to view and manage tasks"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("renders task management dashboard when user is authenticated", async () => {
    render(<Home />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Task Management")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create task/i }),
      ).toBeInTheDocument();
    });

    // Check if all status columns are rendered
    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByText("InProgress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();

    // Check if tasks are rendered
    expect(screen.getByText("Complete unit tests")).toBeInTheDocument();
    expect(screen.getByText("Review code")).toBeInTheDocument();
    expect(screen.getByText("Deploy application")).toBeInTheDocument();
  });

  test("opens create task dialog when create task button is clicked", async () => {
    render(<Home />);

    // Wait for component to load
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /create task/i }),
      ).toBeInTheDocument();
    });

    // Click create task button
    fireEvent.click(screen.getByRole("button", { name: /create task/i }));

    // Check if dialog is open
    await waitFor(() => {
      expect(screen.getByText("Create New Task")).toBeInTheDocument();
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
      expect(screen.getByLabelText("Priority")).toBeInTheDocument();
      expect(screen.getByLabelText("Deadline")).toBeInTheDocument();
      expect(screen.getByLabelText("Assign To")).toBeInTheDocument();
      expect(screen.getByLabelText("Tags")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /add task/i }),
      ).toBeInTheDocument();
    });
  });

  test("filters tasks when filters are applied", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Complete unit tests")).toBeInTheDocument();
      expect(screen.getByText("Review code")).toBeInTheDocument();
      expect(screen.getByText("Deploy application")).toBeInTheDocument();
    });

    // Open status filter
    const comboBoxes = screen.getAllByRole("combobox");
    if (comboBoxes.length > 0) {
      await user.click(comboBoxes[0]!);
    }

    // Select "Done" status
    const doneOption = screen.getByRole("option", { name: "Done" });
    await user.click(doneOption);

    // Check if only "Done" tasks are visible
    await waitFor(() => {
      expect(screen.queryByText("Complete unit tests")).toBeNull();
      expect(screen.queryByText("Review code")).not.toBeInTheDocument();
      expect(screen.getByText("Deploy application")).toBeInTheDocument();
    });

    // Clear filters
    await user.click(screen.getByRole("button", { name: /clear filters/i }));

    // Check if all tasks are visible again
    await waitFor(() => {
      expect(screen.getByText("Complete unit tests")).toBeInTheDocument();
      expect(screen.getByText("Review code")).toBeInTheDocument();
      expect(screen.getByText("Deploy application")).toBeInTheDocument();
    });
  });

  test("creates a new task successfully", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Wait for component to load
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /create task/i }),
      ).toBeInTheDocument();
    });

    // Click create task button
    await user.click(screen.getByRole("button", { name: /create task/i }));

    // Fill out the form
    await waitFor(() => {
      expect(screen.getByText("Create New Task")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Title"), "New Test Task");
    await user.type(
      screen.getByLabelText("Description"),
      "This is a test task created by the test suite",
    );

    // Select priority
    await user.click(screen.getByLabelText("Priority"));
    await user.click(screen.getByRole("option", { name: "High" }));

    // Set deadline
    await user.type(screen.getByLabelText("Deadline"), "2025-04-15");

    // Submit form
    await user.click(screen.getByRole("button", { name: /add task/i }));

    // Check if Supabase insert was called
    await waitFor(() => {
      expect(mockSupabaseInsert).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Task Created Successfully");
    });
  });

  test("updates task status when action buttons are clicked", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Complete unit tests")).toBeInTheDocument();
    });

    // Click "Start Task" button for Todo task
    const startTaskButton = screen.getByRole("button", { name: /start task/i });
    await user.click(startTaskButton);

    // Check if Supabase update was called
    await waitFor(() => {
      expect(mockSupabaseUpdate).toHaveBeenCalledWith({ status: "InProgress" });
    });
  });

  test("deletes a task when delete button is clicked and confirmed", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Complete unit tests")).toBeInTheDocument();
    });

    // Find and click the delete button (first task)
    const deleteButtons = screen.getAllByRole("button", { name: "" });
    const deleteButton = deleteButtons.find((button) =>
      button.innerHTML.includes("Trash"),
    );

    await user.click(deleteButton!);

    // Check if delete confirmation dialog is shown
    await waitFor(() => {
      expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
      expect(
        screen.getByText("Are you sure you want to delete this task?"),
      ).toBeInTheDocument();
    });

    // Confirm deletion
    await user.click(screen.getByRole("button", { name: /delete/i }));

    // Check if Supabase delete was called
    await waitFor(() => {
      expect(mockSupabaseDelete).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Task Deleted Successfully");
    });
  });

  test("edits a task when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Complete unit tests")).toBeInTheDocument();
    });

    // Find and click the edit button (first task)
    const editButtons = screen.getAllByRole("button", { name: "" });
    const editButton = editButtons.find((button) =>
      button.innerHTML.includes("Edit"),
    );

    await user.click(editButton!);

    // Check if edit dialog is shown with task data
    await waitFor(() => {
      expect(screen.getByText("Edit Task")).toBeInTheDocument();

      // Check if form is pre-filled with task data
      const titleInput = screen.getByLabelText("Title") as HTMLInputElement;
      expect(titleInput.value).toBe("Complete unit tests");

      const descriptionInput = screen.getByLabelText(
        "Description",
      ) as HTMLTextAreaElement;
      expect(descriptionInput.value).toBe(
        "Write comprehensive tests for the task manager",
      );
    });

    // Edit title
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Updated task title");

    // Submit form
    await user.click(screen.getByRole("button", { name: /update task/i }));

    // Check if Supabase update was called
    await waitFor(() => {
      expect(mockSupabaseUpdate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Task Updated Successfully");
    });
  });

  test("shows error toast when Supabase operations fail", async () => {
    // Mock a Supabase error
    mockSupabaseDelete.mockReturnValue({
      eq: () => {
        throw new Error("Supabase error");
      },
    });

    const user = userEvent.setup();
    render(<Home />);

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Complete unit tests")).toBeInTheDocument();
    });

    // Find and click the delete button (first task)
    const deleteButtons = screen.getAllByRole("button", { name: "" });
    const deleteButton = deleteButtons.find((button) =>
      button.innerHTML.includes("Trash"),
    );

    await user.click(deleteButton!);

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText("Confirm Deletion")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /delete/i }));

    // Check if error toast was shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to delete task");
    });
  });
});
