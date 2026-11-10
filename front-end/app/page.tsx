import { redirect } from "next/navigation";

export default function Home() {
  // TODO: Redirigir a login si no autenticado, o al dashboard si autenticado
  redirect("/evaluation");
}
