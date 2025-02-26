import { useEffect } from "react";

const SecurityLayer = () => {
  useEffect(() => {
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    const disableShortcuts = (event) => {
      if (
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && event.key === "I") ||
        (event.ctrlKey && event.key === "U") ||
        (event.ctrlKey && event.key === "S") ||
        (event.ctrlKey && event.shiftKey && event.key === "J")
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", disableShortcuts);

    const detectDevTools = setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > 200 ||
        window.outerWidth - window.innerWidth > 200
      ) {
        document.body.innerHTML = "<h1>DevTools Detected! Access Denied.</h1>";
      }
    }, 1000);

    return () => {
      document.removeEventListener("keydown", disableShortcuts);
      document.removeEventListener("contextmenu", (event) =>
        event.preventDefault()
      );
      clearInterval(detectDevTools);
    };
  }, []);

  return null;
};

export default SecurityLayer;
