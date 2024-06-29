import { useEffect, useState } from "react";

type AlertProps = {
  message: string;
  type: "success" | "error" | "info" | "warning";
};

const AlertNotification = ({ message, type }: AlertProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const baseClasses = "p-4 rounded-md mb-4";
  let alertClasses = "";

  switch (type) {
    case "success":
      alertClasses = "bg-green-100 text-green-800";
      break;
    case "error":
      alertClasses = "bg-red-100 text-red-800";
      break;
    case "info":
      alertClasses = "bg-blue-100 text-blue-800";
      break;
    case "warning":
      alertClasses = "bg-yellow-100 text-yellow-800";
      break;
    default:
      alertClasses = "bg-gray-100 text-gray-800";
      break;
  }

  return (
    <div className={`${baseClasses} ${alertClasses} absolute bottom-0 right-0`}>
      {message}
    </div>
  );
};

export default AlertNotification;
