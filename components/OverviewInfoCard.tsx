interface Props {
  title: string;
  description: string;
  variant?: "blue" | "green" | "purple" | "orange";
}

export default function OverviewInfoCard({
  title,
  description,
  variant = "blue",
}: Props) {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border-blue-200 dark:border-blue-700/50 text-blue-900 dark:text-blue-100",
    green:
      "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border-green-200 dark:border-green-700/50 text-green-900 dark:text-green-100",
    purple:
      "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 border-purple-200 dark:border-purple-700/50 text-purple-900 dark:text-purple-100",
    orange:
      "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 border-orange-200 dark:border-orange-700/50 text-orange-900 dark:text-orange-100",
  };

  const descriptionClasses = {
    blue: "text-blue-600 dark:text-blue-300",
    green: "text-green-600 dark:text-green-300",
    purple: "text-purple-600 dark:text-purple-300",
    orange: "text-orange-600 dark:text-orange-300",
  };

  return (
    <div
      className={`flex flex-col text-center p-4 rounded-sm flex-1 border ${colorClasses[variant]} h-24`}
    >
      <h3 className="font-bold">{title}</h3>
      <p className={descriptionClasses[variant]}>{description}</p>
    </div>
  );
}
