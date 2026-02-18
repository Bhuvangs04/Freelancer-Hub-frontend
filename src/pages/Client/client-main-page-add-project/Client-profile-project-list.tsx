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
        projects.map((project, i) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all duration-300 bg-white/40 hover:bg-white/70 shadow-sm hover:shadow-lg group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                {project.title}
              </h3>
              <span className="px-3 py-1 bg-white text-gray-700 rounded-full text-xs font-medium border border-gray-200 shadow-sm">
                ₹{project.budget.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
              {project.description}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                Due: {new Date(project.deadline).toLocaleDateString()}
              </span>
              {project.skillsRequired?.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs border border-gray-200"
                >
                  {skill}
                </span>
              ))}
              {project.skillsRequired?.length > 3 && (
                <span className="text-xs text-gray-400">+{project.skillsRequired.length - 3} more</span>
              )}
            </div>
          </motion.div>
        ))
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
            className="text-gray-500 text-center py-12 bg-white/40 rounded-2xl border border-gray-200 border-dashed"
        >
          {emptyMessage}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
