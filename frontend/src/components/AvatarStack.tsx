import React from "react";
import { User } from "lucide-react";
import { useUserProfiles } from "../contexts/UserProfilesContext";

interface AvatarStackProps {
  assignees?: string[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  onManageClick?: () => void;
}

const BG_COLORS = [
  "bg-[#143109] text-[#F7F7F7] border-[#F7F7F7]",
  "bg-[#AAAE7F] text-[#143109] border-[#F7F7F7]",
  "bg-[#D0D6B3] text-[#143109] border-[#F7F7F7]",
  "bg-slate-700 text-slate-100 border-[#F7F7F7]",
  "bg-amber-800 text-amber-100 border-[#F7F7F7]",
];

export function getInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return "U";
  const clean = nameOrEmail.split("@")[0].trim();
  const parts = clean.split(/[._\s-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  assignees = [],
  maxDisplay = 3,
  size = "sm",
  className = "",
  onManageClick,
}) => {
  const { getProfileName } = useUserProfiles();

  if (!assignees || assignees.length === 0) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={onManageClick}
          className="inline-flex items-center space-x-1 text-xs text-[#143109]/70 dark:text-slate-400 hover:text-[#143109] dark:hover:text-slate-200 bg-[#EFEFEF] dark:bg-slate-800 border border-[#AAAE7F]/40 px-2 py-1 rounded-full transition-colors cursor-pointer"
          title="Przypisz użytkowników"
        >
          <User className="w-3.5 h-3.5" />
          <span>Przypisz</span>
        </button>
      </div>
    );
  }

  const visibleAssignees = assignees.slice(0, maxDisplay);
  const extraCount = assignees.length - maxDisplay;

  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-7 h-7 text-xs",
    lg: "w-9 h-9 text-sm",
  }[size];

  return (
    <div 
      className={`inline-flex items-center -space-x-2 overflow-hidden py-0.5 relative group cursor-pointer ${className}`}
      onClick={(e) => {
        if (onManageClick) {
          e.stopPropagation();
          e.preventDefault();
          onManageClick();
        }
      }}
      title={`Przypisani (${assignees.length})`}
    >
      {visibleAssignees.map((assignee, idx) => {
        const name = getProfileName(assignee) || assignee;
        const initials = getInitials(name);
        const colorClass = BG_COLORS[idx % BG_COLORS.length];
        
        return (
          <div
            key={`${assignee}-${idx}`}
            className={`inline-flex items-center justify-center rounded-full font-bold border-2 ${sizeClasses} ${colorClass} shadow-xs ring-1 ring-black/5 transition-transform hover:scale-110 hover:z-20`}
            title={name}
          >
            {initials}
          </div>
        );
      })}

      {extraCount > 0 && (
        <div className={`inline-flex items-center justify-center rounded-full font-bold border-2 bg-[#EFEFEF] dark:bg-slate-800 text-[#143109] dark:text-[#AAAE7F] border-[#F7F7F7] ${sizeClasses} shadow-xs ring-1 ring-black/5 z-10`}>
          +{extraCount}
        </div>
      )}
    </div>
  );
};
