"use client";

import React from "react";

const steps = [
  "Document Selection",
  "Scan Document",
  "Upload Document",
  "Photo & Face Match",
  "Review & Status",
];

export default function Stepper({ currentStep }) {
  return (
    <nav className="w-full">
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <li
              key={label}
              className="flex items-center gap-3 sm:flex-1"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors
                    ${isActive ? "bg-blue-600 text-white" : ""}
                    ${!isActive && isCompleted ? "bg-blue-100 text-blue-700" : ""}
                    ${!isActive && !isCompleted ? "border border-slate-300 bg-white text-slate-500" : ""}
                  `}
                >
                  {stepNumber}
                </div>
                <span
                  className={`text-xs sm:text-sm font-medium transition-colors
                    ${isActive ? "text-slate-900" : "text-slate-500"}
                  `}
                >
                  {label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden flex-1 border-t border-dashed border-slate-300 sm:block" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
