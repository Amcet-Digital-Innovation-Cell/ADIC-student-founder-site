import { redirect } from "next/navigation";

// There is a single common login page for all roles; this legacy route just forwards to it.
// (Safe to delete this file/folder.)
export default function EdcLoginRedirect() {
  redirect("/login");
}
