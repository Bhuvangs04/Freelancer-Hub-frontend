interface ProgressBarProps {
    progress: number;
  }
  
  export const ProgressBar = ({ progress }: ProgressBarProps) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary rounded-full h-2 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };