"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Assignment</h1>
      <p>Assignment ID: {assignmentId}</p>
      <button 
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        onClick={() => router.push(`/teacher/assignments/${assignmentId}`)}
      >
        Back to Assignment
      </button>
    </div>
  );
}