import { RouterProvider } from "react-router-dom";
import { router } from "@/pages";

export default function App() {
  return <RouterProvider router={router} />;
}
