import { AnimatePresence, motion } from "framer-motion";
import { Project } from "@/types/profile";

interface ProjectListProps {
  projects: Project[];
  emptyMessage: string;
}

export const ProjectList = ({ projects, emptyMessage }: ProjectListProps) => (
  <div className="space-y-4 overflow-y-auto max-h-[400px] pr-4 styled-scrollbar">
    <AnimatePresence>
      {projects.length > 0 ? (
        projects.map((project) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-sm hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-800 text-lg">
              {project.title}
            </h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {project.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                ₹{project.budget.toLocaleString()}
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                Due: {new Date(project.deadline).toLocaleDateString()}
              </span>
              {project.skillsRequired?.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-center py-12 bg-gray-50/50 rounded-xl backdrop-blur-sm"
        >
          {emptyMessage}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
