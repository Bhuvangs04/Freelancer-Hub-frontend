import { useState, useRef } from "react";
import { Check, Plus, X, Clock, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project, Task, ProjectStatus } from "@/types";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskListProps {
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
}

export default function TaskList({ project, onProjectUpdate }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Safely handle tasks - ensuring we always have an array even if project.tasks is undefined
  const tasks = project?.tasks || [];

  // Group tasks by completion status - safely using our tasks array
  const completedTasks = tasks.filter((task) => task?.completed) || [];
  const pendingTasks = tasks.filter((task) => !task?.completed) || [];

  // Handle adding a task
  const handleAddTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!newTaskTitle.trim()) {
      toast.error("Task title cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.addTask(project._id, { title: newTaskTitle });

      if (response.status === "success" && response.data) {
        onProjectUpdate(response.data);
        setNewTaskTitle("");
        setIsAddingTask(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (status: ProjectStatus) => {
    try {
      setLoading(true);

      const response = await api.updateTaskStatusType(project._id, status);

      if (response.status === "success" && response.data) {
        onProjectUpdate(response.data);
      }
    } catch (error) {
      toast.error("Failed to update project status");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Get status display properties
  const getStatusProps = (status: ProjectStatus = "in-progress") => {
    switch (status) {
      case "in-progress":
        return {
          label: "In Progress",
          color: "bg-blue-100 text-blue-800",
          icon: <Clock size={14} className="mr-1" />,
        };
      case "on-hold":
        return {
          label: "On Hold",
          color: "bg-orange-100 text-orange-800",
          icon: <Clock size={14} className="mr-1 rotate-90" />,
        };
      case "completed":
        return {
          label: "Completed",
          color: "bg-green-100 text-green-800",
          icon: <Check size={14} className="mr-1" />,
        };
      default:
        return {
          label: "Pending",
          color: "bg-yellow-100 text-yellow-800",
          icon: <Clock size={14} className="mr-1" />,
        };
    }
  };

  const statusProps = getStatusProps(project.status as ProjectStatus);

  // Handle task status toggle
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const response = await api.updateTaskStatus(
        project._id,
        taskId,
        completed
      );

      if (response.status === "success" && response.data) {
        onProjectUpdate(response.data);
      }
    } catch (error) {
      toast.error("Failed to update task");
      console.error(error);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await api.deleteTask(project._id, taskId);
      onProjectUpdate(response.data);
    } catch (error) {
      toast.error("Failed to delete task");
      console.error(error);
    }
  };

  // Start adding a task (show input form)
  const startAddingTask = () => {
    setIsAddingTask(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Cancel adding a task (hide input form)
  const cancelAddTask = () => {
    setIsAddingTask(false);
    setNewTaskTitle("");
  };

  // Render a fallback if no project is selected or project data is invalid
  if (!project || !project._id) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border animate-in fade-in">
        <div className="text-center py-6">
          <p className="text-gray-500">
            No project selected or project data is invalid
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger disabled={loading} asChild>
            <button
              className={cn(
                "py-2 px-4 rounded-full text-sm flex items-center transition-all hover:opacity-90",
                statusProps.color
              )}
            >
              {statusProps.icon}
              {statusProps.label}
              <ChevronDown size={16} className="ml-2" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white z-50">
            <DropdownMenuItem
              onClick={() => handleStatusChange("in-progress")}
              className="cursor-pointer flex items-center text-sm"
            >
              <Clock size={14} className="mr-2 text-blue-500" />
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("on-hold")}
              className="cursor-pointer flex items-center text-sm"
            >
              <Clock size={14} className="mr-2 rotate-90 text-orange-500" />
              On Hold
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("completed")}
              className="cursor-pointer flex items-center text-sm"
            >
              <Check size={14} className="mr-2 text-green-500" />
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
        <span className="text-sm text-gray-500">
          {completedTasks.length} of {tasks.length} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
          style={{
            width: `${
              tasks.length > 0
                ? (completedTasks.length / tasks.length) * 100
                : 0
            }%`,
          }}
        ></div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading tasks...</p>
        </div>
      ) : (
        <>
          {/* Show Add Task Input if there are no tasks and no task is being added */}
          {tasks.length === 0 && !isAddingTask ? (
            <div className="text-center py-6">
              <p className="text-gray-500">
                No tasks yet, start by adding your first task.
              </p>
              <button
                onClick={startAddingTask}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
              >
                Add First Task
              </button>
            </div>
          ) : (
            // Add Task Form
            isAddingTask && (
              <form onSubmit={handleAddTask} className="mt-6 flex items-center">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add"}
                </button>
                <button
                  type="button"
                  onClick={cancelAddTask}
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  <X size={18} />
                </button>
              </form>
            )
          )}

          {/* Show Pending and Completed Tasks */}
          <div className="mt-6">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  In Progress
                </h4>
                <ul className="space-y-2">
                  {pendingTasks.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Completed
                </h4>
                <ul className="space-y-2">
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Add Task Button */}
          {!isAddingTask && tasks.length > 0 && (
            <button
              onClick={startAddingTask}
              className="mt-6 flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors group"
            >
              <Plus
                size={16}
                className="mr-2 text-gray-400 group-hover:text-primary transition-colors"
              />
              Add Task
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Task Item Component
interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleToggle = async () => {
    setIsChecking(true);
    await onToggle(task._id, !task.completed);
    setIsChecking(false);
  };

  const handleDelete = () => {
    onDelete(task._id);
  };

  // Format date safely
  const formattedDate = task?.createdAt
    ? format(new Date(task.createdAt), "MMM d")
    : "Unknown date";

  return (
    <li
      className={cn(
        "group flex items-center p-3 rounded-md transition-all",
        task.completed ? "bg-gray-50" : "bg-white hover:bg-gray-50/80"
      )}
    >
      <button
        onClick={handleToggle}
        disabled={isChecking}
        className={cn(
          "flex-shrink-0 h-5 w-5 rounded border transition-colors flex items-center justify-center",
          task.completed
            ? "bg-primary border-primary text-white"
            : "border-gray-300 hover:border-primary",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
      >
        {task.completed && <Check size={12} />}
      </button>

      <span
        className={cn(
          "ml-3 text-sm flex-1 transition-colors",
          task.completed ? "text-gray-500 line-through" : "text-gray-900"
        )}
      >
        {task?.title || "Untitled task"}
      </span>

      <div className="flex items-center text-xs text-gray-400 ml-2">
        <Clock size={12} className="mr-1" />
        <span>{formattedDate}</span>
      </div>

      <button
        onClick={handleDelete}
        className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
};
